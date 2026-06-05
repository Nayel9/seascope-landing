# Campagne « As-tu installé l'app ? » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouton « 📣 Demander confirmation » sur les invités → email avec deux liens signés : « J'ai installé » (page publique → statut Actif) et « J'ai un problème » (formulaire public → ticket dans la base feedbacks + onglet 🆘 Installation).

**Architecture:** Token HMAC par candidat (`lib/beta/token.ts`, secret `ADMIN_SESSION_SECRET` existant). Pages publiques `/beta/installee` et `/beta/probleme` (style landing, GET ne mute jamais — protection scanners type Outlook SafeLinks ; mutation via server actions publiques `lib/beta/actions.ts` authentifiées par le token). Campagne côté admin = pattern batch existant (`EmailModal` mode `confirmation`, `BatchReport`, garde anti-double-envoi via 2 nouvelles propriétés Notion).

**Tech Stack:** Next.js 16 App Router, Server Actions, API Notion directe, Brevo, node:crypto. Aucune nouvelle dépendance. Projet **pnpm**.

**Spec :** `docs/superpowers/specs/2026-06-05-campagne-confirmation-installation-design.md`.
Précision vs spec : pas de modification du select Notion « Type de retour » par script — Notion **crée automatiquement** une option de select inconnue à la création de page (c'est déjà ainsi que `/api/feedback` fonctionne). Le script one-shot ne crée donc que les 2 propriétés de la base candidatures.

**Vérification :** pas d'infra de test → scripts d'assertions node, `pnpm run typecheck`, `pnpm run build`, test manuel sur un candidat de test (email = OWNER_EMAIL).

**Conventions :** emails = littéraux HTML pré-encodés (entités) + `esc()` sur toute valeur candidat ; actions batch = `requireAdmin()` en tête, boucle séquentielle, échec par item, `revalidatePath` ; commits français `feat(admin): …`.

---

### Task 1: Token signé — `lib/beta/token.ts` (TDD)

**Files:**
- Create: `scripts/test-beta-token.ts` (d'abord)
- Create: `lib/beta/token.ts`

- [ ] **Step 1: Écrire le script de tests AVANT l'implémentation**

`scripts/test-beta-token.ts` :

```typescript
// Tests du token candidat signé (HMAC) — node --experimental-strip-types --env-file=.env.local scripts/test-beta-token.ts
// (env-file requis : la signature utilise ADMIN_SESSION_SECRET)
import assert from 'node:assert/strict'
import { signCandidatureToken, verifyCandidatureToken } from '../lib/beta/token.ts'

const id = '1f2e3d4c-5b6a-7980-abcd-ef0123456789'
const token = signCandidatureToken(id)

assert.equal(verifyCandidatureToken(token), id, 'aller-retour sign/verify')
assert.equal(verifyCandidatureToken(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')), null, 'signature altérée → null')
assert.equal(verifyCandidatureToken('autre-id.' + token.split('.')[1]), null, 'id altéré → null')
assert.equal(verifyCandidatureToken(''), null, 'vide → null')
assert.equal(verifyCandidatureToken(undefined), null, 'undefined → null')
assert.equal(verifyCandidatureToken('pas-de-point'), null, 'sans point → null')
assert.equal(verifyCandidatureToken(`${id}.zzzz`), null, 'signature non-hex → null')
assert.ok(/^[0-9a-f-]+\.[0-9a-f]{64}$/.test(token), 'format <id>.<hmac hex>')

console.log('Tous les tests passent.')
```

- [ ] **Step 2: Lancer — vérifier l'échec (module absent)**

Run: `node --experimental-strip-types --env-file=.env.local scripts/test-beta-token.ts`
Expected: FAIL — `Cannot find module ... lib/beta/token.ts`.

- [ ] **Step 3: Implémenter `lib/beta/token.ts`**

```typescript
// Token candidat signé pour les liens publics des emails (confirmation
// d'installation). HMAC-SHA256 avec ADMIN_SESSION_SECRET (secret existant),
// préfixe « beta: » pour isoler ce domaine de signature de celui des sessions
// admin. Pas d'expiration : le pire abus (rejouer son propre lien) est idempotent.
// Testé par scripts/test-beta-token.ts.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s) throw new Error('Variable manquante: ADMIN_SESSION_SECRET')
  return s
}

const sign = (id: string): string => createHmac('sha256', secret()).update(`beta:${id}`).digest('hex')

// Comparaison timing-safe de chaînes de longueurs quelconques (même approche que lib/admin/auth.ts).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function signCandidatureToken(id: string): string {
  return `${id}.${sign(id)}`
}

/** Retourne l'id candidat si le token est valide, sinon null. */
export function verifyCandidatureToken(token: string | undefined | null): string | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const id = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!/^[0-9a-f]{64}$/.test(sig) || !/^[0-9a-f-]{32,40}$/i.test(id)) return null
  return safeEqual(sig, sign(id)) ? id : null
}
```

- [ ] **Step 4: Relancer les tests**

Run: `node --experimental-strip-types --env-file=.env.local scripts/test-beta-token.ts`
Expected: `Tous les tests passent.`

- [ ] **Step 5: Typecheck + commit**

Run: `pnpm run typecheck` → exit 0.

```bash
git add lib/beta/token.ts scripts/test-beta-token.ts
git commit -m "feat(beta): token candidat signé pour les liens publics des emails"
```

---

### Task 2: Propriétés Notion + mapping `Candidature`

**Files:**
- Create: `scripts/add-confirmation-columns.ts`
- Modify: `lib/admin/notion.ts` (interface `Candidature` + `mapCandidature`)

- [ ] **Step 1: Créer le script one-shot**

`scripts/add-confirmation-columns.ts` :

```typescript
// Ajout one-shot des propriétés « Confirmation demandée » (checkbox) et
// « Date confirmation demandée » (date) à la base candidatures Notion. Idempotent.
// Usage: node --experimental-strip-types --env-file=.env.local scripts/add-confirmation-columns.ts
const token = process.env.NOTION_TOKEN
const dbId = process.env.NOTION_BETA_DB_ID
if (!token || !dbId) throw new Error('Variables manquantes: NOTION_TOKEN, NOTION_BETA_DB_ID')

const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  },
  body: JSON.stringify({
    properties: {
      'Confirmation demandée': { checkbox: {} },
      'Date confirmation demandée': { date: {} },
    },
  }),
})
if (!res.ok) throw new Error(`Notion error ${res.status}: ${await res.text()}`)
console.log('Propriétés « Confirmation demandée » + « Date confirmation demandée » créées/à jour.')
```

- [ ] **Step 2: Exécuter le script (création réelle)**

Run: `node --experimental-strip-types --env-file=.env.local scripts/add-confirmation-columns.ts`
Expected: `Propriétés « Confirmation demandée » + « Date confirmation demandée » créées/à jour.`
Erreur 4xx → STOP, BLOCKED avec le message Notion.

- [ ] **Step 3: Mapper dans `lib/admin/notion.ts`**

Dans `interface Candidature`, après `dateDemandeGP: string     // ISO ou ''` :

```typescript
  confirmationDemandee: boolean
  dateConfirmationDemandee: string  // ISO ou ''
```

Dans `mapCandidature`, après `dateDemandeGP: date(p, 'Date demande email GP'),` :

```typescript
    confirmationDemandee: check(p, 'Confirmation demandée'),
    dateConfirmationDemandee: date(p, 'Date confirmation demandée'),
```

- [ ] **Step 4: Typecheck + commit**

Run: `pnpm run typecheck` → exit 0.

```bash
git add scripts/add-confirmation-columns.ts lib/admin/notion.ts
git commit -m "feat(admin): propriétés Notion confirmation d'installation (+ script exécuté)"
```

---

### Task 3: Templates emails (campagne + notification owner)

**Files:**
- Modify: `lib/admin/emails.ts` (2 fonctions en fin de fichier)
- Modify: `scripts/render-emails.ts`

- [ ] **Step 1: Ajouter `confirmationInstallEmail` à la fin de `lib/admin/emails.ts`**

```typescript
export function confirmationInstallEmail(c: { prenom: string }, lienInstallee: string, lienProbleme: string): EmailContent {
  const prenom = esc(c.prenom)
  const inner = `${header('Tout roule avec la b&ecirc;ta&nbsp;?')}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
<p style="margin:0 0 24px;color:#c2d3dd;font-size:15px;line-height:1.6;">Vous avez re&ccedil;u votre invitation &agrave; la b&ecirc;ta SeaScope il y a quelques jours. Dites-nous <strong style="color:#f4f7f9;">en un clic</strong> o&ugrave; vous en &ecirc;tes&nbsp;:</p>
</td></tr>
<tr><td style="padding:0 40px 8px;" align="center">
<a href="${esc(lienInstallee)}" style="display:inline-block;background-color:#1ec8a5;color:#06151f;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">&#10003; J&#39;ai install&eacute; l&#39;app</a>
</td></tr>
<tr><td style="padding:16px 40px 8px;" align="center">
<a href="${esc(lienProbleme)}" style="display:inline-block;background-color:#0b1f2e;color:#7fd1c8;border:1px solid #1ec8a5;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">&#9888; J&#39;ai rencontr&eacute; un probl&egrave;me</a>
</td></tr>
<tr><td style="padding:24px 40px 36px;">
<p style="margin:0 0 16px;color:#7a93a3;font-size:13px;line-height:1.6;">Votre r&eacute;ponse nous aide &agrave; ne laisser personne bloqu&eacute;.</p>
${signature}
</td></tr>`
  return { subject: 'Tout roule avec la bêta SeaScope ?', html: shell('Tout roule avec la bêta SeaScope ?', inner) }
}
```

- [ ] **Step 2: Ajouter `problemeInstallationOwnerEmail` juste après**

```typescript
/** Notification à l'admin quand un testeur signale un problème d'installation. */
export function problemeInstallationOwnerEmail(p: {
  prenom: string; email: string; etape: string; description: string; telephone?: string
}): EmailContent {
  const inner = `${header('Probl&egrave;me d&#39;installation signal&eacute;')}
<tr><td style="padding:0 40px 36px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;"><strong style="color:#f4f7f9;">${esc(p.prenom)}</strong> (${esc(p.email)}) bloque &agrave; l&#39;&eacute;tape&nbsp;: <strong style="color:#f4f7f9;">${esc(p.etape)}</strong>${p.telephone ? ` &mdash; t&eacute;l&eacute;phone&nbsp;: ${esc(p.telephone)}` : ''}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f2e;border-radius:8px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0;color:#c2d3dd;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(p.description)}</p>
</td></tr></table>
<p style="margin:16px 0 0;color:#7a93a3;font-size:13px;">Ticket cr&eacute;&eacute; dans l&#39;onglet &#127384; Installation du dashboard.</p>
</td></tr>`
  return { subject: `🆘 Problème installation — ${p.prenom}`, html: shell('Problème installation signalé', inner) }
}
```

- [ ] **Step 3: Ajouter au script de rendu `scripts/render-emails.ts`**

Compléter l'import existant de `../lib/admin/emails.ts` avec `confirmationInstallEmail, problemeInstallationOwnerEmail`, et ajouter à la fin :

```typescript
const conf = confirmationInstallEmail({ prenom: 'Camille' }, 'https://exemple.test/beta/installee?t=x', 'https://exemple.test/beta/probleme?t=x')
writeFileSync('.playwright-mcp/email-confirmation-install.html', conf.html)
console.log('confirmation:', conf.subject)

const ticket = problemeInstallationOwnerEmail({ prenom: 'Camille', email: 'camille@exemple.test', etape: 'Installation Play Store', description: 'Le bouton Installer reste grisé.', telephone: 'Pixel 7' })
writeFileSync('.playwright-mcp/email-ticket-owner.html', ticket.html)
console.log('ticket owner:', ticket.subject)
```

- [ ] **Step 4: Vérifier**

Run: `pnpm run typecheck` → exit 0.
Run: `node --experimental-strip-types --env-file=.env.local scripts/render-emails.ts`
Expected: les sujets existants + `confirmation: Tout roule avec la bêta SeaScope ?` + `ticket owner: 🆘 Problème installation — Camille` ; ouvrir `.playwright-mcp/email-confirmation-install.html` et vérifier les 2 boutons (teal plein / outline).

- [ ] **Step 5: Commit**

```bash
git add lib/admin/emails.ts scripts/render-emails.ts
git commit -m "feat(admin): templates campagne confirmation installation + notif ticket"
```

---

### Task 4: Création de ticket + action admin `envoyerConfirmations`

**Files:**
- Modify: `lib/admin/notion.ts` (fonction `createFeedbackInstallation`)
- Modify: `lib/admin/actions.ts` (action `envoyerConfirmations`)

- [ ] **Step 1: Ajouter `createFeedbackInstallation` dans `lib/admin/notion.ts`** (après `updatePage`, avant la section Prédicats)

```typescript
/** Crée un ticket « Problème installation » dans la base feedbacks.
 *  Notion crée automatiquement l'option de select si elle n'existe pas encore. */
export async function createFeedbackInstallation(email: string, description: string): Promise<void> {
  const { feedbackDb } = notionEnv()
  await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: feedbackDb },
      properties: {
        'Email': { title: [{ text: { content: email || 'inconnu' } }] },
        'Type de retour': { select: { name: 'Problème installation' } },
        "Ce qui s'est passé": { rich_text: [{ text: { content: description } }] },
        'Statut': { select: { name: 'Nouveau' } },
        'Date': { date: { start: new Date().toISOString() } },
      },
    }),
  })
}
```

- [ ] **Step 2: Ajouter l'action dans `lib/admin/actions.ts`**

Imports — compléter l'import emails avec `confirmationInstallEmail` (ordre alphabétique :
`confirmationInstallEmail, demandeEmailGPEmail, invitationEmail, refusEmail, relanceEmail`) et ajouter :

```typescript
import { signCandidatureToken } from '@/lib/beta/token'
```

Action, après `envoyerRelances` (avant `// ── Refus avec motif`) :

```typescript
/** Campagne « as-tu installé l'app ? » : email aux invités avec deux liens signés
 *  (installée / problème). Réservé au statut « Invité Google Play », une fois par candidat. */
export async function envoyerConfirmations(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    return { ok: false, results: [{ id: 'env', prenom: 'Config', ok: false, error: 'NEXT_PUBLIC_SITE_URL manquant' }] }
  }
  const base = siteUrl.replace(/\/$/, '')
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (c.statut !== 'Invité Google Play') throw new Error(`statut « ${c.statut} » — réservé aux invités`)
      if (c.confirmationDemandee) throw new Error('demande de confirmation déjà envoyée')
      const dest = c.emailGooglePlay || c.email
      if (!dest) throw new Error('aucun email')

      const token = encodeURIComponent(signCandidatureToken(id))
      const { subject, html } = confirmationInstallEmail(
        { prenom: c.prenom },
        `${base}/beta/installee?t=${token}`,
        `${base}/beta/probleme?t=${token}`,
      )
      await sendBrevo({ email: dest, name: c.prenom }, subject, html)
      try {
        await updatePage(id, {
          'Confirmation demandée': prop.checkbox(true),
          'Date confirmation demandée': prop.dateToday(),
        })
      } catch (notionErr) {
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] confirmation install', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `pnpm run typecheck` → exit 0.

```bash
git add lib/admin/notion.ts lib/admin/actions.ts
git commit -m "feat(admin): action envoyerConfirmations + création ticket installation"
```

---

### Task 5: Actions publiques — `lib/beta/actions.ts`

**Files:**
- Create: `lib/beta/actions.ts`

- [ ] **Step 1: Créer le fichier**

```typescript
'use server'

// Actions publiques des pages /beta/* — AUCUN requireAdmin : l'authentification
// est le token HMAC signé porté par le lien email. GET ne mute jamais (scanners) ;
// ces actions ne sont déclenchées que par un geste explicite du testeur.

import { revalidatePath } from 'next/cache'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { createFeedbackInstallation, getCandidature, prop, updatePage } from '@/lib/admin/notion'
import { sendBrevo } from '@/lib/admin/brevo'
import { problemeInstallationOwnerEmail } from '@/lib/admin/emails'

export type EtatConfirmation = 'confirme' | 'deja' | 'neutre' | 'invalide' | 'erreur'

/** Le testeur confirme l'installation : Invité Google Play → Actif (idempotent). */
export async function confirmerInstallation(token: string): Promise<EtatConfirmation> {
  const id = verifyCandidatureToken(token)
  if (!id) return 'invalide'
  try {
    const c = await getCandidature(id)
    if (c.statut === 'Invité Google Play') {
      await updatePage(id, { Statut: prop.select('Actif') })
      revalidatePath('/admin/candidatures')
      return 'confirme'
    }
    if (c.statut === 'Actif') return 'deja'
    return 'neutre' // statut inattendu : on remercie sans rien changer
  } catch (e) {
    console.error('[beta] confirmation', e)
    return 'erreur'
  }
}

export const ETAPES_PROBLEME = ['Invitation Google', 'Installation Play Store', "Ouverture de l'app", 'Autre'] as const

export interface ProblemePayload {
  etape: string
  description: string
  telephone?: string
}

/** Le testeur signale un problème : ticket dans la base feedbacks + notif admin.
 *  Le candidat reste « Invité Google Play ». */
export async function signalerProbleme(token: string, p: ProblemePayload): Promise<{ ok: boolean; error?: string }> {
  const id = verifyCandidatureToken(token)
  if (!id) return { ok: false, error: 'Lien invalide' }
  const etape = (ETAPES_PROBLEME as readonly string[]).includes(p.etape) ? p.etape : ''
  const description = (p.description ?? '').trim().slice(0, 2000)
  const telephone = (p.telephone ?? '').trim().slice(0, 100)
  if (!etape) return { ok: false, error: 'Indiquez l’étape qui bloque' }
  if (description.length < 10) return { ok: false, error: 'Description trop courte (min. 10 caractères)' }
  try {
    const c = await getCandidature(id)
    const email = c.email || c.emailGooglePlay
    const texte = `[${etape}] ${description}${telephone ? `\nTéléphone : ${telephone}` : ''}`
    await createFeedbackInstallation(email, texte)
    const owner = process.env.OWNER_EMAIL
    if (owner) {
      const { subject, html } = problemeInstallationOwnerEmail({ prenom: c.prenom, email, etape, description, telephone: telephone || undefined })
      // La notif est best-effort : le ticket Notion est déjà créé, ne pas faire échouer le testeur.
      await sendBrevo({ email: owner }, subject, html).catch((e) => console.error('[beta] notif owner', e))
    }
    revalidatePath('/admin/feedbacks')
    return { ok: true }
  } catch (e) {
    console.error('[beta] problème', e)
    return { ok: false, error: 'Erreur interne — réessayez, ou répondez simplement au mail d’invitation' }
  }
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm run typecheck` → exit 0.

```bash
git add lib/beta/actions.ts
git commit -m "feat(beta): actions publiques confirmation installation + signalement problème"
```

---

### Task 6: Pages publiques `/beta/installee` et `/beta/probleme`

**Files:**
- Create: `components/beta/BetaShell.tsx`
- Create: `components/beta/LienInvalide.tsx`
- Create: `components/beta/ConfirmInstallation.tsx`
- Create: `components/beta/ProblemeForm.tsx`
- Create: `app/beta/installee/page.tsx`
- Create: `app/beta/probleme/page.tsx`

Style : landing publique (composants `Nav`/`Footer` de `components/layout/`, classes `container-narrow`, tokens `ss-*` — voir `app/privacy/page.tsx` pour référence).

- [ ] **Step 1: `components/beta/BetaShell.tsx`**

```tsx
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function BetaShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="py-16 md:py-24">
        <div className="container-narrow max-w-[600px]">{children}</div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: `components/beta/LienInvalide.tsx`**

```tsx
import BetaShell from '@/components/beta/BetaShell'

export default function LienInvalide() {
  return (
    <BetaShell>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Ce lien n&rsquo;est plus valide
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Pas d&rsquo;inquiétude&nbsp;: répondez simplement au mail d&rsquo;invitation et on s&rsquo;occupe de vous.
      </p>
    </BetaShell>
  )
}
```

- [ ] **Step 3: `components/beta/ConfirmInstallation.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { confirmerInstallation, type EtatConfirmation } from '@/lib/beta/actions'

export default function ConfirmInstallation({
  token, prenom, formUrl, whatsappUrl,
}: {
  token: string
  prenom: string
  formUrl: string
  whatsappUrl: string
}) {
  const [etat, setEtat] = useState<EtatConfirmation | null>(null)
  const [pending, start] = useTransition()

  if (etat === 'confirme' || etat === 'deja' || etat === 'neutre') {
    return (
      <div>
        <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
          {etat === 'deja' ? 'Déjà confirmé — merci !' : `C'est noté${prenom ? `, ${prenom}` : ''} — bonne nav ! 🌊`}
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
          Après quelques sorties, racontez-nous ce qui s&rsquo;est réellement passé — c&rsquo;est ce qui fait avancer SeaScope.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {formUrl && (
            <a href={formUrl} className="rounded-lg bg-ss-teal px-6 py-3 text-sm font-semibold text-[#06151f]">
              Formulaire de retour terrain
            </a>
          )}
          {whatsappUrl && (
            <a href={whatsappUrl} className="rounded-lg border border-ss-teal/60 px-6 py-3 text-sm font-semibold text-ss-teal">
              Groupe WhatsApp des testeurs
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Merci{prenom ? ` ${prenom}` : ''}&nbsp;!
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Un dernier clic pour confirmer que SeaScope est bien installée sur votre téléphone&nbsp;:
      </p>
      {etat === 'erreur' && (
        <p className="mt-4 text-sm text-ss-deconseille">Une erreur est survenue — réessayez dans un instant.</p>
      )}
      {etat === 'invalide' && (
        <p className="mt-4 text-sm text-ss-deconseille">Ce lien n&rsquo;est plus valide — répondez au mail d&rsquo;invitation.</p>
      )}
      <button
        onClick={() => start(async () => setEtat(await confirmerInstallation(token)))}
        disabled={pending}
        className="mt-6 rounded-lg bg-ss-teal px-8 py-3.5 text-[15px] font-semibold text-[#06151f] disabled:opacity-50"
      >
        {pending ? 'Confirmation…' : "Je confirme l'installation"}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: `components/beta/ProblemeForm.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { ETAPES_PROBLEME, signalerProbleme } from '@/lib/beta/actions'

export default function ProblemeForm({ token, prenom }: { token: string; prenom: string }) {
  const [etape, setEtape] = useState('')
  const [description, setDescription] = useState('')
  const [telephone, setTelephone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [envoye, setEnvoye] = useState(false)
  const [pending, start] = useTransition()

  if (envoye) {
    return (
      <div>
        <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
          Bien reçu{prenom ? `, ${prenom}` : ''}&nbsp;!
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
          Je regarde ça et je reviens vers vous rapidement par email pour vous débloquer.
        </p>
      </div>
    )
  }

  const submit = () =>
    start(async () => {
      setError(null)
      const r = await signalerProbleme(token, { etape, description, telephone: telephone || undefined })
      if (r.ok) setEnvoye(true)
      else setError(r.error ?? 'Erreur')
    })

  const inputCls = 'w-full rounded-lg border border-white/15 bg-ss-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-ss-teal'

  return (
    <div>
      <h1 className="text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.02em] font-medium m-0">
        Un souci avec la bêta&nbsp;?
      </h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-ss-fg/72">
        Décrivez ce qui bloque{prenom ? `, ${prenom}` : ''} — on vous dépanne.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm text-ss-fg/72">
          Étape qui bloque <span className="text-ss-deconseille">*</span>
          <select value={etape} onChange={(e) => setEtape(e.target.value)} className={`mt-1.5 ${inputCls}`}>
            <option value="">— Choisir —</option>
            {ETAPES_PROBLEME.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label className="text-sm text-ss-fg/72">
          Ce qui se passe <span className="text-ss-deconseille">*</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Ex : le bouton Installer reste grisé sur Google Play…"
            className={`mt-1.5 ${inputCls}`}
          />
        </label>
        <label className="text-sm text-ss-fg/72">
          Modèle de téléphone (optionnel)
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            maxLength={100}
            placeholder="Ex : Samsung Galaxy S23"
            className={`mt-1.5 ${inputCls}`}
          />
        </label>
        {error && <p className="text-sm text-ss-deconseille">{error}</p>}
        <button
          onClick={submit}
          disabled={pending}
          className="self-start rounded-lg bg-ss-teal px-8 py-3.5 text-[15px] font-semibold text-[#06151f] disabled:opacity-50"
        >
          {pending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `app/beta/installee/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { getCandidature } from '@/lib/admin/notion'
import BetaShell from '@/components/beta/BetaShell'
import LienInvalide from '@/components/beta/LienInvalide'
import ConfirmInstallation from '@/components/beta/ConfirmInstallation'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Confirmation d’installation — SeaScope',
  robots: { index: false, follow: false },
}

export default async function InstalleePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const id = verifyCandidatureToken(t)
  if (!id) return <LienInvalide />
  let prenom = ''
  try {
    prenom = (await getCandidature(id)).prenom
  } catch {
    return <LienInvalide />
  }
  return (
    <BetaShell>
      <ConfirmInstallation
        token={t!}
        prenom={prenom}
        formUrl={process.env.FEEDBACK_FORM_URL ?? ''}
        whatsappUrl={process.env.WHATSAPP_GROUP_URL ?? ''}
      />
    </BetaShell>
  )
}
```

- [ ] **Step 6: `app/beta/probleme/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { verifyCandidatureToken } from '@/lib/beta/token'
import { getCandidature } from '@/lib/admin/notion'
import BetaShell from '@/components/beta/BetaShell'
import LienInvalide from '@/components/beta/LienInvalide'
import ProblemeForm from '@/components/beta/ProblemeForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Signaler un problème — SeaScope',
  robots: { index: false, follow: false },
}

export default async function ProblemePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const id = verifyCandidatureToken(t)
  if (!id) return <LienInvalide />
  let prenom = ''
  try {
    prenom = (await getCandidature(id)).prenom
  } catch {
    return <LienInvalide />
  }
  return (
    <BetaShell>
      <ProblemeForm token={t!} prenom={prenom} />
    </BetaShell>
  )
}
```

Note : si `Nav`/`Footer` ne s'exportent pas comme dans `app/privacy/page.tsx` (import nommé), copier la forme d'import exacte de cette page. Si la classe `container-narrow` n'existe pas, reprendre le conteneur utilisé par `app/privacy/page.tsx`.

- [ ] **Step 7: Typecheck + commit**

Run: `pnpm run typecheck` → exit 0.

```bash
git add components/beta app/beta
git commit -m "feat(beta): pages publiques confirmation installation + signalement problème"
```

---

### Task 7: Câblage dashboard + onglet 🆘 + vérification complète

**Files:**
- Modify: `components/admin/EmailModal.tsx` (mode `confirmation`)
- Modify: `app/admin/(protected)/candidatures/page.tsx` (préview + prop)
- Modify: `components/admin/CandidaturesTable.tsx` (boutons ligne + lot)
- Modify: `app/admin/(protected)/feedbacks/page.tsx` (onglet Installation)

- [ ] **Step 1: `EmailModal.tsx` — nouveau mode**

```typescript
export interface ModalState {
  mode: 'invitation' | 'relance' | 'demande' | 'confirmation'
  recipients: Array<{ id: string; prenom: string; email: string }>
}

const modeLabels: Record<ModalState['mode'], string> = {
  invitation: 'invitation',
  relance: 'relance',
  demande: 'demande email GP',
  confirmation: 'demande de confirmation',
}

const modeEffects: Record<ModalState['mode'], string> = {
  invitation: 'Après envoi (par destinataire) : ☑ Invitation envoyée · ☑ Lien envoyé · 📅 Date du jour · Statut → Invité Google Play',
  relance: 'Après envoi (par destinataire) : ☑ Relance envoyée · 📅 Date relance = aujourd’hui',
  demande: 'Après envoi (par destinataire) : ☑ Email GP demandé · 📅 Date demande = aujourd’hui',
  confirmation: 'Après envoi (par destinataire) : ☑ Confirmation demandée · 📅 Date du jour — liens personnalisés par candidat',
}
```

- [ ] **Step 2: `page.tsx` (candidatures) — préview**

Compléter l'import emails avec `confirmationInstallEmail`. Après `const previewDemande = …` :

```typescript
  const previewConfirmation = confirmationInstallEmail({ prenom: '{Prénom}' }, '#lien-installee', '#lien-probleme').html
```

Et passer la prop au composant : `previewConfirmation={previewConfirmation}` dans le JSX `<CandidaturesTable …/>`.

- [ ] **Step 3: `CandidaturesTable.tsx` — câblage**

Imports : ajouter `envoyerConfirmations` à l'import actions (alphabétique : `envoyerConfirmations, envoyerDemandesEmailGP, …`).

Props : ajouter `previewConfirmation: string` à la signature (destructuring + type), comme les autres préviews.

`batchActions` :

```typescript
  const batchActions: Record<ModalState['mode'], (ids: string[]) => Promise<BatchReport>> = {
    invitation: envoyerInvitations,
    relance: envoyerRelances,
    demande: envoyerDemandesEmailGP,
    confirmation: envoyerConfirmations,
  }
```

`EmailModal` previewHtml :

```tsx
previewHtml={modal.mode === 'invitation' ? previewInvitation : modal.mode === 'relance' ? previewRelance : modal.mode === 'confirmation' ? previewConfirmation : previewDemande}
```

Bouton bulk — dans le bloc `{(tab === 'invites' || tab === 'relancer') && (…)}`, ajouter après le bouton « 🟢 Marquer actifs » :

```tsx
              {tab === 'invites' && (
                <BulkBtn kind="warn" label="📣 Demander confirmation" disabled={pending} onClick={() => {
                  const targets = selRows.filter((r) => r.statut === 'Invité Google Play' && !r.confirmationDemandee)
                  if (targets.length === 0) { setError('Confirmation déjà demandée à toute la sélection'); return }
                  openModal('confirmation', targets)
                }} />
              )}
```

Bouton ligne — `RowActions` : ajouter la prop `onConfirmation: () => void` (props + type) et dans la branche `row.statut === 'Invité Google Play' || row.statut === 'Actif'`, ajouter pour les invités uniquement (après le bouton Relancer) :

```tsx
        {row.statut === 'Invité Google Play' && (
          row.confirmationDemandee
            ? <BulkBtn kind="warn" label="📣 Demandé ✓" disabled onClick={() => {}} />
            : <BulkBtn kind="warn" label="📣 Demander confirmation" disabled={disabled} onClick={onConfirmation} />
        )}
```

Et à l'appel de `RowActions` (ligne du tableau), ajouter : `onConfirmation={() => openModal('confirmation', [r])}`.

Affichage date — dans la cellule Statut, après la ligne `relanceEnvoyee && dateRelance` :

```tsx
{r.confirmationDemandee && r.dateConfirmationDemandee && <><br /><span className="text-[11px] text-ss-fg/50">confirmation demandée le {r.dateConfirmationDemandee}</span></>}
```

- [ ] **Step 4: `feedbacks/page.tsx` — onglet 🆘 Installation**

```typescript
type FbTab = 'nontraites' | 'encours' | 'installation' | 'tous'

const filters: Record<FbTab, (f: Feedback) => boolean> = {
  nontraites: (f) => ['Nouveau', 'À investiguer', ''].includes(f.statut),
  encours: (f) => f.statut === 'En cours',
  installation: (f) => f.typeRetour === 'Problème installation',
  tous: () => true,
}

const labels: Record<FbTab, string> = { nontraites: '🚨 Non traités', encours: 'En cours', installation: '🆘 Installation', tous: 'Tous' }
```

- [ ] **Step 5: Vérification**

Run: `pnpm run typecheck` → exit 0.
Run: `pnpm run build` → OK.

- [ ] **Step 6: Test manuel de bout en bout (avec l'admin)**

1. Créer un **candidat de test** dans Notion : prénom « Test Confirmation », email = la valeur de `OWNER_EMAIL`, statut « Invité Google Play ».
2. Dev server → onglet « 📨 Invités » → ligne du candidat de test → « 📣 Demander confirmation » → aperçu → confirmer.
3. Vérifier la réception du mail (boîte OWNER_EMAIL), cliquer « ✓ J'ai installé l'app » → page → « Je confirme l'installation » → vérifier statut « Actif » dans Notion + onglet Actifs.
4. Repasser le candidat de test en « Invité Google Play » (à la main dans Notion), recliquer le lien « ⚠ J'ai rencontré un problème » du mail → remplir le formulaire → vérifier : ticket dans `/admin/feedbacks?tab=installation`, mail de notif reçu, candidat resté « Invité ».
5. Vérifier la garde : le bouton de la ligne affiche « 📣 Demandé ✓ ».
6. Tester un token altéré (`/beta/installee?t=abc`) → page « lien invalide ».
7. **Supprimer le candidat de test** (et le ticket de test) dans Notion à la fin.

- [ ] **Step 7: Commit**

```bash
git add components/admin/EmailModal.tsx components/admin/CandidaturesTable.tsx "app/admin/(protected)/candidatures/page.tsx" "app/admin/(protected)/feedbacks/page.tsx"
git commit -m "feat(admin): campagne confirmation installation — boutons, aperçu, onglet tickets"
```

---

## Self-review (fait à l'écriture du plan)

- **Couverture spec :** token §3 (T1), props Notion + mapping §1 (T2), email campagne §2 + notif owner §4 (T3), action admin §1 (T4), actions publiques + règles §4 (T5), pages publiques + GET-ne-mute-jamais + lien invalide §4 (T6), boutons ligne/lot + garde + onglet 🆘 §1/§5 + test manuel §7 (T7). Option select « Problème installation » : auto-créée par Notion à la première page (documenté en tête de plan).
- **Placeholders :** aucun.
- **Cohérence des types :** `EtatConfirmation`/`ETAPES_PROBLEME`/`ProblemePayload` (T5) consommés par T6 ; `confirmationDemandee`/`dateConfirmationDemandee` (T2) consommés par T4/T7 ; `signCandidatureToken`/`verifyCandidatureToken` (T1) par T4/T5/T6 ; `createFeedbackInstallation(email, description)` (T4) par T5 ; mode `'confirmation'` cohérent EmailModal/table/batchActions (T7).
