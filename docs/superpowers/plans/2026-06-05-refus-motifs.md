# Refus avec motif + email adapté — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Au clic sur « ✕ Refuser » (ligne ou lot) dans le dashboard admin, ouvrir un dialog : choix du motif → aperçu du mail adapté → confirmation = statut `Refusé` + motif dans Notion + envoi du mail de refus via Brevo.

**Architecture:** Config unique des motifs dans `lib/admin/refus.ts` (clé, label Notion, sujet, contenu HTML). Template `refusEmail()` dans `lib/admin/emails.ts` (shell existant). Server action batch `refuser()` calquée sur `envoyerInvitations()` mais **Notion d'abord, mail ensuite**. Dialog client `RefusDialog.tsx` calqué sur `EmailModal.tsx`, avec aperçus **pré-rendus côté serveur** dans `page.tsx` (un par motif, pattern existant des `previewInvitation` etc.).

**Tech Stack:** Next.js 16 App Router, Server Actions, API Notion directe (pas de SDK), Brevo, Tailwind. **Pas d'infra de test** dans ce repo → vérification = `npm run typecheck`, script `scripts/render-emails.ts`, `npm run build`, test manuel.

**Déviations vs spec (validées par le pattern du codebase) :**
- Aperçu via props pré-rendues serveur (`Record<motifKey, html>`) au lieu d'une server action `previewRefusEmail` — pattern existant de `page.tsx:63-65`, aperçu instantané au changement de motif.
- `refusEmail(c, motif: MotifRefus)` prend l'objet motif (pas la clé) → `emails.ts` n'a besoin que d'un `import type` (les scripts `node --experimental-strip-types` continuent de fonctionner sans résolution d'import runtime).
- Mails en **vouvoiement** (les templates existants vouvoient ; le spec disait tutoiement par erreur).

**Conventions du repo à respecter :**
- HTML emails : littéraux pré-encodés en entités (`&eacute;`…), `esc()` sur toute valeur candidat, sujets en UTF-8 brut.
- Server actions : `requireAdmin()` en tête, batch séquentiel, un échec n'interrompt pas le lot, `revalidatePath(ADMIN_PATH)` à la fin.
- Commits fréquents, messages style `feat(admin): …` en français (voir `git log`).

---

### Task 1: Config des motifs — `lib/admin/refus.ts`

**Files:**
- Create: `lib/admin/refus.ts`

- [ ] **Step 1: Créer le fichier avec la config complète**

```typescript
// Motifs de refus — source de vérité unique pour le dialog admin, le template
// email (lib/admin/emails.ts), la server action refuser() et la colonne select
// « Motif refus » dans Notion.
// `h1` et `paragraphs` sont du HTML pré-encodé (entités) : littéraux uniquement,
// jamais de valeur candidat (même convention que lib/admin/emails.ts).

export interface MotifRefus {
  key: string
  label: string        // option du select Notion + libellé dans le dialog
  subject: string      // sujet du mail (UTF-8 brut, comme les autres templates)
  h1: string           // titre du header email (entités HTML)
  paragraphs: readonly string[]  // paragraphes du corps (entités HTML)
}

export const MOTIFS_REFUS = [
  {
    key: 'beta_complete',
    label: 'Beta complète',
    subject: 'Candidature SeaScope — la bêta affiche complet',
    h1: 'La b&ecirc;ta affiche complet',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. La vague actuelle de la b&ecirc;ta ferm&eacute;e est <strong style="color:#f4f7f9;">au complet</strong>&nbsp;: on pr&eacute;f&egrave;re un petit groupe de testeurs qu&#39;on peut vraiment &eacute;couter.`,
      `Votre candidature est conserv&eacute;e&nbsp;: d&egrave;s qu&#39;une place se lib&egrave;re ou qu&#39;une nouvelle vague ouvre, vous serez parmi les premiers contact&eacute;s.`,
    ],
  },
  {
    key: 'ios_incompatible',
    label: 'iOS non compatible',
    subject: 'Candidature SeaScope — la version iOS arrive',
    h1: 'SeaScope n&#39;est pas encore sur iPhone',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. La b&ecirc;ta actuelle est uniquement disponible sur <strong style="color:#f4f7f9;">Android</strong>, et votre candidature indique que vous &ecirc;tes sur iPhone.`,
      `Bonne nouvelle malgr&eacute; tout&nbsp;: la version iOS est pr&eacute;vue. On garde votre candidature pr&eacute;cieusement et <strong style="color:#f4f7f9;">on vous recontacte d&egrave;s que la b&ecirc;ta iOS ouvre</strong>.`,
    ],
  },
  {
    key: 'zone_non_couverte',
    label: 'Zone non couverte',
    subject: 'Candidature SeaScope — votre zone arrive bientôt',
    h1: 'Votre zone n&#39;est pas encore couverte',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. Pour cette phase de b&ecirc;ta, on se concentre sur quelques zones de navigation afin de valider la fiabilit&eacute; des pr&eacute;visions localement.`,
      `Votre zone n&#39;en fait pas encore partie, mais la couverture s&#39;&eacute;tend au fil des vagues&nbsp;: on garde votre candidature et on revient vers vous d&egrave;s que votre zone est couverte.`,
    ],
  },
  {
    key: 'profil_hors_cible',
    label: 'Profil hors cible',
    subject: 'Candidature SeaScope — pas cette vague-ci',
    h1: 'Pas cette vague-ci',
    paragraphs: [
      `Merci d&#39;avoir candidat&eacute; pour tester SeaScope. Pour cette phase, on cherche des profils tr&egrave;s pr&eacute;cis (fr&eacute;quence de sortie, type de navigation) afin de tester l&#39;app dans des conditions cibl&eacute;es.`,
      `Votre candidature est conserv&eacute;e pour les prochaines vagues, o&ugrave; les crit&egrave;res s&#39;&eacute;largiront.`,
    ],
  },
  {
    key: 'candidature_incomplete',
    label: 'Candidature incomplète',
    subject: 'Candidature SeaScope — il manque quelques informations',
    h1: 'Il manque quelques infos',
    paragraphs: [
      `Merci de votre int&eacute;r&ecirc;t pour SeaScope. En l&#39;&eacute;tat, votre candidature ne nous permet pas de l&#39;&eacute;valuer&nbsp;: certaines informations sont manquantes ou semblent invalides.`,
      `Si la b&ecirc;ta vous int&eacute;resse toujours, n&#39;h&eacute;sitez pas &agrave; repostuler en compl&eacute;tant le formulaire sur le site &mdash; on l&#39;&eacute;tudiera avec plaisir.`,
    ],
  },
] as const satisfies readonly MotifRefus[]

export type MotifRefusKey = (typeof MOTIFS_REFUS)[number]['key']
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `npm run typecheck`
Expected: exit 0, aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/refus.ts
git commit -m "feat(admin): config des motifs de refus (5 motifs, source de vérité unique)"
```

---

### Task 2: Template email de refus + rendu local

**Files:**
- Modify: `lib/admin/emails.ts` (ajout en fin de fichier, après `relanceEmail`)
- Modify: `scripts/render-emails.ts`

- [ ] **Step 1: Ajouter `refusEmail()` à la fin de `lib/admin/emails.ts`**

Ajouter l'import type en tête de fichier (ligne 1, avant `function esc`) :

```typescript
import type { MotifRefus } from './refus'
```

(import **type-only** : effacé par `--experimental-strip-types`, les scripts node continuent de fonctionner.)

Puis ajouter à la fin du fichier :

```typescript
export function refusEmail(c: { prenom: string }, motif: MotifRefus): EmailContent {
  const prenom = esc(c.prenom)
  const paras = motif.paragraphs
    .map((p) => `<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">${p}</p>`)
    .join('\n')
  const inner = `${header(motif.h1)}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
${paras}
</td></tr>
<tr><td style="padding:16px 40px 36px;">${signature}</td></tr>`
  return { subject: motif.subject, html: shell(motif.subject, inner) }
}
```

- [ ] **Step 2: Ajouter les rendus de refus à `scripts/render-emails.ts`**

Ajouter l'import (à côté des imports existants) :

```typescript
import { refusEmail } from '../lib/admin/emails.ts'
import { MOTIFS_REFUS } from '../lib/admin/refus.ts'
```

Et à la fin du script :

```typescript
for (const m of MOTIFS_REFUS) {
  const e = refusEmail({ prenom: 'Camille' }, m)
  writeFileSync(`.playwright-mcp/email-refus-${m.key}.html`, e.html)
  console.log(`refus ${m.key}:`, e.subject)
}
```

- [ ] **Step 3: Vérifier typecheck + rendu**

Run: `npm run typecheck`
Expected: exit 0.

Run: `node --experimental-strip-types --env-file=.env.local scripts/render-emails.ts`
(si les env sont ailleurs que `.env.local`, adapter `--env-file`)
Expected: 8 lignes en sortie dont les 5 `refus <key>: Candidature SeaScope — …` ; les fichiers `.playwright-mcp/email-refus-*.html` existent.

- [ ] **Step 4: Contrôle visuel rapide**

Ouvrir `.playwright-mcp/email-refus-ios_incompatible.html` dans un navigateur (ou via Read) : header « SeaScope — Bêta fermée », h1 du motif, « Bonjour Camille, », 2 paragraphes, signature « Nayel — SeaScope », pas d'entité cassée (`&eacute;` rendu en « é »).

- [ ] **Step 5: Commit**

```bash
git add lib/admin/emails.ts scripts/render-emails.ts
git commit -m "feat(admin): template email de refus adapté au motif"
```

---

### Task 3: Champ `motifRefus` dans le type Candidature

**Files:**
- Modify: `lib/admin/notion.ts` (interface `Candidature` ~ligne 20 et `mapCandidature` ~ligne 105)

- [ ] **Step 1: Ajouter le champ à l'interface**

Dans `interface Candidature`, après la ligne `statut: StatutCandidature | ''` :

```typescript
  motifRefus: string
```

- [ ] **Step 2: Ajouter le mapping**

Dans `mapCandidature`, après la ligne `statut: sel(p, 'Statut') as Candidature['statut'],` :

```typescript
    motifRefus: sel(p, 'Motif refus'),
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `npm run typecheck`
Expected: exit 0 (le champ est lu nulle part encore, juste mappé — `sel()` retourne `''` tant que la colonne n'existe pas dans Notion, aucun crash).

- [ ] **Step 4: Commit**

```bash
git add lib/admin/notion.ts
git commit -m "feat(admin): mapping du champ Motif refus depuis Notion"
```

---

### Task 4: Script one-shot — création de la colonne Notion

**Files:**
- Create: `scripts/add-motif-refus-column.ts`

- [ ] **Step 1: Créer le script**

```typescript
// Ajout one-shot de la colonne select « Motif refus » à la base candidatures Notion.
// Idempotent : relancer le script met à jour les options sans toucher aux données.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/add-motif-refus-column.ts
import { MOTIFS_REFUS } from '../lib/admin/refus.ts'

const token = process.env.NOTION_TOKEN
const dbId = process.env.NOTION_BETA_DB_ID
if (!token || !dbId) throw new Error('Variables manquantes: NOTION_TOKEN, NOTION_BETA_DB_ID')

const colors = ['red', 'orange', 'yellow', 'blue', 'gray']
const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  },
  body: JSON.stringify({
    properties: {
      'Motif refus': {
        select: { options: MOTIFS_REFUS.map((m, i) => ({ name: m.label, color: colors[i % colors.length] })) },
      },
    },
  }),
})
if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
console.log('Colonne « Motif refus » créée/à jour. Options :', MOTIFS_REFUS.map((m) => m.label).join(' · '))
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 3: Exécuter le script (crée réellement la colonne)**

Run: `node --experimental-strip-types --env-file=.env.local scripts/add-motif-refus-column.ts`
Expected: `Colonne « Motif refus » créée/à jour. Options : Beta complète · iOS non compatible · Zone non couverte · Profil hors cible · Candidature incomplète`

En cas d'erreur 4xx : lire le message Notion (token invalide, dbId faux, ou option select dupliquée) — ne pas masquer, corriger la cause.

- [ ] **Step 4: Commit**

```bash
git add scripts/add-motif-refus-column.ts
git commit -m "chore(admin): script one-shot colonne Notion « Motif refus » (+ exécuté)"
```

---

### Task 5: Server action `refuser()`

**Files:**
- Modify: `lib/admin/actions.ts`

- [ ] **Step 1: Ajouter le champ `info` à `BatchItemResult`**

Dans l'interface `BatchItemResult` (ligne 11), après `error?: string` :

```typescript
  info?: string
```

(`error` = échec ; `info` = succès avec précision, ex. « refusé sans mail ». `EmailModal` ignore `info`, seul `RefusDialog` l'affiche.)

- [ ] **Step 2: Ajouter les imports**

Compléter les imports en tête de `actions.ts` :

```typescript
import { MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
import { demandeEmailGPEmail, invitationEmail, refusEmail, relanceEmail } from '@/lib/admin/emails'
```

(la 2ᵉ ligne remplace l'import existant de `@/lib/admin/emails` — on y ajoute juste `refusEmail`.)

- [ ] **Step 3: Ajouter l'action `refuser` après `envoyerRelances` (avant la section « Statuts en lot »)**

```typescript
// ── Refus avec motif ──────────────────────────────────────────────────────────

/** Refus en lot avec motif : Notion d'abord (statut + motif), mail ensuite.
 *  Ordre inverse des invitations : un refusé sans mail se rattrape à la main,
 *  alors qu'un mail de refus parti pour un candidat resté « Nouveau » ne se
 *  rattrape pas. */
export async function refuser(
  ids: string[],
  motifKey: MotifRefusKey,
  envoyerEmail: boolean,
): Promise<BatchReport> {
  await requireAdmin()
  const motif = MOTIFS_REFUS.find((m) => m.key === motifKey)
  if (!motif) {
    return { ok: false, results: ids.map((id) => ({ id, prenom: id, ok: false, error: `motif inconnu : ${motifKey}` })) }
  }
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      await updatePage(id, {
        'Statut': prop.select('Refusé'),
        'Motif refus': prop.select(motif.label),
      })
      if (!envoyerEmail) {
        results.push({ id, prenom, ok: true, info: 'refusé sans mail (choix admin)' })
        continue
      }
      if (!c.email) {
        results.push({ id, prenom, ok: true, info: 'refusé — aucun email de candidature, mail non envoyé' })
        continue
      }
      try {
        const { subject, html } = refusEmail({ prenom: c.prenom }, motif)
        await sendBrevo({ email: c.email, name: c.prenom }, subject, html)
      } catch (brevoErr) {
        // Notion déjà à jour : signaler explicitement que seul le mail a échoué.
        throw new Error(`statut mis à jour MAIS mail de refus non envoyé (${brevoErr instanceof Error ? brevoErr.message : brevoErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] refus', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/actions.ts
git commit -m "feat(admin): server action refuser() — statut + motif Notion puis mail Brevo"
```

---

### Task 6: Composant `RefusDialog`

**Files:**
- Create: `components/admin/RefusDialog.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
'use client'

import { useState } from 'react'
import { MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
import type { BatchReport } from '@/lib/admin/actions'

export default function RefusDialog({
  recipients, previews, sending, report, onConfirm, onClose,
}: {
  recipients: Array<{ id: string; prenom: string; email: string }>
  previews: Record<MotifRefusKey, string>
  sending: boolean
  report: BatchReport | null
  onConfirm: (motif: MotifRefusKey, envoyerEmail: boolean) => void
  onClose: () => void
}) {
  const [motif, setMotif] = useState<MotifRefusKey>(MOTIFS_REFUS[0].key)
  const [envoyer, setEnvoyer] = useState(true)
  const n = recipients.length
  const sansEmail = recipients.filter((r) => !r.email)
  const motifLabel = MOTIFS_REFUS.find((m) => m.key === motif)?.label

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6" onClick={() => { if (!sending) onClose() }}>
      <div className="w-full max-w-2xl rounded-ss-lg border border-ss-deconseille/30 bg-ss-bg-2" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-white/10 px-6 py-4 text-sm font-bold text-ss-deconseille">
          Refuser {n} candidature{n > 1 ? 's' : ''}
        </div>

        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {recipients.map((r) => (
            <span key={r.id} className="rounded-full border border-ss-deconseille/20 bg-ss-surface-2 px-3.5 py-1 text-xs">
              <b className="text-ss-deconseille">{r.prenom}</b> · {r.email || 'aucun email'}
            </span>
          ))}
        </div>

        {report ? (
          <div className="m-6 space-y-1.5 rounded-ss bg-ss-surface-2 p-5 text-sm">
            <p className="mb-3 font-semibold">{report.ok ? '✅ Refus traités' : '⚠️ Certains refus ont échoué'}</p>
            {report.results.map((r) => (
              <p key={r.id} className={r.ok ? 'text-ss-bon' : 'text-ss-deconseille'}>
                {r.ok ? '✓' : '✕'} {r.prenom}
                {r.error ? ` — ${r.error}` : ''}
                {r.info ? ` — ${r.info}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ss-fg/50">Motif du refus</p>
              <div className="flex flex-wrap gap-2">
                {MOTIFS_REFUS.map((m) => (
                  <label
                    key={m.key}
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold ${
                      motif === m.key
                        ? 'border-ss-deconseille/60 bg-ss-deconseille/15 text-ss-deconseille'
                        : 'border-white/15 bg-ss-surface text-ss-fg/70 hover:border-white/30'
                    }`}
                  >
                    <input type="radio" name="motif-refus" value={m.key} checked={motif === m.key} onChange={() => setMotif(m.key)} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-ss-fg/70">
                <input type="checkbox" className="accent-ss-teal" checked={envoyer} onChange={(e) => setEnvoyer(e.target.checked)} />
                Envoyer le mail de refus {n > 1 ? 'aux candidats' : 'au candidat'}
              </label>
              {envoyer && sansEmail.length > 0 && (
                <p className="mt-2 text-[11px] text-ss-variable">
                  ⚠ {sansEmail.map((r) => r.prenom).join(', ')}&nbsp;: aucun email de candidature — refus enregistré sans envoi.
                </p>
              )}
              {envoyer && n > 1 && (
                <p className="mt-2 text-[11px] text-ss-fg/50">Aperçu générique — chaque mail sera personnalisé avec le prénom du candidat.</p>
              )}
            </div>
            {envoyer ? (
              <iframe
                srcDoc={previews[motif]}
                sandbox=""
                title="Aperçu email de refus"
                className="m-6 h-96 w-[calc(100%-3rem)] rounded-ss border border-white/10 bg-white"
              />
            ) : (
              <p className="m-6 rounded-ss bg-ss-surface-2 p-5 text-sm text-ss-fg/60">
                Aucun mail ne sera envoyé — seul le statut Notion passera à « Refusé » avec le motif.
              </p>
            )}
          </>
        )}

        <div className="flex items-center gap-2.5 px-6 pb-5">
          {!report && (
            <span className="mr-auto text-[11px] leading-relaxed text-ss-fg/60">
              Après confirmation (par candidat) : Statut → Refusé · Motif refus = « {motifLabel} »{envoyer ? ' · envoi du mail' : ''}
              <br />Traitement séquentiel — un échec n&apos;interrompt pas les suivants.
            </span>
          )}
          <button onClick={onClose} disabled={sending} className="ml-auto rounded-md border border-gray-400/25 bg-gray-400/10 px-4 py-2 text-xs font-semibold disabled:opacity-40">
            {report ? 'Fermer' : 'Annuler'}
          </button>
          {!report && (
            <button
              onClick={() => onConfirm(motif, envoyer)}
              disabled={sending}
              className="rounded-md bg-ss-deconseille px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {sending ? 'Traitement…' : envoyer ? `Refuser et envoyer (${n})` : `Refuser sans mail (${n})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0 (le composant n'est pas encore monté — normal).

- [ ] **Step 3: Commit**

```bash
git add components/admin/RefusDialog.tsx
git commit -m "feat(admin): dialog de refus — choix du motif, aperçu mail, option sans mail"
```

---

### Task 7: Câblage — table, page, affichage du motif

**Files:**
- Modify: `app/admin/(protected)/candidatures/page.tsx`
- Modify: `components/admin/CandidaturesTable.tsx`

- [ ] **Step 1: Pré-rendre les aperçus de refus dans `page.tsx`**

Compléter les imports :

```typescript
import { demandeEmailGPEmail, invitationEmail, refusEmail, relanceEmail } from '@/lib/admin/emails'
import { MOTIFS_REFUS, type MotifRefusKey } from '@/lib/admin/refus'
```

Après la ligne `const previewDemande = demandeEmailGPEmail({ prenom: '{Prénom}' }).html` (ligne 65) :

```typescript
  const previewsRefus = Object.fromEntries(
    MOTIFS_REFUS.map((m) => [m.key, refusEmail({ prenom: '{Prénom}' }, m).html]),
  ) as Record<MotifRefusKey, string>
```

Et passer la prop au composant (JSX, ~ligne 114) :

```tsx
      <CandidaturesTable
        key={tab}
        rows={rows.filter(filters[tab])}
        tab={tab}
        previewInvitation={previewInvitation}
        previewRelance={previewRelance}
        previewDemande={previewDemande}
        previewsRefus={previewsRefus}
      />
```

- [ ] **Step 2: Câbler `CandidaturesTable.tsx` — imports, props, état**

Compléter les imports :

```typescript
import RefusDialog from '@/components/admin/RefusDialog'
import {
  envoyerDemandesEmailGP, envoyerInvitations, envoyerRelances, marquerActifs, qualifier, qualifierEnLot,
  refuser, setCanal, setEmailGooglePlay, setPriorite, type BatchReport,
} from '@/lib/admin/actions'
import type { MotifRefusKey } from '@/lib/admin/refus'
```

Signature du composant (ajout de `previewsRefus`) :

```typescript
export default function CandidaturesTable({
  rows, tab, previewInvitation, previewRelance, previewDemande, previewsRefus,
}: {
  rows: Row[]
  tab: TabKey
  previewInvitation: string
  previewRelance: string
  previewDemande: string
  previewsRefus: Record<MotifRefusKey, string>
}) {
```

Nouvel état (après `const [report, setReport] = useState...`) :

```typescript
  const [refusTargets, setRefusTargets] = useState<Row[] | null>(null)
  const [refusReport, setRefusReport] = useState<BatchReport | null>(null)
```

Handler de confirmation (après `confirmModal`) :

```typescript
  const confirmRefus = (motif: MotifRefusKey, envoyerEmail: boolean) => {
    if (!refusTargets) return
    startTransition(async () => {
      const rep = await refuser(refusTargets.map((r) => r.id), motif, envoyerEmail)
      setRefusReport(rep)
      setSelected(new Set())
    })
  }
```

- [ ] **Step 3: Brancher les deux boutons « ✕ Refuser » sur le dialog**

Bouton bulk (ligne 178), remplacer :

```tsx
<BulkBtn kind="ko" label="✕ Refuser" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'Refusé'))} />
```

par :

```tsx
<BulkBtn kind="ko" label="✕ Refuser" disabled={pending} onClick={() => { setRefusReport(null); setRefusTargets(selRows) }} />
```

Appel de `RowActions` (ligne 164) : ajouter la prop `onRefuser` :

```tsx
<RowActions row={r} disabled={pending} onQualifier={(s) => run(() => qualifier(r.id, s))} onRefuser={() => { setRefusReport(null); setRefusTargets([r]) }} onInvite={() => openModal('invitation', [r])} onRelance={() => openModal('relance', [r])} onActif={() => run(() => marquerActifs([r.id]))} onDemande={() => openModal('demande', [r])} />
```

Dans `RowActions` : ajouter `onRefuser` aux props, restreindre `onQualifier` aux statuts hors refus, et brancher le bouton :

```typescript
function RowActions({ row, disabled, onQualifier, onRefuser, onInvite, onRelance, onActif, onDemande }: {
  row: Row
  disabled: boolean
  onQualifier: (s: 'Accepté' | 'En attente') => void
  onRefuser: () => void
  onInvite: () => void
  onRelance: () => void
  onActif: () => void
  onDemande: () => void
}) {
```

et remplacer (ligne 256) :

```tsx
<BulkBtn kind="ko" label="✕ Refuser" disabled={disabled} onClick={() => onQualifier('Refusé')} />
```

par :

```tsx
<BulkBtn kind="ko" label="✕ Refuser" disabled={disabled} onClick={onRefuser} />
```

- [ ] **Step 4: Monter le dialog**

Après le bloc `{modal && (<EmailModal …/>)}` (ligne 212-221) :

```tsx
      {refusTargets && (
        <RefusDialog
          recipients={refusTargets.map((r) => ({ id: r.id, prenom: r.prenom, email: r.email }))}
          previews={previewsRefus}
          sending={pending}
          report={refusReport}
          onConfirm={confirmRefus}
          onClose={() => { setRefusTargets(null); setRefusReport(null) }}
        />
      )}
```

- [ ] **Step 5: Afficher le motif dans la colonne Statut (onglet Refusés)**

Dans la cellule Statut (après `<StatutChip statut={r.statut} />`, ligne 158) :

```tsx
{r.statut === 'Refusé' && r.motifRefus && <><br /><span className="text-[11px] text-ss-deconseille/80">motif : {r.motifRefus}</span></>}
```

- [ ] **Step 6: Typecheck + lint + build**

Run: `npm run typecheck`
Expected: exit 0. (Si erreur sur `onQualifier('Refusé')` résiduel quelque part : c'est le but du rétrécissement de type — corriger l'appel oublié.)

Run: `npm run lint`
Expected: pas de nouvelle erreur.

Run: `npm run build`
Expected: build OK.

- [ ] **Step 7: Test manuel**

1. `npm run dev`, ouvrir `http://localhost:3000/admin/candidatures` (mot de passe admin).
2. Onglet « À traiter » : cliquer « ✕ Refuser » sur une ligne → le dialog s'ouvre, motif « Beta complète » présélectionné, aperçu visible.
3. Changer de motif → l'aperçu change instantanément.
4. Décocher « Envoyer le mail » → l'aperçu laisse place au message « Aucun mail ne sera envoyé… », bouton devient « Refuser sans mail (1) ».
5. **Ne pas confirmer sur un vrai candidat avec mail** sauf accord de Nayel — pour tester l'envoi réel, utiliser une candidature de test dont l'email est `OWNER_EMAIL`.
6. Vérifier ensuite dans Notion : statut « Refusé » + « Motif refus » renseigné ; onglet « ❌ Refusés » affiche « motif : … » sous le chip.

- [ ] **Step 8: Commit**

```bash
git add app/admin/(protected)/candidatures/page.tsx components/admin/CandidaturesTable.tsx
git commit -m "feat(admin): refus avec motif — dialog branché sur les boutons Refuser (ligne + lot)"
```

---

## Self-review (fait à l'écriture du plan)

- **Couverture spec :** motifs (T1), template email (T2), mapping + colonne Notion (T3, T4), action avec gestion d'erreur par candidat et Notion-d'abord (T5), dialog avec aperçu + case « sans mail » + warning sans-email (T6), câblage ligne/lot + affichage motif onglet Refusés (T7). Tests unitaires : hors scope (pas d'infra de test dans le repo, conformément au spec « si une infra existe »).
- **Pas de placeholder :** chaque étape contient le code ou la commande exacte.
- **Cohérence des types :** `MotifRefusKey` (T1) utilisé dans T5/T6/T7 ; `BatchItemResult.info` (T5) consommé par `RefusDialog` (T6) ; `previewsRefus: Record<MotifRefusKey, string>` cohérent entre `page.tsx` et les props (T7).
