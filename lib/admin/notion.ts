// Accès direct API Notion — mêmes conventions que app/api/beta/route.ts.

const NOTION_VERSION = '2022-06-28'

export type StatutCandidature =
  | 'Nouveau' | 'En cours' | 'En attente' | 'Accepté' | 'Refusé'
  | 'Invité Google Play' | 'Actif' | 'Inactif'

export interface Candidature {
  id: string
  notionUrl: string
  prenom: string
  email: string
  region: string
  bateau: string
  plateforme: string
  frequence: string
  pratique: string
  typeNav: string
  statut: StatutCandidature | ''
  motifRefus: string
  canal: string
  canalAutre: string
  priorite: string
  dateCandidature: string   // ISO ou ''
  emailGooglePlay: string
  exportGooglePlay: boolean
  invitationEnvoyee: boolean
  dateInvitation: string    // ISO ou ''
  lienEnvoye: boolean
  relanceEnvoyee: boolean
  dateRelance: string       // ISO ou ''
  emailGPDemande: boolean
  dateDemandeGP: string     // ISO ou ''
  retoursCount: number
}

export interface Feedback {
  id: string
  notionUrl: string
  email: string
  date: string
  typeRetour: string
  spot: string
  description: string
  attendu: string
  statut: string
  impact: string
  priorite: string
  versionApp: string
}

function notionEnv() {
  const token = process.env.NOTION_TOKEN
  const betaDb = process.env.NOTION_BETA_DB_ID
  const feedbackDb = process.env.NOTION_FEEDBACK_DB_ID
  if (!token || !betaDb || !feedbackDb) {
    throw new Error('Variables manquantes: NOTION_TOKEN, NOTION_BETA_DB_ID, NOTION_FEEDBACK_DB_ID')
  }
  return { token, betaDb, feedbackDb }
}

async function notionFetch(path: string, init?: RequestInit): Promise<unknown> {
  const { token } = notionEnv()
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
      ...init?.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── Extracteurs de propriétés (shapes API Notion) ─────────────────────────────

type Props = Record<string, any>

const text = (p: Props, name: string): string =>
  (p[name]?.rich_text ?? []).map((t: any) => t.plain_text).join('')
const title = (p: Props, name: string): string =>
  (p[name]?.title ?? []).map((t: any) => t.plain_text).join('')
const sel = (p: Props, name: string): string => p[name]?.select?.name ?? ''
const email = (p: Props, name: string): string => p[name]?.email ?? ''
const check = (p: Props, name: string): boolean => p[name]?.checkbox === true
const date = (p: Props, name: string): string => p[name]?.date?.start ?? ''
const relCount = (p: Props, name: string): number => (p[name]?.relation ?? []).length

function mapCandidature(page: any): Candidature {
  const p: Props = page.properties ?? {}
  return {
    id: page.id,
    notionUrl: page.url ?? '',
    prenom: title(p, 'Prénom'),
    email: email(p, 'Email'),
    region: text(p, 'Région'),
    bateau: text(p, 'Bateau'),
    plateforme: sel(p, 'Plateforme'),
    frequence: sel(p, 'Fréquence'),
    pratique: sel(p, 'Pratique'),
    typeNav: sel(p, 'Type de navigation'),
    statut: sel(p, 'Statut') as Candidature['statut'],
    motifRefus: sel(p, 'Motif refus'),
    canal: sel(p, 'Canal de recrutement'),
    canalAutre: text(p, 'Canal (précision)'),
    priorite: sel(p, 'Priorité bêta'),
    dateCandidature: date(p, 'Date de candidature'),
    emailGooglePlay: email(p, 'Email Google Play'),
    exportGooglePlay: check(p, 'Export Google Play'),
    invitationEnvoyee: check(p, 'Invitation envoyée'),
    dateInvitation: date(p, 'Date invitation envoyée'),
    lienEnvoye: check(p, 'Lien de téléchargement envoyé'),
    relanceEnvoyee: check(p, 'Relance envoyée'),
    dateRelance: date(p, 'Date relance'),
    emailGPDemande: check(p, 'Email GP demandé'),
    dateDemandeGP: date(p, 'Date demande email GP'),
    retoursCount: relCount(p, 'Retours beta'),
  }
}

function mapFeedback(page: any): Feedback {
  const p: Props = page.properties ?? {}
  return {
    id: page.id,
    notionUrl: page.url ?? '',
    email: title(p, 'Email'),
    date: date(p, 'Date'),
    typeRetour: sel(p, 'Type de retour'),
    spot: text(p, 'Spot'),
    description: text(p, "Ce qui s'est passé"),
    attendu: text(p, "Ce qu'on attendait"),
    statut: sel(p, 'Statut'),
    impact: sel(p, 'Impact'),
    priorite: sel(p, 'Priorité'),
    versionApp: text(p, 'Version app'),
  }
}

// ── Requêtes ──────────────────────────────────────────────────────────────────

async function queryAll(dbId: string, sorts: unknown[]): Promise<any[]> {
  const pages: any[] = []
  let cursor: string | undefined
  do {
    const body: Record<string, unknown> = { page_size: 100, sorts }
    if (cursor) body.start_cursor = cursor
    const res = (await notionFetch(`/databases/${dbId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    })) as { results: any[]; has_more: boolean; next_cursor: string | null }
    pages.push(...res.results)
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined
  } while (cursor)
  return pages
}

export async function queryCandidatures(): Promise<Candidature[]> {
  const { betaDb } = notionEnv()
  const pages = await queryAll(betaDb, [{ property: 'Date de candidature', direction: 'descending' }])
  return pages.map(mapCandidature)
}

export async function queryFeedbacks(): Promise<Feedback[]> {
  const { feedbackDb } = notionEnv()
  const pages = await queryAll(feedbackDb, [{ property: 'Date', direction: 'descending' }])
  return pages.map(mapFeedback)
}

export async function getCandidature(pageId: string): Promise<Candidature> {
  const page = await notionFetch(`/pages/${pageId}`)
  return mapCandidature(page)
}

export async function updatePage(pageId: string, properties: Record<string, unknown>): Promise<void> {
  await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  })
}

// ── Prédicats partagés ────────────────────────────────────────────────────────

/** À exporter vers la liste de testeurs Google Play Console : email renseigné,
 *  pas encore exporté, et toujours dans le pipeline. Le statut « Accepté » seul
 *  ne suffit pas : l'admin peut inviter avant d'exporter (les invités passent en
 *  « Invité Google Play » mais doivent rester exportables tant que la case
 *  Export Google Play n'est pas cochée). Testé par scripts/test-export-filter.ts. */
export const aExporterGooglePlay = (c: Candidature): boolean =>
  ['Accepté', 'Invité Google Play', 'Actif'].includes(c.statut) &&
  !!c.emailGooglePlay && !c.exportGooglePlay

// ── Builders de propriétés pour les PATCH ─────────────────────────────────────

export const prop = {
  select: (name: string) => ({ select: name ? { name } : null }),
  checkbox: (v: boolean) => ({ checkbox: v }),
  email: (v: string) => ({ email: v || null }),
  // fr-CA produit nativement YYYY-MM-DD ; timezone Paris pour éviter le J-1 avant 1h/2h du matin.
  dateToday: () => ({ date: { start: new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }) } }),
}
