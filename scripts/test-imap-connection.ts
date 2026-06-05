// Validation de la connexion IMAP (LWS) — liste les 10 derniers mails de l'INBOX.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/test-imap-connection.ts
import { ImapFlow } from 'imapflow'

const host = process.env.IMAP_HOST
const user = process.env.IMAP_USER
const password = process.env.IMAP_PASSWORD
const port = Number(process.env.IMAP_PORT || 993)
if (!host || !user || !password) throw new Error('Variables manquantes: IMAP_HOST, IMAP_USER, IMAP_PASSWORD')

const client = new ImapFlow({ host, port, secure: true, auth: { user, pass: password }, logger: false })
await client.connect()
const lock = await client.getMailboxLock('INBOX')
try {
  const status = await client.status('INBOX', { messages: true })
  console.log(`Connecté à ${host} — INBOX contient ${status.messages} message(s).`)
  const total = status.messages ?? 0
  const start = Math.max(1, total - 9)
  for await (const msg of client.fetch(`${start}:*`, { envelope: true })) {
    const from = msg.envelope?.from?.[0]
    console.log(`- ${msg.envelope?.date?.toISOString().slice(0, 10)} | ${from?.address} | ${msg.envelope?.subject}`)
  }
} finally {
  lock.release()
  await client.logout().catch(() => client.close())
}
