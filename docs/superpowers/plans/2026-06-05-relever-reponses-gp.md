# « ↻ Relever les réponses » (IMAP → Email Google Play) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un bouton dans l'onglet « 📮 Email Google à confirmer » qui lit la boîte IMAP (LWS), extrait l'adresse Google des réponses des candidats et remplit `Email Google Play` dans Notion (jamais d'écrasement) — le candidat bascule alors dans « ✅ À inviter ».

**Architecture:** Recherche IMAP **pilotée par les candidats** (`SEARCH FROM <email> SINCE <dateDemandeGP>`) → idempotente, indépendante des flags lu/non-lu. Trois unités : `lib/admin/imap.ts` (seul fichier qui parle IMAP), `lib/admin/extractEmailGP.ts` (extraction pure, testable hors réseau), action `releverReponsesGP()` (orchestration + Notion). UI = bouton + rapport inline dans `CandidaturesTable`.

**Tech Stack:** Next.js 16 App Router, Server Actions, `imapflow` (client IMAP, types inclus), `mailparser` (+`@types/mailparser`), API Notion directe, pattern `BatchReport` existant.

**Spec :** `docs/superpowers/specs/2026-06-05-relever-reponses-gp-design.md`. Une précision vs spec (règle 3 d'extraction) : l'adresse **de candidature du candidat lui-même** est aussi exclue des adresses trouvées dans le corps (elle apparaît dans les citations « De : … ») — sauf si c'est un gmail via la règle 4. Évite de remplir le champ avec un hotmail cité.

**Prérequis :** variables `IMAP_HOST`, `IMAP_PORT` (993), `IMAP_USER`, `IMAP_PASSWORD` dans `.env.local`. Si absentes au moment de la Task 1 : STOP, statut BLOCKED, demander à l'admin de les remplir (panel LWS → rubrique emails → serveur entrant).

**Vérification :** pas d'infra de test dans le repo → scripts d'assertions node + `npm run typecheck` + `npm run build` + test manuel. Un dev server de l'admin tourne peut-être déjà sur le port 3000 (hot reload actif).

---

### Task 1: Dépendances + script de validation de la connexion IMAP

**Files:**
- Modify: `package.json` (via npm install)
- Create: `scripts/test-imap-connection.ts`

- [ ] **Step 1: Vérifier les prérequis env**

Run: `node -e "require('dotenv')" 2>$null; Select-String -Path .env.local -Pattern '^IMAP_' | ForEach-Object { ($_.Line -split '=')[0] }`
Expected: les 4 noms `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD` (les valeurs ne doivent PAS être affichées).
Si absents → STOP, statut BLOCKED, demander à l'admin de compléter `.env.local`.

- [ ] **Step 2: Installer les dépendances**

Run: `npm install imapflow mailparser && npm install -D @types/mailparser`
Expected: exit 0. (`imapflow` embarque ses propres types TypeScript.)

- [ ] **Step 3: Créer `scripts/test-imap-connection.ts`**

```typescript
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
}
await client.logout()
```

- [ ] **Step 4: Exécuter le script**

Run: `node --experimental-strip-types --env-file=.env.local scripts/test-imap-connection.ts`
Expected: `Connecté à <host> — INBOX contient N message(s).` suivi de ~10 lignes `date | expéditeur | sujet`.
Si erreur d'authentification ou de connexion : STOP, statut BLOCKED, rapporter le message exact (probable host/mot de passe à corriger avec l'admin). Ne pas réessayer en boucle.

- [ ] **Step 5: Typecheck + commit**

Run: `npm run typecheck`
Expected: exit 0.

```bash
git add package.json package-lock.json scripts/test-imap-connection.ts
git commit -m "chore(admin): deps imapflow/mailparser + script de validation IMAP"
```

---

### Task 2: Extraction pure `extractEmailGP` (TDD par script d'assertions)

**Files:**
- Create: `scripts/test-extract-email-gp.ts` (d'abord)
- Create: `lib/admin/extractEmailGP.ts`

- [ ] **Step 1: Écrire le script de tests AVANT l'implémentation**

Créer `scripts/test-extract-email-gp.ts` :

```typescript
// Tests de extractEmailGP (fonction pure, pas d'infra de test dans le repo).
// Usage: node --experimental-strip-types scripts/test-extract-email-gp.ts
import assert from 'node:assert/strict'
import { extractEmailGP } from '../lib/admin/extractEmailGP.ts'

const cases: Array<{ nom: string; body: string; from: string; attendu: ReturnType<typeof extractEmailGP> }> = [
  { nom: 'gmail simple', body: 'Bonjour, mon compte : jean.nav@gmail.com — merci !', from: 'jean@hotmail.fr', attendu: { email: 'jean.nav@gmail.com' } },
  { nom: 'googlemail', body: 'voilà : skipper@googlemail.com', from: 'x@orange.fr', attendu: { email: 'skipper@googlemail.com' } },
  { nom: 'casse mélangée + citation de notre adresse', body: 'Mon adresse Google : Marin.Breton@GMAIL.com\n\nLe mer. 4 juin, seascope-contact@pennarstudio.fr a écrit :\n> il nous faut l’adresse de votre compte', from: 'marin@free.fr', attendu: { email: 'marin.breton@gmail.com' } },
  { nom: 'réponse sans adresse depuis un gmail', body: 'C’est cette adresse 👍', from: 'paul.mer@gmail.com', attendu: { email: 'paul.mer@gmail.com' } },
  { nom: 'workspace unique (non-gmail)', body: 'mon compte google : moi@mondomaine.bzh', from: 'moi@hotmail.fr', attendu: { email: 'moi@mondomaine.bzh' } },
  { nom: 'sa propre adresse citée ne compte pas', body: 'De : yann@hotmail.fr\nOui bien sûr !', from: 'yann@hotmail.fr', attendu: null },
  { nom: 'multi non-gmail ambigu', body: 'a@domaine1.fr ou b@domaine2.fr ?', from: 'c@orange.fr', attendu: { ambigu: 'plusieurs adresses trouvées : a@domaine1.fr, b@domaine2.fr' } },
  { nom: 'rien d’exploitable depuis non-gmail', body: 'Je vous renvoie ça vite promis', from: 'd@orange.fr', attendu: null },
  { nom: 'gmail prioritaire sur autre adresse', body: 'perso : x@monsite.fr mais pour Google Play : y@gmail.com', from: 'z@orange.fr', attendu: { email: 'y@gmail.com' } },
]

let ko = 0
for (const c of cases) {
  const r = extractEmailGP(c.body, c.from)
  try {
    assert.deepEqual(r, c.attendu)
    console.log(`✓ ${c.nom}`)
  } catch {
    ko++
    console.error(`✕ ${c.nom} — attendu ${JSON.stringify(c.attendu)}, obtenu ${JSON.stringify(r)}`)
  }
}
if (ko) { console.error(`${ko} échec(s)`); process.exit(1) }
console.log('Tous les tests passent.')
```

- [ ] **Step 2: Lancer — vérifier que ça échoue (module absent)**

Run: `node --experimental-strip-types scripts/test-extract-email-gp.ts`
Expected: FAIL — `Cannot find module ... lib/admin/extractEmailGP.ts`.

- [ ] **Step 3: Implémenter `lib/admin/extractEmailGP.ts`**

```typescript
// Extraction de l'adresse Google depuis la réponse d'un candidat à la demande
// d'email Google Play. Fonction pure — aucune dépendance réseau.
// Testée par scripts/test-extract-email-gp.ts.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Nos adresses, présentes dans les citations « Le … a écrit : » — toujours ignorées. */
const NOS_ADRESSES = new Set(['seascope-contact@pennarstudio.fr', 'contact@pennarstudio.fr'])

const isGmail = (e: string) => /@(gmail|googlemail)\.com$/i.test(e)

export type ExtractResult =
  | { email: string }   // adresse retenue avec confiance
  | { ambigu: string }  // réponse trouvée mais douteuse — traitement manuel
  | null                // rien d'exploitable

export function extractEmailGP(body: string, fromAddress: string): ExtractResult {
  const from = fromAddress.toLowerCase()
  // L'adresse de candidature du candidat est aussi exclue du corps (citations) :
  // si elle est gmail, la règle « expéditeur gmail » ci-dessous la rattrape.
  const found = [...new Set((body.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))]
    .filter((e) => !NOS_ADRESSES.has(e) && e !== from && VALID_EMAIL_RE.test(e))

  const gmail = found.find(isGmail)
  if (gmail) return { email: gmail }
  if (found.length === 1) return { email: found[0] }              // compte Google Workspace possible
  if (found.length === 0 && isGmail(from)) return { email: from } // « c'est cette adresse »
  if (found.length > 1) return { ambigu: `plusieurs adresses trouvées : ${found.join(', ')}` }
  return null
}
```

- [ ] **Step 4: Relancer les tests**

Run: `node --experimental-strip-types scripts/test-extract-email-gp.ts`
Expected: 9 lignes `✓ …` puis `Tous les tests passent.` Si un cas échoue : corriger l'implémentation (pas le test), sauf si le test contredit la spec.

- [ ] **Step 5: Typecheck + commit**

Run: `npm run typecheck`
Expected: exit 0.

```bash
git add lib/admin/extractEmailGP.ts scripts/test-extract-email-gp.ts
git commit -m "feat(admin): extraction de l'adresse Google depuis les réponses candidats"
```

---

### Task 3: Couche IMAP — `lib/admin/imap.ts`

**Files:**
- Create: `lib/admin/imap.ts`

- [ ] **Step 1: Créer le fichier**

```typescript
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0. Si les types `client.search`/`fetchOne` coincent (l'API imapflow a évolué entre versions) : consulter les types installés dans `node_modules/imapflow/lib/imap-flow.d.ts` et adapter les appels — le COMPORTEMENT attendu (recherche par from+since en UID, fetch du source du plus récent) ne change pas.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/imap.ts
git commit -m "feat(admin): couche IMAP — dernière réponse par expéditeur"
```

---

### Task 4: Server action `releverReponsesGP()`

**Files:**
- Modify: `lib/admin/actions.ts`

- [ ] **Step 1: Compléter les imports**

Dans `lib/admin/actions.ts`, la ligne d'import notion devient (ajout de `queryCandidatures`) :

```typescript
import { getCandidature, prop, queryCandidatures, updatePage, type StatutCandidature } from '@/lib/admin/notion'
```

Et ajouter après l'import de `@/lib/admin/refus` :

```typescript
import { fetchLatestReplyTextFrom } from '@/lib/admin/imap'
import { extractEmailGP } from '@/lib/admin/extractEmailGP'
```

- [ ] **Step 2: Ajouter l'action après `refuser` (avant `// ── Statuts en lot`)**

```typescript
// ── Relève des réponses email Google Play ─────────────────────────────────────

/** Lit la boîte IMAP et remplit « Email Google Play » pour les candidats
 *  Acceptés dont la demande est partie et le champ encore vide. Jamais
 *  d'écrasement ; l'envoi de l'invitation reste un geste manuel. */
export async function releverReponsesGP(): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  try {
    const candidats = (await queryCandidatures()).filter(
      (c) => c.statut === 'Accepté' && c.emailGPDemande && !c.emailGooglePlay && c.email,
    )
    if (candidats.length === 0) return { ok: true, results: [] }

    const replies = await fetchLatestReplyTextFrom(
      candidats.map((c) => ({
        email: c.email,
        since: c.dateDemandeGP ? new Date(c.dateDemandeGP) : c.dateCandidature ? new Date(c.dateCandidature) : undefined,
      })),
    )

    for (const c of candidats) {
      const prenom = c.prenom || c.id
      try {
        const body = replies.get(c.email.toLowerCase())
        if (body === undefined) {
          results.push({ id: c.id, prenom, ok: true, info: 'pas encore de réponse' })
          continue
        }
        const extrait = extractEmailGP(body, c.email)
        if (!extrait) {
          results.push({ id: c.id, prenom, ok: true, info: 'réponse reçue mais aucune adresse détectée — à saisir manuellement' })
          continue
        }
        if ('ambigu' in extrait) {
          results.push({ id: c.id, prenom, ok: true, info: `à vérifier manuellement — ${extrait.ambigu}` })
          continue
        }
        await updatePage(c.id, { 'Email Google Play': prop.email(extrait.email) })
        results.push({ id: c.id, prenom, ok: true, info: `rempli : ${extrait.email}` })
      } catch (e) {
        console.error('[admin] relève GP', c.id, e)
        results.push({ id: c.id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
      }
    }
  } catch (e) {
    // Connexion IMAP ou lecture Notion KO : rien n'a été modifié, le signaler tel quel.
    console.error('[admin] relève GP', e)
    return { ok: false, results: [{ id: 'imap', prenom: 'Connexion', ok: false, error: e instanceof Error ? e.message : 'Erreur interne' }] }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npm run typecheck`
Expected: exit 0.

```bash
git add lib/admin/actions.ts
git commit -m "feat(admin): action releverReponsesGP — IMAP vers Email Google Play"
```

---

### Task 5: Bouton + rapport dans l'onglet « Email Google à confirmer »

**Files:**
- Modify: `components/admin/CandidaturesTable.tsx`

- [ ] **Step 1: Import + état + handler**

Ajouter `releverReponsesGP` à l'import existant de `@/lib/admin/actions` (ordre alphabétique : `…qualifierEnLot, refuser, releverReponsesGP, setCanal…`).

Après la ligne `const [refusReport, setRefusReport] = useState<BatchReport | null>(null)` :

```typescript
  const [releveReport, setReleveReport] = useState<BatchReport | null>(null)
```

Après le handler `confirmRefus` :

```typescript
  const relever = () =>
    startTransition(async () => {
      setError(null)
      setReleveReport(await releverReponsesGP())
    })
```

- [ ] **Step 2: Bloc UI**

Juste après le bloc `{error && (…)}` (avant `<div className="overflow-x-auto">`) :

```tsx
      {tab === 'emailgp' && (
        <div className="mx-4 mt-3">
          <div className="flex items-center gap-3">
            <BulkBtn kind="primary" label={pending ? '↻ Relève en cours…' : '↻ Relever les réponses'} disabled={pending} onClick={relever} />
            <span className="text-[11px] text-ss-fg/50">Lit la boîte contact@ et remplit les emails Google Play trouvés dans les réponses.</span>
          </div>
          {releveReport && (
            <div className="mt-2 space-y-1 rounded-ss bg-ss-surface-2 px-4 py-3 text-[13px]">
              <p className="mb-1 font-semibold">
                {releveReport.results.length === 0 ? 'Aucun candidat en attente de réponse.' : releveReport.ok ? 'Relève terminée' : '⚠️ Relève terminée avec erreurs'}
              </p>
              {releveReport.results.map((r) => (
                <p key={r.id} className={!r.ok ? 'text-ss-deconseille' : r.info?.startsWith('rempli') ? 'text-ss-bon' : 'text-ss-fg/70'}>
                  {!r.ok ? '✕' : r.info?.startsWith('rempli') ? '✓' : '·'} {r.prenom}{r.error ? ` — ${r.error}` : ''}{r.info ? ` — ${r.info}` : ''}
                </p>
              ))}
              <button onClick={() => setReleveReport(null)} className="mt-1 text-xs text-ss-fg/50 underline">Fermer</button>
            </div>
          )}
        </div>
      )}
```

(Note : les candidats remplis disparaissent de l'onglet au `revalidatePath` — le rapport reste affiché jusqu'au « Fermer », c'est voulu.)

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck`
Expected: exit 0.

Run: `npm run build`
Expected: build OK. (Si Next se plaint du bundling d'`imapflow` côté server action : ajouter dans `next.config.ts` → `serverExternalPackages: ['imapflow', 'mailparser']` et relancer le build.)

- [ ] **Step 4: Test manuel (avec l'admin)**

1. Dev server (souvent déjà lancé sur le port 3000 par l'admin) → `http://localhost:3000/admin/candidatures?tab=emailgp`.
2. Cliquer « ↻ Relever les réponses ».
3. Vérifier le rapport : chaque candidat listé avec ✓ rempli / · pas de réponse / ⚠ ambigu.
4. Croiser 2-3 résultats « rempli » avec les vrais mails dans la boîte contact@ (l'admin confirme).
5. Vérifier dans Notion que `Email Google Play` est rempli et que les candidats concernés sont passés dans « ✅ À inviter ».
6. Recliquer le bouton : les remplis n'apparaissent plus (idempotence).

- [ ] **Step 5: Commit**

```bash
git add components/admin/CandidaturesTable.tsx
git commit -m "feat(admin): bouton « Relever les réponses » + rapport (onglet email GP)"
```

---

## Self-review (fait à l'écriture du plan)

- **Couverture spec :** prérequis env + validation connexion (T1), règles d'extraction 1-6 avec tests (T2), couche IMAP isolée (T3), orchestration/écriture Notion sans écrasement + rapport (T4), bouton + rapport UI + test manuel + idempotence (T5). Fallback `dateDemandeGP` vide → `dateCandidature` (T4). Échec IMAP → rapport d'erreur unique sans écriture (T4).
- **Placeholders :** aucun — chaque étape a son code ou sa commande.
- **Cohérence des types :** `ExtractResult` (T2) consommé tel quel en T4 (`'ambigu' in extrait`) ; `ReplyQuery`/`fetchLatestReplyTextFrom` (T3) appelée en T4 avec `{email, since}` ; `BatchItemResult.info` existant réutilisé (T4/T5) ; clés de Map en minuscules des deux côtés (T3 set / T4 get).
