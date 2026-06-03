# Backoffice admin `/admin` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard admin protégé par mot de passe qui pilote les bases Notion candidatures/feedbacks et automatise invitations, relances et export CSV Google Play via Brevo.

**Architecture:** Next.js 16 App Router tout-en-un — Server Components pour les lectures Notion, Server Actions pour les mutations, route group `app/admin/(protected)/` gardé par `requireAdmin()` (cookie HMAC). Aucune nouvelle dépendance.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind (tokens `ss-*` existants), API Notion `2022-06-28` en fetch direct, Brevo SMTP API, `node:crypto`.

**Spec :** `docs/superpowers/specs/2026-06-03-admin-dashboard-design.md`

**Vérification (pas d'infra de tests dans ce repo — exclu par la spec) :** chaque tâche se termine par `pnpm typecheck` vert + un contrôle manuel ciblé, puis commit.

**Référence visuelle :** maquettes validées `.superpowers/brainstorm/94044-1780475076/content/dashboard.html` (boutons d'action retenus) et `dashboard-v2.html` (sélection multiple retenue).

---

### Task 1: Auth — session HMAC + login/logout

**Files:**
- Create: `lib/admin/auth.ts`
- Create: `lib/admin/auth-actions.ts`
- Modify: `.env.example` (fin de fichier)

- [ ] **Step 1: Écrire `lib/admin/auth.ts`**

```ts
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'ss_admin'
const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 jours

function env() {
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!password || !secret) throw new Error('Variables manquantes: ADMIN_PASSWORD, ADMIN_SESSION_SECRET')
  return { password, secret }
}

// Comparaison timing-safe de deux chaînes de longueurs quelconques.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

function sign(exp: string, secret: string): string {
  return createHmac('sha256', secret).update(exp).digest('hex')
}

export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, env().password)
}

export async function createSession(): Promise<void> {
  const { secret } = env()
  const exp = String(Date.now() + MAX_AGE_S * 1000)
  const jar = await cookies()
  jar.set(COOKIE_NAME, `${exp}.${sign(exp, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: MAX_AGE_S,
  })
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE_NAME, '', { path: '/admin', maxAge: 0 })
}

export async function isAuthenticated(): Promise<boolean> {
  const { secret } = env()
  const jar = await cookies()
  const value = jar.get(COOKIE_NAME)?.value
  if (!value) return false
  const dot = value.indexOf('.')
  if (dot === -1) return false
  const exp = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false
  return safeEqual(sig, sign(exp, secret))
}

/** À appeler en tête de chaque page et Server Action admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}
```

- [ ] **Step 2: Écrire `lib/admin/auth-actions.ts`**

```ts
'use server'

import { redirect } from 'next/navigation'
import { createSession, destroySession, verifyPassword } from '@/lib/admin/auth'

export interface LoginState {
  error?: string
}

export async function login(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const password = formData.get('password')
  if (typeof password !== 'string' || !verifyPassword(password)) {
    return { error: 'Mot de passe incorrect' }
  }
  await createSession()
  redirect('/admin/candidatures')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}
```

- [ ] **Step 3: Ajouter les 4 nouvelles vars à `.env.example`** (à la fin du fichier)

```bash
# Backoffice admin
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
# Lien d'opt-in du test fermé Google Play
GOOGLE_PLAY_URL=
# Lien public du formulaire Notion « Retour d'expérience »
FEEDBACK_FORM_URL=
```

Ajouter les mêmes clés (avec valeurs réelles) dans `.env.local` — `ADMIN_SESSION_SECRET` se génère avec `openssl rand -hex 32` (ou PowerShell : `-join ((1..64) | %{ '{0:x}' -f (Get-Random -Max 16) })`).

- [ ] **Step 4: Vérifier**

Run: `pnpm typecheck`
Expected: exit 0, aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/auth.ts lib/admin/auth-actions.ts .env.example
git commit -m "feat(admin): session HMAC + actions login/logout"
```

---

### Task 2: Pages login + shell protégé

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `components/admin/LoginForm.tsx`
- Create: `app/admin/(protected)/layout.tsx`
- Create: `app/admin/(protected)/page.tsx`
- Create: `components/admin/AdminNav.tsx`

- [ ] **Step 1: Écrire `components/admin/LoginForm.tsx`**

```tsx
'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/lib/admin/auth-actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined)

  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Mot de passe"
        className="w-full rounded-ss border border-ss-teal/25 bg-ss-surface px-4 py-3 text-ss-fg outline-none focus:border-ss-teal"
      />
      {state?.error && <p className="text-sm text-ss-deconseille">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-ss bg-ss-teal px-4 py-3 font-semibold text-ss-bg disabled:opacity-50"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Écrire `app/admin/login/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin/auth'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'SeaScope Admin — Connexion', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/admin/candidatures')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ss-bg px-4">
      <h1 className="text-xl font-bold text-ss-teal">⚓ SeaScope Admin</h1>
      <LoginForm />
    </main>
  )
}
```

- [ ] **Step 3: Écrire `components/admin/AdminNav.tsx`** (Server Component — la déconnexion est un `<form>` vers la Server Action)

```tsx
import Link from 'next/link'
import { logout } from '@/lib/admin/auth-actions'

const links = [
  { href: '/admin/candidatures', label: 'Candidatures' },
  { href: '/admin/feedbacks', label: 'Feedbacks' },
  { href: '/admin/candidatures/export', label: 'Export CSV' },
]

export default function AdminNav() {
  return (
    <nav className="flex items-center gap-6 border-b border-ss-teal/15 bg-ss-bg px-6 py-3.5">
      <span className="text-sm font-bold tracking-wide text-ss-teal">⚓ SeaScope Admin</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-sm text-ss-fg/75 hover:text-ss-teal">
          {l.label}
        </Link>
      ))}
      <form action={logout} className="ml-auto">
        <button type="submit" className="text-xs text-ss-fg/50 underline hover:text-ss-fg">
          déconnexion
        </button>
      </form>
    </nav>
  )
}
```

- [ ] **Step 4: Écrire `app/admin/(protected)/layout.tsx`**

Le layout affiche le shell ; la **garantie** d'auth reste `requireAdmin()` appelé dans chaque page et action (défense au plus près des données — un layout ne re-render pas à chaque navigation).

```tsx
import type { Metadata } from 'next'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'SeaScope Admin', robots: { index: false } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ss-surface text-ss-fg">
      <AdminNav />
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Écrire `app/admin/(protected)/page.tsx`**

```tsx
import { redirect } from 'next/navigation'

export default function AdminIndex() {
  redirect('/admin/candidatures')
}
```

- [ ] **Step 6: Vérifier**

Run: `pnpm typecheck && pnpm dev`
Expected: typecheck OK. Dans le navigateur : `/admin` → redirige vers `/admin/login` quand `/admin/candidatures` n'existe pas encore — **normal à ce stade**, vérifier seulement : mauvais mot de passe → « Mot de passe incorrect » ; bon mot de passe → redirection (404 `/admin/candidatures` attendu jusqu'à la Task 5) ; cookie `ss_admin` httpOnly visible dans DevTools.

- [ ] **Step 7: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(admin): page login + shell protégé avec nav"
```

---

### Task 3: Couche Notion — types, requêtes, mappers

**Files:**
- Create: `lib/admin/notion.ts`

- [ ] **Step 1: Écrire `lib/admin/notion.ts`** (fichier complet)

```ts
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
  canal: string
  priorite: string
  dateCandidature: string   // ISO ou ''
  emailGooglePlay: string
  exportGooglePlay: boolean
  invitationEnvoyee: boolean
  dateInvitation: string    // ISO ou ''
  lienEnvoye: boolean
  relanceEnvoyee: boolean
  dateRelance: string       // ISO ou ''
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
  (p[name]?.rich_text ?? []).map((t: any) => t.plain_text).join('') ?? ''
const title = (p: Props, name: string): string =>
  (p[name]?.title ?? []).map((t: any) => t.plain_text).join('') ?? ''
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
    canal: sel(p, 'Canal de recrutement'),
    priorite: sel(p, 'Priorité bêta'),
    dateCandidature: date(p, 'Date de candidature'),
    emailGooglePlay: email(p, 'Email Google Play'),
    exportGooglePlay: check(p, 'Export Google Play'),
    invitationEnvoyee: check(p, 'Invitation envoyée'),
    dateInvitation: date(p, 'Date invitation envoyée'),
    lienEnvoye: check(p, 'Lien de téléchargement envoyé'),
    relanceEnvoyee: check(p, 'Relance envoyée'),
    dateRelance: date(p, 'Date relance'),
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

// ── Builders de propriétés pour les PATCH ─────────────────────────────────────

export const prop = {
  select: (name: string) => ({ select: { name } }),
  checkbox: (v: boolean) => ({ checkbox: v }),
  email: (v: string) => ({ email: v || null }),
  dateToday: () => ({ date: { start: new Date().toISOString().slice(0, 10) } }),
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/notion.ts
git commit -m "feat(admin): couche Notion (types, query paginée, mappers, builders)"
```

---

### Task 4: Brevo factorisé + templates emails

**Files:**
- Create: `lib/admin/brevo.ts`
- Create: `lib/admin/emails.ts`

Note : on **n'extrait pas** le `sendBrevo` des routes `api/beta`/`api/feedback` existantes (elles fonctionnent, on n'y touche pas — YAGNI). On crée la version admin réutilisable.

- [ ] **Step 1: Écrire `lib/admin/brevo.ts`**

```ts
export interface BrevoEnv {
  apiKey: string
  sender: { name: string; email: string }
}

export function brevoEnv(): BrevoEnv {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER
  const senderName = process.env.BREVO_SENDER_NAME
  if (!apiKey || !senderEmail || !senderName) {
    throw new Error('Variables manquantes: BREVO_API_KEY, BREVO_SENDER, BREVO_SENDER_NAME')
  }
  return { apiKey, sender: { name: senderName, email: senderEmail } }
}

export async function sendBrevo(to: { email: string; name?: string }, subject: string, htmlContent: string): Promise<void> {
  const { apiKey, sender } = brevoEnv()
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ sender, to: [to], subject, htmlContent }),
  })
  if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`)
}
```

- [ ] **Step 2: Écrire `lib/admin/emails.ts`** — templates validés (page Notion « Ops : workflow & templates »), placeholders échappés.

```ts
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function emailEnv() {
  const playUrl = process.env.GOOGLE_PLAY_URL
  const formUrl = process.env.FEEDBACK_FORM_URL
  if (!playUrl || !formUrl) throw new Error('Variables manquantes: GOOGLE_PLAY_URL, FEEDBACK_FORM_URL')
  return { playUrl, formUrl }
}

export interface EmailContent {
  subject: string
  html: string
}

const shell = (title: string, inner: string) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#0b1d2a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1d2a;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#102a3c;border-radius:12px;overflow:hidden;">
${inner}
</table>
<p style="margin:20px 0 0;color:#54707f;font-size:11px;">Vous recevez cet email car vous avez candidat&eacute; &agrave; la b&ecirc;ta SeaScope.</p>
</td></tr></table></body></html>`

const header = (h1: string) => `<tr><td style="padding:40px 40px 24px;">
<p style="margin:0;color:#7fd1c8;font-size:13px;letter-spacing:2px;text-transform:uppercase;">SeaScope &mdash; B&ecirc;ta ferm&eacute;e</p>
<h1 style="margin:12px 0 0;color:#f4f7f9;font-size:26px;line-height:1.3;font-weight:600;">${h1}</h1>
</td></tr>`

const signature = `<p style="margin:0;color:#7a93a3;font-size:14px;line-height:1.6;">Bonne nav,<br><span style="color:#f4f7f9;font-weight:600;">Nayel &mdash; SeaScope</span></p>`

export function invitationEmail(c: { prenom: string; emailGooglePlay: string }): EmailContent {
  const { playUrl, formUrl } = emailEnv()
  const prenom = esc(c.prenom)
  const gp = esc(c.emailGooglePlay)
  const inner = `${header('Votre acc&egrave;s &agrave; la b&ecirc;ta est ouvert')}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Merci d'avoir candidat&eacute; pour tester SeaScope. SeaScope est un copilote m&eacute;t&eacute;o d&eacute;cisionnel pour la navigation c&ocirc;ti&egrave;re&nbsp;: savoir rapidement <strong style="color:#f4f7f9;">quand sortir, quand rentrer, et avec quel niveau de confiance</strong>.</p>
<p style="margin:0 0 24px;color:#c2d3dd;font-size:15px;line-height:1.6;">L'app est en b&ecirc;ta ferm&eacute;e Android. Votre retour terrain est ce qui fera la diff&eacute;rence.</p>
</td></tr>
<tr><td style="padding:0 40px 8px;" align="center">
<a href="${esc(playUrl)}" style="display:inline-block;background-color:#1ec8a5;color:#06151f;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">Rejoindre la b&ecirc;ta sur Google Play</a>
<p style="margin:12px 0 0;color:#7a93a3;font-size:12px;line-height:1.5;">Ouvrez ce lien depuis votre Android, connect&eacute; au compte Google ${gp}.</p>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f2e;border-radius:8px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;color:#f4f7f9;font-size:14px;font-weight:600;">Comment installer</p>
<p style="margin:0;color:#c2d3dd;font-size:14px;line-height:1.7;">1. Acceptez l'invitation au programme de test.<br>2. Installez SeaScope depuis Google Play.<br>3. Ouvrez l'app avant vos vraies sorties, naviguez comme d'habitude.</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Apr&egrave;s quelques sorties, racontez-nous ce qui s'est r&eacute;ellement pass&eacute; &mdash; 5 minutes&nbsp;:</p>
<p style="margin:0 0 24px;"><a href="${esc(formUrl)}" style="color:#1ec8a5;font-size:15px;font-weight:600;text-decoration:none;">&rarr; Formulaire de retour terrain</a></p>
<p style="margin:0 0 32px;color:#c2d3dd;font-size:15px;line-height:1.6;">Une pr&eacute;cision&nbsp;: on ne cherche pas des compliments. On cherche des retours honn&ecirc;tes &mdash; les moments o&ugrave; l'app vous a aid&eacute; &agrave; d&eacute;cider, et surtout ceux o&ugrave; elle vous a sembl&eacute; incoh&eacute;rente ou pas digne de confiance.</p>
</td></tr>
<tr><td style="padding:0 40px 36px;">${signature}</td></tr>`
  return { subject: 'Votre accès à la bêta SeaScope est ouvert', html: shell('Votre accès à la bêta SeaScope est ouvert', inner) }
}

export function relanceEmail(c: { prenom: string }): EmailContent {
  const { formUrl } = emailEnv()
  const prenom = esc(c.prenom)
  const inner = `${header('Premier retour&nbsp;?')}
<tr><td style="padding:0 40px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">Bonjour ${prenom},</p>
<p style="margin:0 0 24px;color:#c2d3dd;font-size:15px;line-height:1.6;">Vous avez rejoint la b&ecirc;ta SeaScope il y a quelques jours &mdash; merci encore. Quatre questions rapides&nbsp;:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f2e;border-radius:8px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0;color:#c2d3dd;font-size:14px;line-height:1.9;">1. Avez-vous ouvert l'app&nbsp;?<br>2. Avez-vous pr&eacute;par&eacute; une sortie avec&nbsp;?<br>3. Avez-vous chang&eacute; une d&eacute;cision gr&acirc;ce &agrave; elle (horaire, spot, dur&eacute;e, annulation, retour anticip&eacute;)&nbsp;?<br>4. Qu'est-ce qui vous a g&ecirc;n&eacute; ou sembl&eacute; incoh&eacute;rent&nbsp;?</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px 8px;" align="center">
<a href="${esc(formUrl)}" style="display:inline-block;background-color:#1ec8a5;color:#06151f;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">R&eacute;pondre en 5 minutes</a>
<p style="margin:12px 0 0;color:#7a93a3;font-size:12px;">Ou r&eacute;pondez simplement &agrave; cet email.</p>
</td></tr>
<tr><td style="padding:24px 40px 36px;">
<p style="margin:0 0 16px;color:#c2d3dd;font-size:15px;line-height:1.6;">M&ecirc;me un &laquo;&nbsp;je ne l'ai pas encore ouverte&nbsp;&raquo; est un retour utile. Et si l'installation bloque, r&eacute;pondez-moi directement, on r&egrave;gle &ccedil;a.</p>
${signature}
</td></tr>`
  return { subject: 'Premier retour SeaScope ?', html: shell('Premier retour SeaScope ?', inner) }
}
```

- [ ] **Step 3: Vérifier**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add lib/admin/brevo.ts lib/admin/emails.ts
git commit -m "feat(admin): client Brevo + templates invitation/relance"
```

---

### Task 5: Server Actions du pipeline

**Files:**
- Create: `lib/admin/actions.ts`

- [ ] **Step 1: Écrire `lib/admin/actions.ts`** (fichier complet)

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { getCandidature, prop, updatePage, type StatutCandidature } from '@/lib/admin/notion'
import { sendBrevo } from '@/lib/admin/brevo'
import { invitationEmail, relanceEmail } from '@/lib/admin/emails'

export type ActionResult = { ok: true } | { ok: false; error: string }

export interface BatchItemResult {
  id: string
  prenom: string
  ok: boolean
  error?: string
}

export interface BatchReport {
  ok: boolean
  results: BatchItemResult[]
}

const ADMIN_PATH = '/admin/candidatures'

function fail(e: unknown): { ok: false; error: string } {
  console.error('[admin]', e)
  return { ok: false, error: e instanceof Error ? e.message : 'Erreur interne' }
}

// ── Qualification ─────────────────────────────────────────────────────────────

/** Change le statut. À l'acceptation, pré-remplit Email Google Play avec l'email
 *  de candidature si le champ est encore vide. */
export async function qualifier(id: string, statut: StatutCandidature): Promise<ActionResult> {
  await requireAdmin()
  try {
    const props: Record<string, unknown> = { Statut: prop.select(statut) }
    if (statut === 'Accepté') {
      const c = await getCandidature(id)
      if (!c.emailGooglePlay && c.email) props['Email Google Play'] = prop.email(c.email)
    }
    await updatePage(id, props)
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setPriorite(id: string, priorite: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Priorité bêta': prop.select(priorite) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setCanal(id: string, canal: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Canal de recrutement': prop.select(canal) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function setEmailGooglePlay(id: string, value: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await updatePage(id, { 'Email Google Play': prop.email(value.trim()) })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Invitations / relances (batch séquentiel, un échec ne bloque pas) ─────────

export async function envoyerInvitations(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      // Garde-fou serveur : on relit l'état réel juste avant l'envoi.
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (c.statut !== 'Accepté') throw new Error(`statut « ${c.statut} » — seuls les Acceptés sont invitables`)
      if (c.invitationEnvoyee) throw new Error('invitation déjà envoyée')
      if (!c.emailGooglePlay) throw new Error('Email Google Play manquant')

      const { subject, html } = invitationEmail({ prenom: c.prenom, emailGooglePlay: c.emailGooglePlay })
      await sendBrevo({ email: c.emailGooglePlay, name: c.prenom }, subject, html)

      try {
        await updatePage(id, {
          'Invitation envoyée': prop.checkbox(true),
          'Lien de téléchargement envoyé': prop.checkbox(true),
          'Date invitation envoyée': prop.dateToday(),
          'Statut': prop.select('Invité Google Play'),
        })
      } catch (notionErr) {
        // Email parti mais Notion KO : signaler explicitement, ne pas masquer.
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] invitation', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

export async function envoyerRelances(ids: string[]): Promise<BatchReport> {
  await requireAdmin()
  const results: BatchItemResult[] = []
  for (const id of ids) {
    let prenom = id
    try {
      const c = await getCandidature(id)
      prenom = c.prenom || id
      if (!c.invitationEnvoyee) throw new Error('invitation pas encore envoyée')
      if (c.relanceEnvoyee) throw new Error('relance déjà envoyée')
      const dest = c.emailGooglePlay || c.email
      if (!dest) throw new Error('aucun email')

      const { subject, html } = relanceEmail({ prenom: c.prenom })
      await sendBrevo({ email: dest, name: c.prenom }, subject, html)

      try {
        await updatePage(id, {
          'Relance envoyée': prop.checkbox(true),
          'Date relance': prop.dateToday(),
        })
      } catch (notionErr) {
        throw new Error(`email envoyé MAIS mise à jour Notion échouée — corriger à la main (${notionErr instanceof Error ? notionErr.message : notionErr})`)
      }
      results.push({ id, prenom, ok: true })
    } catch (e) {
      console.error('[admin] relance', id, e)
      results.push({ id, prenom, ok: false, error: e instanceof Error ? e.message : 'Erreur interne' })
    }
  }
  revalidatePath(ADMIN_PATH)
  return { ok: results.every((r) => r.ok), results }
}

// ── Statuts en lot ────────────────────────────────────────────────────────────

export async function marquerActifs(ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) await updatePage(id, { Statut: prop.select('Actif') })
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function qualifierEnLot(ids: string[], statut: StatutCandidature): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) {
      const r = await qualifier(id, statut)
      if (!r.ok) return r
    }
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Export Google Play ────────────────────────────────────────────────────────

export async function marquerExportes(ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    for (const id of ids) await updatePage(id, { 'Export Google Play': prop.checkbox(true) })
    revalidatePath('/admin/candidatures/export')
    revalidatePath(ADMIN_PATH)
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ── Feedbacks ─────────────────────────────────────────────────────────────────

export async function majFeedback(
  id: string,
  champs: { statut?: string; impact?: string; priorite?: string },
): Promise<ActionResult> {
  await requireAdmin()
  try {
    const props: Record<string, unknown> = {}
    if (champs.statut) props['Statut'] = prop.select(champs.statut)
    if (champs.impact) props['Impact'] = prop.select(champs.impact)
    if (champs.priorite) props['Priorité'] = prop.select(champs.priorite)
    if (Object.keys(props).length === 0) return { ok: true }
    await updatePage(id, props)
    revalidatePath('/admin/feedbacks')
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/actions.ts
git commit -m "feat(admin): server actions pipeline (qualif, invitations batch, relances, export, feedbacks)"
```

---

### Task 6: Écran candidatures (KPIs, onglets, table, sélection multiple, modal)

**Files:**
- Create: `app/admin/(protected)/candidatures/page.tsx`
- Create: `components/admin/CandidaturesTable.tsx`
- Create: `components/admin/EmailModal.tsx`
- Create: `components/admin/StatutChip.tsx`

- [ ] **Step 1: Écrire `components/admin/StatutChip.tsx`**

```tsx
const styles: Record<string, string> = {
  'Nouveau': 'bg-blue-400/15 text-blue-400',
  'En cours': 'bg-ss-variable/15 text-ss-variable',
  'En attente': 'bg-gray-400/15 text-gray-400',
  'Accepté': 'bg-ss-bon/15 text-ss-bon',
  'Refusé': 'bg-ss-deconseille/15 text-ss-deconseille',
  'Invité Google Play': 'bg-purple-400/15 text-purple-400',
  'Actif': 'bg-ss-teal/15 text-ss-teal',
  'Inactif': 'bg-amber-700/15 text-amber-600',
}

export default function StatutChip({ statut }: { statut: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[statut] ?? 'bg-gray-400/15 text-gray-400'}`}>
      {statut || '—'}
    </span>
  )
}
```

- [ ] **Step 2: Écrire `app/admin/(protected)/candidatures/page.tsx`**

```tsx
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { queryCandidatures, type Candidature } from '@/lib/admin/notion'
import { invitationEmail, relanceEmail } from '@/lib/admin/emails'
import CandidaturesTable from '@/components/admin/CandidaturesTable'

export const dynamic = 'force-dynamic'

export type TabKey = 'traiter' | 'inviter' | 'invites' | 'relancer' | 'actifs' | 'refuses' | 'tous'

export interface Row extends Candidature {
  aRelancer: boolean
  joursDepuisInvitation: number | null
}

const RELANCE_APRES_JOURS = 5

function enrich(c: Candidature): Row {
  let jours: number | null = null
  if (c.dateInvitation) {
    jours = Math.floor((Date.now() - new Date(c.dateInvitation).getTime()) / 86_400_000)
  }
  const aRelancer =
    c.invitationEnvoyee && !c.relanceEnvoyee && c.retoursCount === 0 &&
    jours !== null && jours >= RELANCE_APRES_JOURS &&
    (c.statut === 'Invité Google Play' || c.statut === 'Actif')
  return { ...c, aRelancer, joursDepuisInvitation: jours }
}

const filters: Record<TabKey, (r: Row) => boolean> = {
  traiter: (r) => ['Nouveau', 'En cours', 'En attente'].includes(r.statut),
  inviter: (r) => r.statut === 'Accepté' && !r.invitationEnvoyee,
  invites: (r) => r.statut === 'Invité Google Play',
  relancer: (r) => r.aRelancer,
  actifs: (r) => r.statut === 'Actif',
  refuses: (r) => ['Refusé', 'Inactif'].includes(r.statut),
  tous: () => true,
}

const tabLabels: Record<TabKey, string> = {
  traiter: '📋 À traiter', inviter: '✅ À inviter', invites: '📨 Invités',
  relancer: '🔁 À relancer', actifs: '🟢 Actifs', refuses: '❌ Refusés', tous: 'Tous',
}

export default async function CandidaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab: rawTab } = await searchParams
  const tab: TabKey = (Object.keys(filters) as TabKey[]).includes(rawTab as TabKey) ? (rawTab as TabKey) : 'traiter'

  const rows = (await queryCandidatures()).map(enrich)
  const counts = Object.fromEntries(
    (Object.keys(filters) as TabKey[]).map((k) => [k, rows.filter(filters[k]).length]),
  ) as Record<TabKey, number>

  // Aperçus générés côté serveur (les env GOOGLE_PLAY_URL etc. restent serveur).
  const previewInvitation = invitationEmail({ prenom: '{Prénom}', emailGooglePlay: '{email Google Play}' }).html
  const previewRelance = relanceEmail({ prenom: '{Prénom}' }).html

  const kpis: Array<{ tab: TabKey; label: string; alert?: boolean }> = [
    { tab: 'traiter', label: '📋 À traiter' },
    { tab: 'inviter', label: '✅ À inviter' },
    { tab: 'invites', label: '📨 Invités' },
    { tab: 'relancer', label: '🔁 À relancer', alert: true },
    { tab: 'actifs', label: '🟢 Actifs' },
  ]

  return (
    <main className="px-6 py-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {kpis.map((k) => (
          <Link
            key={k.tab}
            href={`/admin/candidatures?tab=${k.tab}`}
            className="rounded-ss border border-ss-teal/12 bg-ss-surface-2 px-3.5 py-3 hover:border-ss-teal/40"
          >
            <b className={`block text-2xl ${k.alert && counts[k.tab] > 0 ? 'text-ss-variable' : 'text-white'}`}>
              {counts[k.tab]}
            </b>
            <span className="text-[11px] text-ss-fg/70">{k.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-1">
        {(Object.keys(tabLabels) as TabKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin/candidatures?tab=${k}`}
            className={`rounded-t-md px-3.5 py-2 text-[13px] ${k === tab ? 'bg-ss-surface-2 text-ss-teal' : 'text-ss-fg/60 hover:text-ss-fg'}`}
          >
            {tabLabels[k]} ({counts[k]})
          </Link>
        ))}
      </div>

      <CandidaturesTable
        rows={rows.filter(filters[tab])}
        tab={tab}
        previewInvitation={previewInvitation}
        previewRelance={previewRelance}
      />
    </main>
  )
}
```

- [ ] **Step 3: Écrire `components/admin/EmailModal.tsx`**

```tsx
'use client'

import type { BatchReport } from '@/lib/admin/actions'

export interface ModalState {
  mode: 'invitation' | 'relance'
  recipients: Array<{ id: string; prenom: string; email: string }>
}

export default function EmailModal({
  state, previewHtml, sending, report, onConfirm, onClose,
}: {
  state: ModalState
  previewHtml: string
  sending: boolean
  report: BatchReport | null
  onConfirm: () => void
  onClose: () => void
}) {
  const n = state.recipients.length
  const label = state.mode === 'invitation' ? 'invitation' : 'relance'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-ss-lg border border-ss-teal/25 bg-ss-bg-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 px-6 py-4 text-sm font-bold text-ss-teal">
          Aperçu — {n} {label}{n > 1 ? 's' : ''}
        </div>

        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {state.recipients.map((r) => (
            <span key={r.id} className="rounded-full border border-ss-teal/20 bg-ss-surface-2 px-3.5 py-1 text-xs">
              <b className="text-ss-teal">{r.prenom}</b> · {r.email}
            </span>
          ))}
        </div>

        {report ? (
          <div className="m-6 space-y-1.5 rounded-ss bg-ss-surface-2 p-5 text-sm">
            <p className="mb-3 font-semibold">{report.ok ? '✅ Tous les envois ont réussi' : '⚠️ Certains envois ont échoué'}</p>
            {report.results.map((r) => (
              <p key={r.id} className={r.ok ? 'text-ss-bon' : 'text-ss-deconseille'}>
                {r.ok ? '✓' : '✕'} {r.prenom}{r.error ? ` — ${r.error}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <iframe
            srcDoc={previewHtml}
            sandbox=""
            title="Aperçu email"
            className="m-6 h-96 w-[calc(100%-3rem)] rounded-ss border border-white/10 bg-white"
          />
        )}

        <div className="flex items-center gap-2.5 px-6 pb-5">
          {!report && (
            <span className="mr-auto text-[11px] leading-relaxed text-ss-fg/60">
              {state.mode === 'invitation'
                ? 'Après envoi (par destinataire) : ☑ Invitation envoyée · ☑ Lien envoyé · 📅 Date du jour · Statut → Invité Google Play'
                : 'Après envoi (par destinataire) : ☑ Relance envoyée · 📅 Date relance = aujourd’hui'}
              <br />Envois séquentiels — un échec n’interrompt pas les suivants.
            </span>
          )}
          <button onClick={onClose} className="ml-auto rounded-md border border-gray-400/25 bg-gray-400/10 px-4 py-2 text-xs font-semibold">
            {report ? 'Fermer' : 'Annuler'}
          </button>
          {!report && (
            <button
              onClick={onConfirm}
              disabled={sending}
              className="rounded-md bg-ss-teal px-4 py-2 text-xs font-bold text-ss-bg disabled:opacity-50"
            >
              {sending ? 'Envoi…' : `Confirmer (${n} envoi${n > 1 ? 's' : ''})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Écrire `components/admin/CandidaturesTable.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import StatutChip from '@/components/admin/StatutChip'
import EmailModal, { type ModalState } from '@/components/admin/EmailModal'
import {
  envoyerInvitations, envoyerRelances, marquerActifs, qualifier, qualifierEnLot,
  setCanal, setEmailGooglePlay, setPriorite, type BatchReport,
} from '@/lib/admin/actions'
import type { Row, TabKey } from '@/app/admin/(protected)/candidatures/page'

const CANAUX = ['', 'LinkedIn', 'Facebook', 'Hisse Et Oh', 'Bouche-à-oreille', 'Autre']
const PRIORITES = ['', 'Haute', 'Moyenne', 'Basse']

export default function CandidaturesTable({
  rows, tab, previewInvitation, previewRelance,
}: {
  rows: Row[]
  tab: TabKey
  previewInvitation: string
  previewRelance: string
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalState | null>(null)
  const [report, setReport] = useState<BatchReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null)
      const r = await fn()
      if (!r.ok) setError(r.error ?? 'Erreur')
      setSelected(new Set())
    })

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))

  const openModal = (mode: ModalState['mode'], targets: Row[]) => {
    setReport(null)
    setModal({
      mode,
      recipients: targets.map((r) => ({ id: r.id, prenom: r.prenom, email: r.emailGooglePlay || r.email })),
    })
  }

  const confirmModal = () => {
    if (!modal) return
    startTransition(async () => {
      const ids = modal.recipients.map((r) => r.id)
      const rep = modal.mode === 'invitation' ? await envoyerInvitations(ids) : await envoyerRelances(ids)
      setReport(rep)
      setSelected(new Set())
    })
  }

  const selRows = rows.filter((r) => selected.has(r.id))

  return (
    <div className="rounded-b-ss rounded-tr-ss bg-ss-bg-2 pb-2">
      {error && (
        <p className="mx-4 mt-3 rounded-md border border-ss-deconseille/40 bg-ss-deconseille/10 px-4 py-2 text-sm text-ss-deconseille">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="w-9 px-3 py-2.5">
                <input type="checkbox" className="accent-ss-teal" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2.5">Candidat</th>
              <th className="px-3 py-2.5">Profil</th>
              <th className="px-3 py-2.5">Email Google Play</th>
              <th className="px-3 py-2.5">Priorité</th>
              {tab === 'traiter' && <th className="px-3 py-2.5">Canal</th>}
              <th className="px-3 py-2.5">Statut</th>
              <th className="min-w-[240px] px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ss-fg/50">Aucune candidature dans cet onglet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={`border-b border-white/5 align-middle ${selected.has(r.id) ? 'bg-ss-teal/5' : ''}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" className="accent-ss-teal" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="px-3 py-3">
                  <b>{r.prenom}</b>
                  {r.aRelancer && <span className="ml-2 text-[10px] text-ss-variable">⚠ J+{r.joursDepuisInvitation} sans retour</span>}
                  <br />
                  <span className="text-xs text-ss-fg/55">{r.email} · {r.region}</span>
                </td>
                <td className="px-3 py-3">
                  {r.typeNav} · {r.frequence}
                  <br /><span className="text-xs text-ss-fg/55">{r.pratique}</span>
                </td>
                <td className="px-3 py-3">
                  <input
                    type="email"
                    defaultValue={r.emailGooglePlay}
                    placeholder="—"
                    onBlur={(e) => {
                      if (e.target.value !== r.emailGooglePlay) run(() => setEmailGooglePlay(r.id, e.target.value))
                    }}
                    className="w-44 rounded-md border border-ss-teal/25 bg-ss-surface px-2 py-1 text-xs outline-none focus:border-ss-teal"
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    defaultValue={r.priorite}
                    onChange={(e) => run(() => setPriorite(r.id, e.target.value))}
                    className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs"
                  >
                    {PRIORITES.map((p) => <option key={p} value={p}>{p || '—'}</option>)}
                  </select>
                </td>
                {tab === 'traiter' && (
                  <td className="px-3 py-3">
                    <select
                      defaultValue={r.canal}
                      onChange={(e) => run(() => setCanal(r.id, e.target.value))}
                      className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs"
                    >
                      {CANAUX.map((c) => <option key={c} value={c}>{c || '—'}</option>)}
                    </select>
                  </td>
                )}
                <td className="px-3 py-3">
                  <StatutChip statut={r.statut} />
                  {r.dateInvitation && <><br /><span className="text-[11px] text-ss-fg/50">invité le {r.dateInvitation}</span></>}
                  {r.relanceEnvoyee && r.dateRelance && <><br /><span className="text-[11px] text-ss-variable/80">relancé le {r.dateRelance}</span></>}
                </td>
                <td className="px-3 py-3">
                  <RowActions row={r} disabled={pending} onQualifier={(s) => run(() => qualifier(r.id, s))} onInvite={() => openModal('invitation', [r])} onRelance={() => openModal('relance', [r])} onActif={() => run(() => marquerActifs([r.id]))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-3 mx-4 mt-3 flex items-center gap-2.5 rounded-ss border border-ss-teal/40 bg-ss-bg px-4 py-3 shadow-2xl">
          <span className="mr-2 text-[13px] font-bold text-ss-teal">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
          {tab === 'traiter' && (
            <>
              <BulkBtn kind="ok" label="✓ Accepter la sélection" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'Accepté'))} />
              <BulkBtn kind="ko" label="✕ Refuser" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'Refusé'))} />
              <BulkBtn kind="neutral" label="⏸ En attente" disabled={pending} onClick={() => run(() => qualifierEnLot([...selected], 'En attente'))} />
            </>
          )}
          {tab === 'inviter' && (
            <BulkBtn kind="primary" label="✉️ Envoyer les invitations" disabled={pending} onClick={() => openModal('invitation', selRows)} />
          )}
          {(tab === 'invites' || tab === 'relancer') && (
            <>
              <BulkBtn kind="warn" label="🔁 Relancer la sélection" disabled={pending} onClick={() => openModal('relance', selRows.filter((r) => !r.relanceEnvoyee))} />
              <BulkBtn kind="ok" label="🟢 Marquer actifs" disabled={pending} onClick={() => run(() => marquerActifs([...selected]))} />
            </>
          )}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-ss-fg/50 underline">
            Tout désélectionner
          </button>
        </div>
      )}

      {modal && (
        <EmailModal
          state={modal}
          previewHtml={modal.mode === 'invitation' ? previewInvitation : previewRelance}
          sending={pending}
          report={report}
          onConfirm={confirmModal}
          onClose={() => { setModal(null); setReport(null) }}
        />
      )}
    </div>
  )
}

const btnStyles = {
  ok: 'border border-ss-bon/30 bg-ss-bon/15 text-ss-bon',
  ko: 'border border-ss-deconseille/25 bg-ss-deconseille/10 text-ss-deconseille',
  neutral: 'border border-gray-400/25 bg-gray-400/10 text-gray-300',
  primary: 'bg-ss-teal text-ss-bg',
  warn: 'border border-ss-variable/30 bg-ss-variable/15 text-ss-variable',
} as const

function BulkBtn({ kind, label, disabled, onClick }: { kind: keyof typeof btnStyles; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${btnStyles[kind]}`}>
      {label}
    </button>
  )
}

function RowActions({ row, disabled, onQualifier, onInvite, onRelance, onActif }: {
  row: Row
  disabled: boolean
  onQualifier: (s: 'Accepté' | 'Refusé' | 'En attente') => void
  onInvite: () => void
  onRelance: () => void
  onActif: () => void
}) {
  // Boutons explicites avec libellés (maquette v1 validée).
  if (['Nouveau', 'En cours', 'En attente'].includes(row.statut)) {
    return (
      <span className="flex flex-wrap gap-1.5">
        <BulkBtn kind="ok" label="✓ Accepter" disabled={disabled} onClick={() => onQualifier('Accepté')} />
        <BulkBtn kind="ko" label="✕ Refuser" disabled={disabled} onClick={() => onQualifier('Refusé')} />
        {row.statut !== 'En attente' && <BulkBtn kind="neutral" label="⏸ Attente" disabled={disabled} onClick={() => onQualifier('En attente')} />}
      </span>
    )
  }
  if (row.statut === 'Accepté') {
    return row.invitationEnvoyee
      ? <BulkBtn kind="primary" label="✉️ Invité ✓" disabled onClick={() => {}} />
      : <BulkBtn kind="primary" label="✉️ Envoyer invitation" disabled={disabled || !row.emailGooglePlay} onClick={onInvite} />
  }
  if (row.statut === 'Invité Google Play' || row.statut === 'Actif') {
    return (
      <span className="flex flex-wrap gap-1.5">
        {row.statut !== 'Actif' && <BulkBtn kind="ok" label="🟢 Marquer actif" disabled={disabled} onClick={onActif} />}
        {row.relanceEnvoyee
          ? <BulkBtn kind="warn" label="🔁 Relancé ✓" disabled onClick={() => {}} />
          : <BulkBtn kind="warn" label="🔁 Relancer" disabled={disabled} onClick={onRelance} />}
      </span>
    )
  }
  return null
}
```

- [ ] **Step 5: Vérifier**

Run: `pnpm typecheck && pnpm dev`
Expected: typecheck OK. `/admin/candidatures` affiche KPIs + onglets + les vraies candidatures Notion. Changer une priorité → vérifier la valeur dans Notion. Cocher 2 lignes → barre groupée contextuelle. Ouvrir le modal d'invitation (ne **pas** confirmer) → aperçu HTML + chips destinataires.

- [ ] **Step 6: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(admin): écran candidatures (KPIs, onglets, sélection multiple, modal envoi)"
```

---

### Task 7: Export Google Play (page + route CSV)

**Files:**
- Create: `app/admin/(protected)/candidatures/export/page.tsx`
- Create: `app/admin/(protected)/candidatures/export/csv/route.ts`
- Create: `components/admin/MarkExportedButton.tsx`

- [ ] **Step 1: Écrire `app/admin/(protected)/candidatures/export/csv/route.ts`**

```ts
import { isAuthenticated } from '@/lib/admin/auth'
import { queryCandidatures } from '@/lib/admin/notion'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthenticated())) return new Response('Unauthorized', { status: 401 })

  const rows = await queryCandidatures()
  const emails = rows
    .filter((r) => r.statut === 'Accepté' && r.emailGooglePlay && !r.exportGooglePlay)
    .map((r) => r.emailGooglePlay)

  // Format liste de testeurs Google Play Console : un email par ligne, sans en-tête.
  const body = emails.join('\n') + (emails.length ? '\n' : '')
  const today = new Date().toISOString().slice(0, 10)

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="seascope-testeurs-${today}.csv"`,
    },
  })
}
```

- [ ] **Step 2: Écrire `components/admin/MarkExportedButton.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { marquerExportes } from '@/lib/admin/actions'

export default function MarkExportedButton({ ids }: { ids: string[] }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span>
      <button
        disabled={pending || ids.length === 0}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const r = await marquerExportes(ids)
            if (!r.ok) setError(r.error ?? 'Erreur')
          })
        }
        className="rounded-md border border-gray-400/25 bg-gray-400/10 px-5 py-2.5 text-xs font-semibold text-gray-300 disabled:opacity-40"
      >
        {pending ? 'Marquage…' : `☑ Marquer comme exportés (${ids.length})`}
      </button>
      {error && <span className="ml-3 text-xs text-ss-deconseille">{error}</span>}
    </span>
  )
}
```

- [ ] **Step 3: Écrire `app/admin/(protected)/candidatures/export/page.tsx`**

```tsx
import { requireAdmin } from '@/lib/admin/auth'
import { queryCandidatures } from '@/lib/admin/notion'
import StatutChip from '@/components/admin/StatutChip'
import MarkExportedButton from '@/components/admin/MarkExportedButton'

export const dynamic = 'force-dynamic'

export default async function ExportPage() {
  await requireAdmin()
  const rows = (await queryCandidatures()).filter(
    (r) => r.statut === 'Accepté' && r.emailGooglePlay && !r.exportGooglePlay,
  )

  return (
    <main className="px-6 py-6">
      <h1 className="text-base font-semibold text-white">📤 Export Google Play Console</h1>
      <p className="mt-1.5 text-sm text-ss-fg/55">
        {rows.length} candidat{rows.length > 1 ? 's' : ''} accepté{rows.length > 1 ? 's' : ''}, email Google Play renseigné, pas encore exporté{rows.length > 1 ? 's' : ''}.
      </p>

      <div className="mt-4 overflow-x-auto rounded-ss bg-ss-bg-2">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="px-3 py-2.5">Candidat</th>
              <th className="px-3 py-2.5">Email Google Play</th>
              <th className="px-3 py-2.5">Région</th>
              <th className="px-3 py-2.5">Navigation</th>
              <th className="px-3 py-2.5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ss-fg/50">Rien à exporter.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="px-3 py-3 font-semibold">{r.prenom}</td>
                <td className="px-3 py-3">{r.emailGooglePlay}</td>
                <td className="px-3 py-3">{r.region}</td>
                <td className="px-3 py-3">{r.typeNav}</td>
                <td className="px-3 py-3"><StatutChip statut={r.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <a
          href="/admin/candidatures/export/csv"
          className={`rounded-md bg-ss-teal px-5 py-2.5 text-xs font-bold text-ss-bg ${rows.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
        >
          ⬇ Télécharger le CSV ({rows.length} email{rows.length > 1 ? 's' : ''})
        </a>
        <MarkExportedButton ids={rows.map((r) => r.id)} />
        <span className="text-xs text-ss-fg/55">Un email par ligne — format liste de testeurs Google Play. Marquez exportés <b>après</b> l’import dans la Console.</span>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Vérifier**

Run: `pnpm typecheck && pnpm dev`
Expected: typecheck OK. `/admin/candidatures/export` liste les bons candidats ; le téléchargement CSV contient un email par ligne ; `/admin/candidatures/export/csv` **sans cookie** (navigation privée) → 401.

- [ ] **Step 5: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(admin): export CSV Google Play + marquage exportés"
```

---

### Task 8: Écran feedbacks

**Files:**
- Create: `app/admin/(protected)/feedbacks/page.tsx`
- Create: `components/admin/FeedbackRow.tsx`

- [ ] **Step 1: Écrire `components/admin/FeedbackRow.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { majFeedback } from '@/lib/admin/actions'
import type { Feedback } from '@/lib/admin/notion'

const IMPACTS = ['', 'Bloquant', 'Gênant', 'Mineur']
const PRIORITES = ['', 'P0', 'P1', 'P2', 'P3']
const STATUTS = ['Nouveau', 'À investiguer', 'En cours', 'Résolu', 'Ignoré']

const typeStyles: Record<string, string> = {
  'Bug': 'bg-ss-deconseille/12 text-ss-deconseille',
  'Incohérence météo': 'bg-purple-400/15 text-purple-400',
  'Problème de confiance': 'bg-pink-400/15 text-pink-400',
  'Recommandation incorrecte': 'bg-ss-delicat/15 text-ss-delicat',
  'Donnée manquante': 'bg-ss-variable/15 text-ss-variable',
  'Interface confuse': 'bg-blue-400/15 text-blue-400',
  'Suggestion': 'bg-ss-bon/15 text-ss-bon',
}

function Sel({ value, options, onChange, disabled }: { value: string; options: string[]; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <select
      defaultValue={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-white/15 bg-ss-surface px-1.5 py-1 text-xs disabled:opacity-40"
    >
      {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
    </select>
  )
}

export default function FeedbackRow({ fb }: { fb: Feedback }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const update = (champs: { statut?: string; impact?: string; priorite?: string }) =>
    startTransition(async () => {
      setError(null)
      const r = await majFeedback(fb.id, champs)
      if (!r.ok) setError(r.error ?? 'Erreur')
    })

  return (
    <tr className="border-b border-white/5 align-top">
      <td className="px-3 py-3">
        <b>{fb.email}</b>
        <br /><span className="text-[11px] text-ss-fg/50">{fb.date}{fb.spot ? ` · ${fb.spot}` : ''}</span>
        {error && <p className="mt-1 text-[11px] text-ss-deconseille">{error}</p>}
      </td>
      <td className="px-3 py-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeStyles[fb.typeRetour] ?? 'bg-gray-400/15 text-gray-400'}`}>
          {fb.typeRetour || '—'}
        </span>
      </td>
      <td className="max-w-[320px] px-3 py-3 text-xs text-ss-fg/65">
        {fb.description.length > 140 ? `${fb.description.slice(0, 140)}…` : fb.description || '—'}
      </td>
      <td className="px-3 py-3"><Sel value={fb.impact} options={IMPACTS} disabled={pending} onChange={(v) => update({ impact: v })} /></td>
      <td className="px-3 py-3"><Sel value={fb.priorite} options={PRIORITES} disabled={pending} onChange={(v) => update({ priorite: v })} /></td>
      <td className="px-3 py-3"><Sel value={fb.statut} options={STATUTS} disabled={pending} onChange={(v) => update({ statut: v })} /></td>
      <td className="px-3 py-3">
        <a href={fb.notionUrl} target="_blank" rel="noreferrer" className="text-xs text-ss-teal hover:underline">Notion ↗</a>
      </td>
    </tr>
  )
}
```

- [ ] **Step 2: Écrire `app/admin/(protected)/feedbacks/page.tsx`**

```tsx
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { queryFeedbacks, type Feedback } from '@/lib/admin/notion'
import FeedbackRow from '@/components/admin/FeedbackRow'

export const dynamic = 'force-dynamic'

type FbTab = 'nontraites' | 'encours' | 'tous'

const filters: Record<FbTab, (f: Feedback) => boolean> = {
  nontraites: (f) => ['Nouveau', 'À investiguer', ''].includes(f.statut),
  encours: (f) => f.statut === 'En cours',
  tous: () => true,
}

const labels: Record<FbTab, string> = { nontraites: '🚨 Non traités', encours: 'En cours', tous: 'Tous' }

export default async function FeedbacksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab: rawTab } = await searchParams
  const tab: FbTab = (Object.keys(filters) as FbTab[]).includes(rawTab as FbTab) ? (rawTab as FbTab) : 'nontraites'

  const all = await queryFeedbacks()
  const rows = all.filter(filters[tab])

  return (
    <main className="px-6 py-5">
      <div className="flex flex-wrap gap-1">
        {(Object.keys(labels) as FbTab[]).map((k) => (
          <Link
            key={k}
            href={`/admin/feedbacks?tab=${k}`}
            className={`rounded-t-md px-3.5 py-2 text-[13px] ${k === tab ? 'bg-ss-surface-2 text-ss-teal' : 'text-ss-fg/60 hover:text-ss-fg'}`}
          >
            {labels[k]} ({all.filter(filters[k]).length})
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-b-ss rounded-tr-ss bg-ss-bg-2">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ss-fg/50">
              <th className="px-3 py-2.5">Testeur</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Description</th>
              <th className="px-3 py-2.5">Impact</th>
              <th className="px-3 py-2.5">Priorité</th>
              <th className="px-3 py-2.5">Statut</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ss-fg/50">Aucun retour ici.</td></tr>
            )}
            {rows.map((fb) => <FeedbackRow key={fb.id} fb={fb} />)}
          </tbody>
        </table>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Vérifier**

Run: `pnpm typecheck && pnpm dev`
Expected: typecheck OK. `/admin/feedbacks` affiche les retours Notion ; changer un Impact → la valeur apparaît dans Notion ; lien « Notion ↗ » ouvre la fiche.

- [ ] **Step 4: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(admin): écran triage feedbacks"
```

---

### Task 9: Vérification finale

**Files:** aucun nouveau.

- [ ] **Step 1: Lint + typecheck complets**

Run: `pnpm typecheck && pnpm lint`
Expected: les deux verts. Corriger toute erreur avant de continuer.

- [ ] **Step 2: Build de production**

Run: `pnpm build`
Expected: build OK, routes `/admin/*` listées en dynamique (ƒ).

- [ ] **Step 3: Smoke test complet (dev, checklist spec)**

1. `/admin/candidatures` sans cookie → redirect `/admin/login`. Mauvais mdp → erreur. Bon mdp → dashboard.
2. Onglet À traiter : passer une candidature de test en `Accepté` → vérifier dans Notion : Statut + `Email Google Play` pré-rempli.
3. Modal invitation sur cette candidature (email perso en `Email Google Play`) → Confirmer → email reçu, et dans Notion : ☑ Invitation envoyée, ☑ Lien envoyé, date du jour, Statut `Invité Google Play`. Re-tenter → bouton `✉️ Invité ✓` désactivé.
4. Export : la candidature invitée n'apparaît **plus** (déjà invitée) — en accepter une 2e, vérifier CSV puis « Marquer comme exportés » → case cochée dans Notion.
5. Feedbacks : modifier Impact/Priorité/Statut → vérifié dans Notion.
6. Remettre les données de test dans leur état initial dans Notion.

- [ ] **Step 4: Commit final éventuel + push**

```bash
git status   # rien d'oublié
git push -u origin feat-backoffice-dashboard
```

---

## Self-review (effectuée)

- **Couverture spec :** auth (T1–T2), couche Notion (T3), Brevo/emails (T4), actions + garde-fous anti-double-envoi + rapport batch (T5), écran candidatures avec boutons v1 + sélection multiple + badge J+N + modal aperçu (T6), export CSV 2 étapes (T7), feedbacks (T8), env vars (T1), vérification (T9). ✔
- **Placeholders :** aucun TBD/TODO ; tout le code est complet. ✔
- **Cohérence des types :** `Row`/`TabKey` exportés par `candidatures/page.tsx` et importés par la table ; `BatchReport` défini dans `actions.ts`, consommé par `EmailModal`/`CandidaturesTable` ; `prop.*` builders utilisés partout pour les PATCH. ✔
