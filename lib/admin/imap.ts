// Lecture IMAP de la boîte qui reçoit les réponses des candidats (LWS).
// Seul fichier du projet qui parle IMAP — consommé par releverReponsesGP().
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

function imapEnv() {
  const host = process.env.IMAP_HOST
  const user = process.env.IMAP_USER
  const password = process.env.IMAP_PASSWORD
  const port = Number(process.env.IMAP_PORT || 993)
  if (!host || !user || !password) throw new Error('Variables manquantes: IMAP_HOST, IMAP_USER, IMAP_PASSWORD')
  return { host, port, user, password }
}

export interface ReplyQuery {
  email: string  // adresse de candidature du candidat
  since?: Date   // borne basse (date de la demande GP)
}

/** Pour chaque expéditeur, texte du mail le plus récent reçu de sa part
 *  (clé = email en minuscules ; absent de la Map si aucune réponse).
 *  Une seule connexion pour tout le lot. */
export async function fetchLatestReplyTextFrom(queries: ReplyQuery[]): Promise<Map<string, string>> {
  const { host, port, user, password } = imapEnv()
  const client = new ImapFlow({ host, port, secure: true, auth: { user, pass: password }, logger: false })
  const replies = new Map<string, string>()
  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      for (const q of queries) {
        const criteria: { from: string; since?: Date } = { from: q.email }
        if (q.since) criteria.since = q.since
        // search() returns number[] | false — false means the server returned no result set
        const uids = await client.search(criteria, { uid: true })
        if (!uids || uids.length === 0) continue
        const latest = Math.max(...uids)
        const msg = await client.fetchOne(String(latest), { source: true }, { uid: true })
        if (!msg || !msg.source) continue
        const parsed = await simpleParser(msg.source)
        // text/plain en priorité ; fallback HTML grossièrement détaggé (suffisant pour une regex d'adresses).
        const text = parsed.text || (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]+>/g, ' ') : '')
        replies.set(q.email.toLowerCase(), text)
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout().catch(() => client.close())
  }
  return replies
}
