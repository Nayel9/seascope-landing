# SeaScope Next.js Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, deployable Next.js 15 landing page for SeaScope — a coastal navigation decision companion — featuring 8 content sections, interactive React components, and accessible forms.

**Architecture:** App Router with mostly server components; interactive sections (Personalization, BetaForm, FeedbackForm) are isolated client components via `'use client'`. The `Reveal` wrapper is a client-component leaf used inside server-component sections for scroll animations. Tailwind CSS v3 carries the full SeaScope design system via theme extension (no custom CSS classes except base resets in `globals.css`).

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 3 · `clsx` · `geist` fonts · Next.js `<Image>` · zero other runtime deps

---

## File Structure

```
seascope-landing/
├── app/
│   ├── globals.css          ← Tailwind directives + base body/selection styles
│   ├── layout.tsx           ← Root layout: Geist fonts, metadata, body class
│   └── page.tsx             ← Assembles all sections
├── components/
│   ├── layout/
│   │   ├── Nav.tsx          ← Sticky nav, blur backdrop, logo, links, CTA
│   │   └── Footer.tsx       ← Brand, product links, programme beta links, legal
│   ├── sections/
│   │   ├── Hero.tsx         ← Headline, sub, CTAs, device frame, 3 callouts
│   │   ├── Problem.tsx      ← 5-card grid with inline sparkline SVGs
│   │   ├── HowItWorks.tsx   ← 3 step cards with spot/fusion/signal visuals
│   │   ├── Personalization.tsx  ← 'use client': persona+tol picker, scenario cards
│   │   ├── Trust.tsx        ← 6-item trust grid
│   │   ├── BetaForm.tsx     ← 'use client': full form, chip groups, validation, success
│   │   ├── FeedbackLoop.tsx ← 3-step loop description (static)
│   │   └── FeedbackForm.tsx ← 'use client': feedback form, file upload, success
│   └── ui/
│       ├── icons.tsx        ← All SVG icon components (no external icon lib)
│       ├── Reveal.tsx       ← 'use client': IntersectionObserver fade-up wrapper
│       ├── Button.tsx       ← Polymorphic button/link with variant+size props
│       ├── Pill.tsx         ← Decision level pill (BON/VARIABLE/DÉLICAT/DÉCONSEILLÉ)
│       ├── Chip.tsx         ← Single-select chip button for form groups
│       ├── Kicker.tsx       ← Section eyebrow with teal dot
│       ├── DeviceFrame.tsx  ← Phone device mockup wrapper
│       ├── Callout.tsx      ← Floating annotation card (hidden on mobile)
│       └── SectionHeader.tsx ← 2-col kicker + h2 + lead layout
├── hooks/
│   └── useInView.ts         ← IntersectionObserver hook → [ref, inView]
├── lib/
│   └── data.ts              ← PERSONAS, TOLERANCES, REC_CARDS, form option arrays
├── public/
│   └── assets/              ← screen-bon.png, screen-delicat.png, screen-personas.png, screen-tolerance.png
├── types/
│   └── index.ts             ← DecisionLevel, PersonaId, ToleranceId, Persona, Tolerance, RecCard, Reason
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Design System Reference

The following Tailwind class patterns are used throughout. **Never use inline style for colors** — use these classes.

| Concept | Class |
|---|---|
| Page bg | `bg-ss-bg` |
| Alt band bg | `bg-ss-bg-2` |
| Card surface | `bg-ss-surface` |
| Elevated card | `bg-ss-surface-2` |
| Hover surface | `bg-ss-surface-hi` |
| Subtle border | `border-white/7` |
| Visible border | `border-white/14` |
| Body text | `text-ss-fg` |
| Soft text (72%) | `text-ss-fg/72` |
| Muted text (50%) | `text-ss-fg/50` |
| Faint text (32%) | `text-ss-fg/32` |
| Ghost text (18%) | `text-ss-fg/18` |
| Teal accent | `text-ss-teal` / `bg-ss-teal` |
| Decision: BON | `text-ss-bon bg-ss-bon/10` |
| Decision: VARIABLE | `text-ss-variable bg-ss-variable/10` |
| Decision: DÉLICAT | `text-ss-delicat bg-ss-delicat/10` |
| Decision: DÉCONSEILLÉ | `text-ss-deconseille bg-ss-deconseille/10` |
| Return indicator | `text-ss-rentrer` |
| Font mono | `font-mono` |
| Kicker tracking | `tracking-[0.18em]` |
| Label tracking | `tracking-[0.14em]` |
| Container | `max-w-landing mx-auto px-8` (≤ 720px: `px-5`) |
| Section padding | `py-[120px]` (band sections also get `bg-ss-bg-2 border-y border-white/7`) |
| Card | `bg-ss-surface border border-white/7 rounded-ss-lg p-7` |
| Radius lg | `rounded-ss-lg` (20px) |
| Radius xl | `rounded-ss-xl` (28px) |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `.gitignore`
- Run: `npm install`
- Run: asset copy to `public/assets/`

- [ ] **Step 1.1: Create `package.json`**

```json
{
  "name": "seascope-landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "geist": "^1.3.1",
    "next": "15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

- [ ] **Step 1.2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 1.3: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

- [ ] **Step 1.4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
export default config
```

- [ ] **Step 1.5: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ss-bg':          '#061425',
        'ss-bg-2':        '#081A2D',
        'ss-surface':     '#0E2236',
        'ss-surface-2':   '#14293F',
        'ss-surface-hi':  '#1B334C',
        'ss-fg':          '#E6EEF6',
        'ss-teal':        '#5EEAD4',
        'ss-teal-ink':    '#2DD4BF',
        'ss-teal-deep':   '#0E4D49',
        'ss-bon':         '#34D399',
        'ss-bon-ink':     '#6EE7B7',
        'ss-variable':    '#FBBF24',
        'ss-delicat':     '#F59E0B',
        'ss-deconseille': '#EF4444',
        'ss-rentrer':     '#FF6B6B',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      maxWidth: {
        landing: '1240px',
      },
      borderRadius: {
        ss:    '12px',
        'ss-lg': '20px',
        'ss-xl': '28px',
        'ss-2xl': '44px',
      },
      opacity: {
        '4':  '0.04',
        '7':  '0.07',
        '14': '0.14',
        '18': '0.18',
        '32': '0.32',
        '72': '0.72',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 1.6: Create `.gitignore`**

```
# deps
/node_modules

# Next.js
/.next/
/out/

# build
/build

# misc
.DS_Store
*.pem
.env*.local
npm-debug.log*
.vercel
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 1.7: Copy screenshot assets to `public/assets/`**

```bash
mkdir -p public/assets
cp assets/screen-bon.png public/assets/
cp assets/screen-delicat.png public/assets/
cp assets/screen-personas.png public/assets/
cp assets/screen-tolerance.png public/assets/
```

- [ ] **Step 1.8: Install dependencies**

```bash
npm install
```

Expected: `node_modules` created, no errors.

- [ ] **Step 1.9: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts .gitignore public/assets/
git commit -m "chore: scaffold Next.js 15 + Tailwind v3 project"
```

---

## Task 2: Foundation — Types, Data, Hooks, App Shell

**Files:**
- Create: `types/index.ts`
- Create: `lib/data.ts`
- Create: `hooks/useInView.ts`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 2.1: Create `types/index.ts`**

```ts
export type DecisionLevel = 'bon' | 'variable' | 'delicat' | 'deconseille'
export type PersonaId = 'balade' | 'famille' | 'courte' | 'peche' | 'sport'
export type ToleranceId = 'tranquille' | 'vivante' | 'engagee'

export interface Persona {
  id: PersonaId
  name: string
  desc: string
}

export interface Tolerance {
  id: ToleranceId
  name: string
  sub: string
  bars: 1 | 2 | 3
}

export interface Reason {
  state: 'good' | 'warn' | 'bad'
  icon: 'wind' | 'wave' | 'bolt' | 'clock' | 'compass'
  text: string
}

export interface RecCard {
  kind: DecisionLevel
  pill: string
  score: string
  title: string
  window: string
  ret: string
  reasons: Reason[]
}

export interface BetaFormValues {
  firstname: string
  email: string
  region: string
  navType: string
  freq: string
  boat: string
  platform: string
  practice: string
  blocker: string
  consent: boolean
}

export interface FeedbackFormValues {
  email: string
  fbtype: string
  spot: string
  what: string
  expected: string
}
```

- [ ] **Step 2.2: Create `lib/data.ts`**

```ts
import type { Persona, Tolerance, RecCard, ToleranceId } from '@/types'

export const PERSONAS: Persona[] = [
  { id: 'balade',  name: 'Balade côtière',      desc: 'Sortie tranquille, plaisir de naviguer.' },
  { id: 'famille', name: 'Sortie familiale',    desc: 'Équipage varié, confort et sécurité.' },
  { id: 'courte',  name: 'Session courte',      desc: 'Peu de temps, fenêtre optimisée.' },
  { id: 'peche',   name: 'Pêche côtière',       desc: 'Stabilité, mouillage, mer calme.' },
  { id: 'sport',   name: 'Navigation sportive', desc: 'Vent, vitesse, conditions engagées.' },
]

export const TOLERANCES: Tolerance[] = [
  { id: 'tranquille', name: 'Tranquille', sub: 'Mer clémente, sortie sereine.',   bars: 1 },
  { id: 'vivante',    name: 'Vivante',    sub: 'Du relief, ni sage ni chargé.',   bars: 2 },
  { id: 'engagee',    name: 'Engagée',    sub: 'Sportif, vent et mer formée.',    bars: 3 },
]

export const REC_CARDS: Record<ToleranceId, RecCard> = {
  tranquille: {
    kind: 'deconseille', pill: 'DÉCONSEILLÉ', score: '22',
    title: 'Conditions au-dessus de votre confort',
    window: 'Aucune fenêtre', ret: '—',
    reasons: [
      { state: 'bad',  icon: 'wind',  text: 'Rafales 18 nd — dépasse limite 12 nd' },
      { state: 'bad',  icon: 'wave',  text: 'Vagues 1.4 m — dépasse limite 0.8 m' },
      { state: 'warn', icon: 'bolt',  text: 'Mer croisée préoccupante' },
    ],
  },
  vivante: {
    kind: 'delicat', pill: 'DÉLICAT', score: '58',
    title: 'Sortie possible — à surveiller',
    window: '10:30 — 13:00', ret: '13:30',
    reasons: [
      { state: 'warn', icon: 'wind',  text: 'Rafales 15 nd — proche limite 16 nd' },
      { state: 'good', icon: 'wave',  text: 'Vagues 0.9 m — dans le profil' },
      { state: 'warn', icon: 'clock', text: 'Renforcement attendu après 13h' },
    ],
  },
  engagee: {
    kind: 'bon', pill: 'BON', score: '84',
    title: 'Conditions idéales pour vous',
    window: '09:00 — 15:00', ret: '16:00',
    reasons: [
      { state: 'good', icon: 'wind',    text: 'Rafales 14 nd — terrain de jeu confortable' },
      { state: 'good', icon: 'wave',    text: 'Mer formée — 1.0 m, période 8s' },
      { state: 'good', icon: 'compass', text: 'Vent stable orienté ESE' },
    ],
  },
}

export const NAV_TYPES    = ['Voile', 'Moteur', 'Semi-rigide', 'Kayak / paddle', 'Pêche', 'Autre'] as const
export const FREQUENCIES  = ['≤ 1× / mois', '2–4× / mois', '1× / sem.', 'Plusieurs / sem.'] as const
export const PLATFORMS    = ['iPhone', 'Android'] as const
export const PRACTICES    = ['Balade côtière', 'Sortie familiale', 'Session courte', 'Pêche côtière', 'Navigation sportive'] as const
export const FEEDBACK_TYPES = ['Bug', 'Recommandation incorrecte', 'Donnée manquante', 'Interface confuse', 'Autre'] as const
```

- [ ] **Step 2.3: Create `hooks/useInView.ts`**

```ts
'use client'
import { useEffect, useRef, useState } from 'react'

export function useInView<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView] as const
}
```

- [ ] **Step 2.4: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background-color: #061425;
    scroll-behavior: smooth;
  }

  body {
    background-image:
      radial-gradient(ellipse 1200px 700px at 80% -10%, rgba(94,234,212,0.06), transparent 60%),
      radial-gradient(ellipse 900px 600px at 10% 5%,   rgba(59,130,246,0.05), transparent 60%);
    background-attachment: fixed;
    background-repeat: no-repeat;
  }

  ::selection {
    background-color: #5EEAD4;
    color: #061425;
  }
}
```

- [ ] **Step 2.5: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeaScope — Décidez quand sortir en mer en toute confiance.',
  description:
    'SeaScope est un copilote décisionnel pour navigation côtière. Fenêtres météo, heure de retour, recommandations adaptées à votre façon de naviguer. Beta fermée — Été 2026.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ss-bg text-ss-fg antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2.6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2.7: Commit**

```bash
git add types/ lib/ hooks/ app/globals.css app/layout.tsx
git commit -m "feat: add foundation types, data, hooks, app layout"
```

---

## Task 3: UI Primitive Components

**Files:**
- Create: `components/ui/icons.tsx`
- Create: `components/ui/Reveal.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Pill.tsx`
- Create: `components/ui/Chip.tsx`
- Create: `components/ui/Kicker.tsx`
- Create: `components/ui/DeviceFrame.tsx`
- Create: `components/ui/Callout.tsx`
- Create: `components/ui/SectionHeader.tsx`

- [ ] **Step 3.1: Create `components/ui/icons.tsx`**

All icons are inline SVGs: 24×24 viewBox, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.5}`, round linecap/linejoin.

```tsx
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number) {
  return {
    viewBox: '0 0 24 24' as const,
    width: size,
    height: size,
    fill: 'none' as const,
    stroke: 'currentColor' as const,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

export const Wind = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 8h10a3 3 0 1 0-3-3" />
    <path d="M3 12h15a3 3 0 1 1-3 3" />
    <path d="M3 16h8" />
  </svg>
)

export const Waves = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2 9c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
    <path d="M2 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
  </svg>
)

export const Bolt = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
  </svg>
)

export const Anchor = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v14" />
    <path d="M5 13a7 7 0 0 0 14 0" />
    <path d="M8 11H5M16 11h3" />
  </svg>
)

export const Users = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="16" cy="9" r="2" />
    <path d="M3 19c0-3 2.5-5 5-5s5 2 5 5" />
    <path d="M13 18c.5-2 2-3.5 3-3.5s2.5 1 3 3" />
  </svg>
)

export const Clock = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const Fish = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 12c3-5 8-6 12-6 3 0 6 2 6 6s-3 6-6 6c-4 0-9-1-12-6Z" />
    <path d="m3 12 4-3v6z" />
    <circle cx="16" cy="11" r=".6" fill="currentColor" />
  </svg>
)

export const Sail = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v15" />
    <path d="M12 5c4 2 7 7 7 12H5c0-5 3-10 7-12Z" />
    <path d="M3 21h18" />
  </svg>
)

export const MapPin = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

export const Layers = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3 2 8l10 5 10-5z" />
    <path d="M2 13l10 5 10-5" />
    <path d="M2 18l10 5 10-5" />
  </svg>
)

export const Lock = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export const Eye = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Cpu = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
)

export const Compass = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-2 5-5 2 2-5z" />
  </svg>
)

export const Check = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

export const ArrowRight = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const Bell = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
)

export const Image = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)
```

- [ ] **Step 3.2: Create `components/ui/Reveal.tsx`**

```tsx
'use client'
import clsx from 'clsx'
import { useInView } from '@/hooks/useInView'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={clsx(
        'transition-[opacity,transform] duration-700 ease-out',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3.3: Create `components/ui/Button.tsx`**

```tsx
import Link from 'next/link'
import clsx from 'clsx'

type Variant = 'default' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  default: 'bg-ss-teal border-transparent text-[#052a26] hover:bg-[#79f0db] hover:-translate-y-px active:translate-y-0',
  ghost:   'bg-transparent border-white/14 text-ss-fg hover:bg-white/4 hover:border-white/25',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-12 px-[22px] text-[15px] tracking-[-0.005em]',
  lg: 'h-14 px-7 text-base tracking-[-0.005em]',
}

const baseClasses =
  'group inline-flex items-center justify-center gap-2.5 rounded-full border font-medium cursor-pointer whitespace-nowrap transition-[transform,background-color,border-color,color] duration-150 select-none'

type BaseProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type AsButton = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink   = BaseProps & { href: string; onClick?: undefined; type?: undefined; disabled?: undefined }

export type ButtonProps = AsButton | AsLink

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)

  if (href !== undefined) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3.4: Create `components/ui/Pill.tsx`**

```tsx
import clsx from 'clsx'
import type { DecisionLevel } from '@/types'

const pillClasses: Record<DecisionLevel, string> = {
  bon:         'text-ss-bon bg-ss-bon/10',
  variable:    'text-ss-variable bg-ss-variable/10',
  delicat:     'text-ss-delicat bg-ss-delicat/10',
  deconseille: 'text-ss-deconseille bg-ss-deconseille/10',
}

interface PillProps {
  kind: DecisionLevel
  children: React.ReactNode
  className?: string
}

export function Pill({ kind, children, className }: PillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 h-6 px-2.5 rounded-full font-mono text-[11px] font-semibold tracking-[0.08em] uppercase',
        pillClasses[kind],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
```

- [ ] **Step 3.5: Create `components/ui/Chip.tsx`**

```tsx
import clsx from 'clsx'

interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3.5 py-2 rounded-full border text-[13px] cursor-pointer transition-[border-color,background-color,color] duration-150',
        active
          ? 'border-ss-teal bg-ss-teal/10 text-ss-teal'
          : 'border-white/7 bg-white/[0.03] text-ss-fg/72 hover:border-white/14 hover:text-ss-fg',
        className
      )}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3.6: Create `components/ui/Kicker.tsx`**

```tsx
interface KickerProps {
  children: React.ReactNode
  className?: string
}

export function Kicker({ children, className }: KickerProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ss-teal ${className ?? ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-ss-teal shadow-[0_0_0_4px_rgba(94,234,212,0.15)]" />
      {children}
    </span>
  )
}
```

- [ ] **Step 3.7: Create `components/ui/DeviceFrame.tsx`**

```tsx
import clsx from 'clsx'

interface DeviceFrameProps {
  children: React.ReactNode
  large?: boolean
  rotate?: number
  className?: string
}

export function DeviceFrame({ children, large, rotate, className }: DeviceFrameProps) {
  return (
    <div
      className={clsx('rounded-ss-2xl p-[10px] relative flex-none', large ? 'w-[380px]' : 'w-[340px]', className)}
      style={{
        background: 'linear-gradient(180deg, #1a2c44 0%, #0a1726 100%)',
        boxShadow:
          '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <div
        className="rounded-[36px] overflow-hidden bg-[#050E1A] relative"
        style={{ aspectRatio: '388 / 862' }}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.8: Create `components/ui/Callout.tsx`**

```tsx
interface CalloutProps {
  num: string
  label: string
  text: string
  style?: React.CSSProperties
}

export function Callout({ num, label, text, style }: CalloutProps) {
  return (
    <div
      className="absolute z-10 hidden lg:flex gap-3 items-start max-w-[240px] rounded-[14px] border border-white/14 px-3.5 py-3 backdrop-blur-sm"
      style={{
        background: 'rgba(14,34,54,0.92)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      <div className="w-[22px] h-[22px] rounded-full bg-ss-teal text-[#052a26] flex-none inline-flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">
        {num}
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ss-fg/50 mb-0.5">
          {label}
        </div>
        <div className="text-[13px] text-ss-fg leading-[1.35]">{text}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3.9: Create `components/ui/SectionHeader.tsx`**

```tsx
import { Kicker } from '@/components/ui/Kicker'

interface SectionHeaderProps {
  kicker: string
  heading: React.ReactNode
  lead?: React.ReactNode
  className?: string
}

export function SectionHeader({ kicker, heading, lead, className }: SectionHeaderProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end mb-[60px] ${className ?? ''}`}
    >
      <div>
        <div className="flex items-center gap-3 mb-[22px]">
          <Kicker>{kicker}</Kicker>
        </div>
        <h2 className="text-[clamp(30px,3.4vw,50px)] leading-[1.08] tracking-[-0.02em] font-medium m-0 text-balance">
          {heading}
        </h2>
      </div>
      {lead && (
        <p className="text-[clamp(16px,1.25vw,19px)] leading-relaxed text-ss-fg/72 max-w-[60ch] m-0 text-pretty">
          {lead}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3.10: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3.11: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI primitive components (icons, Reveal, Button, Pill, Chip, Kicker, DeviceFrame, Callout, SectionHeader)"
```

---

## Task 4: Layout Components + Page Shell

**Files:**
- Create: `components/layout/Nav.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `app/page.tsx` (shell only — imports Nav, Footer, placeholder `<main>`)

- [ ] **Step 4.1: Create `components/layout/Nav.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/7 bg-ss-bg/72">
      <div className="max-w-landing mx-auto px-8 sm:px-5 flex items-center justify-between h-16">
        <Link href="/" className="font-sans font-semibold text-[20px] tracking-[-0.02em] inline-flex items-baseline gap-0">
          <span className="text-ss-teal">Sea</span>
          <span className="text-ss-fg/90">Scope</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {[
            { href: '#problem',  label: 'Problème' },
            { href: '#how',      label: 'Fonctionnement' },
            { href: '#perso',    label: 'Personnalisation' },
            { href: '#trust',    label: 'Confiance' },
            { href: '#beta',     label: 'Beta' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.16em] uppercase text-ss-fg/50 border border-white/7 rounded-full px-2.5 py-[5px]">
            Beta · 2026
          </span>
          <Button href="#beta" size="sm">Rejoindre</Button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4.2: Create `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/7 pt-14 pb-10">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 items-start">
          <div>
            <span className="font-sans font-semibold text-[22px] tracking-[-0.02em] inline-flex items-baseline">
              <span className="text-ss-teal">Sea</span>
              <span className="text-ss-fg/90">Scope</span>
            </span>
            <p className="mt-3 text-[13px] text-ss-fg/50 max-w-[36ch] leading-relaxed">
              Copilote météo décisionnel pour navigation côtière.
              <br />Conçu pour la décision, pas pour la décoration.
            </p>
            <p className="mt-4">
              <a
                href="mailto:beta@seascope.app"
                className="font-mono text-[12px] tracking-[0.06em] text-ss-teal"
              >
                beta@seascope.app
              </a>
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50 mb-3.5 font-medium">
              Produit
            </h5>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: '#how',   label: 'Comment ça marche' },
                { href: '#perso', label: 'Personnalisation' },
                { href: '#trust', label: 'Confiance' },
                { href: '#beta',  label: 'Beta fermée' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50 mb-3.5 font-medium">
              Programme beta
            </h5>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: '#beta',         label: 'Candidater' },
                { href: '#feedback-form',label: 'Envoyer un retour' },
                { href: 'mailto:beta@seascope.app', label: 'beta@seascope.app' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/7 flex items-center justify-between font-mono text-[11px] tracking-[0.06em] text-ss-fg/50">
          <span>© 2026 SeaScope · Tous droits réservés</span>
          <span>Beta privée · Été 2026</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4.3: Create `app/page.tsx` (shell)**

```tsx
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        {/* Sections added in Tasks 5 and 6 */}
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4.4: Test the dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000`. Nav and Footer render with correct colors and font. No console errors.

- [ ] **Step 4.5: Commit**

```bash
git add components/layout/ app/page.tsx
git commit -m "feat: add Nav, Footer, page shell"
```

---

## Task 5: Static Sections

**Files:**
- Create: `components/sections/Hero.tsx`
- Create: `components/sections/Problem.tsx`
- Create: `components/sections/HowItWorks.tsx`
- Create: `components/sections/Trust.tsx`
- Create: `components/sections/FeedbackLoop.tsx`

All sections in this task are **server components** (no `'use client'`). They use `<Reveal>` (a client component leaf) for scroll animations.

- [ ] **Step 5.1: Create `components/sections/Hero.tsx`**

```tsx
import Image from 'next/image'
import { Kicker } from '@/components/ui/Kicker'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { Callout } from '@/components/ui/Callout'
import { ArrowRight } from '@/components/ui/icons'

export function Hero() {
  return (
    <section className="pt-20 pb-24 relative overflow-hidden">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-20 items-center">

          {/* Copy */}
          <div className="relative z-10">
            <Reveal>
              <div className="flex items-center gap-3 mb-[22px]">
                <Kicker>Beta fermée · Été 2026</Kicker>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[clamp(38px,5.4vw,74px)] leading-[1.03] tracking-[-0.025em] font-medium m-0 text-balance">
                Décidez quand sortir en mer
                <br />
                <span className="text-ss-teal">en toute confiance.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-[22px] text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 max-w-[60ch] text-pretty">
                SeaScope transforme les conditions météo en recommandations
                concrètes, adaptées à votre façon de naviguer. Quand sortir,
                quand rentrer, et avec quel niveau de confiance.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex gap-3.5 mt-9 flex-wrap">
                <Button href="#beta" size="lg">
                  Rejoindre la beta fermée
                  <ArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Button>
                <Button href="#how" variant="ghost" size="lg">
                  Voir comment ça marche
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-9 flex gap-7 items-center flex-wrap text-[13px] text-ss-fg/50">
                {[
                  'Fusion multi-sources météo',
                  'Recommandations explicables',
                  'Stockage local uniquement',
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-ss-teal" />
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Device stage */}
          <div className="relative flex justify-center items-center min-h-[720px] lg:min-h-[720px]">
            {/* Glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-10% -20%',
                background: 'radial-gradient(closest-side, rgba(94,234,212,0.10), transparent 70%)',
              }}
            />
            {/* Separator line */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-[130%]"
              style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)' }}
            />

            <Reveal delay={120}>
              <DeviceFrame large>
                <Image
                  src="/assets/screen-bon.png"
                  alt="Tableau de bord SeaScope — conditions BON"
                  fill
                  className="object-cover"
                  sizes="(max-width: 720px) 280px, 380px"
                  priority
                />
              </DeviceFrame>
            </Reveal>

            <Callout
              num="1"
              label="Statut décisionnel"
              text="BON · conditions idéales pour une sortie familiale"
              style={{ left: -24, top: 60 }}
            />
            <Callout
              num="2"
              label="Fenêtre optimale"
              text="Départ entre 08:00 et 11:00, retour avant 10:15."
              style={{ right: -32, top: '32%' }}
            />
            <Callout
              num="3"
              label="Pourquoi"
              text="Mer croisée préoccupante — vent et vagues favorables."
              style={{ left: -40, bottom: 120 }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.2: Create `components/sections/Problem.tsx`**

The sparklines are inline SVG `<path>` elements. Each problem card has a specific path and stroke color.

```tsx
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'

const problems = [
  {
    idx: '01 — Météo dispersée',
    title: 'Trois applis, trois modèles, trois verdicts différents.',
    desc: 'Vent ici, houle là-bas, rafales nulle part. Les sources se contredisent.',
    path: 'M0 30 C 12 18, 22 38, 34 28 S 56 12, 68 24 S 86 38, 100 22',
    color: '#2DD4BF',
    wide: false,
  },
  {
    idx: '02 — Surcharge cognitive',
    title: 'Lire la météo devient un travail à temps plein.',
    desc: 'Vagues, vent, rafales, coefficient, période… on cumule sans savoir quoi en faire.',
    path: 'M0 18 L10 32 L20 22 L30 40 L40 24 L50 36 L60 20 L70 30 L80 16 L90 38 L100 26',
    color: '#FBBF24',
    wide: false,
  },
  {
    idx: '03 — Décision sous stress',
    title: 'Sortir ou pas ? On tranche dans l'incertitude.',
    desc: 'On choisit par intuition, en croisant les doigts pour que la mer suive.',
    path: 'M0 22 C 18 30, 28 14, 42 26 S 64 38, 78 22 S 92 40, 100 28',
    color: '#FF6B6B',
    wide: false,
  },
  {
    idx: '04 — Peur de rater la fenêtre',
    title: '"Et si j\'avais pu sortir ce matin ?"',
    desc: 'Les meilleures fenêtres sont courtes. Sans signal clair, elles passent à côté.',
    path: 'M0 36 L18 30 L34 14 L48 12 L62 20 L78 34 L100 40',
    color: '#6EE7B7',
    wide: true,
  },
  {
    idx: '05 — Peur de mal sortir',
    title: '"Et si les conditions tournent une fois au large ?"',
    desc: 'La vraie peur, ce n\'est pas la mauvaise météo : c\'est ne pas l\'avoir vue venir.',
    path: 'M0 32 L14 30 L28 26 L42 22 L56 24 L72 18 L86 10 L100 6',
    color: '#EF4444',
    wide: true,
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Le problème"
            heading={<>Trop de données.<br />Pas assez de décision.</>}
            lead="Avant chaque sortie, on jongle entre trois applis météo, des modèles qui ne s'accordent pas, et l'intuition. La décision finale repose sur la fatigue d'un dimanche matin."
          />
        </Reveal>

        <Reveal>
          <div
            className="grid gap-px rounded-ss-lg overflow-hidden border border-white/7"
            style={{ background: 'rgba(255,255,255,0.07)', gridTemplateColumns: 'repeat(12, 1fr)' }}
          >
            {problems.map((p) => (
              <div
                key={p.idx}
                className="bg-ss-bg flex flex-col gap-3.5 p-7 min-h-[220px]"
                style={{ gridColumn: `span ${p.wide ? 6 : 4}` }}
              >
                <div className="font-mono text-[11px] tracking-[0.16em] text-ss-fg/50">{p.idx}</div>
                <div className="text-[20px] leading-[1.25] font-medium tracking-[-0.01em]">{p.title}</div>
                <div
                  className="h-14 rounded-[8px] overflow-hidden"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg, transparent 0, transparent 11px, rgba(255,255,255,0.07) 11px, rgba(255,255,255,0.07) 12px), linear-gradient(180deg, rgba(94,234,212,0.04), transparent)',
                  }}
                >
                  <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="w-full h-full block">
                    <path d={p.path} fill="none" stroke={p.color} strokeWidth="1.2" strokeLinecap="round" />
                    <path d={`${p.path} L 100 56 L 0 56 Z`} fill={p.color} opacity="0.08" />
                  </svg>
                </div>
                <div className="text-[14px] text-ss-fg/50 leading-[1.5] mt-auto">{p.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

> **Note on responsive grid:** On mobile (`< lg`), add `grid-cols-1` override via a wrapper or use the `style` approach above with a `@media` fallback. A simple approach: wrap in a `<div className="overflow-x-auto">` on mobile. Alternatively, apply `md:grid-cols-2` and `lg:[grid-template-columns:repeat(12,1fr)]` — adjust at your discretion.

- [ ] **Step 5.3: Create `components/sections/HowItWorks.tsx`**

```tsx
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pill } from '@/components/ui/Pill'
import { MapPin, Layers, Compass } from '@/components/ui/icons'

export function HowItWorks() {
  return (
    <section id="how" className="py-[120px]">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Comment ça marche"
            heading={<>Trois gestes.<br />Une décision claire.</>}
            lead="SeaScope vous demande l'essentiel — votre spot, votre pratique — puis renvoie un signal décisionnel, pas un dump de données."
          />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <Reveal>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">01</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <MapPin size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">Choisissez votre spot.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Trévignon, Quiberon, Glénan, ou n'importe quel point GPS. Vos spots préférés sont mémorisés.
              </p>
              {/* Spot visualisation */}
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 min-h-[132px] relative overflow-hidden">
                <svg viewBox="0 0 280 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <defs>
                    <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
                      <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="280" height="100" fill="url(#grid)" />
                  <path d="M0 70 C 50 60, 80 78, 130 62 S 220 50, 280 58 L280 100 L0 100 Z" fill="rgba(94,234,212,0.05)" stroke="rgba(94,234,212,0.4)" strokeWidth="1" />
                  <circle cx="140" cy="55" r="5" fill="#5EEAD4" />
                  <circle cx="140" cy="55" r="11" fill="none" stroke="#5EEAD4" strokeWidth="1" opacity="0.4" />
                </svg>
                <span className="absolute font-mono text-[10px] text-ss-teal tracking-[0.1em]" style={{ left: 120, top: 24 }}>TRÉVIGNON</span>
              </div>
            </div>
          </Reveal>

          {/* Step 2 */}
          <Reveal delay={120}>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">02</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Layers size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">SeaScope analyse les conditions.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Fusion de plusieurs modèles météo marins, croisée avec les seuils de votre profil de navigation.
              </p>
              {/* Fusion visualisation */}
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 flex flex-col gap-1.5">
                {[
                  { label: 'ARPEGE',    v: 72, color: '#34D399' },
                  { label: 'ICON-EU',   v: 65, color: '#34D399' },
                  { label: 'GFS',       v: 58, color: '#FBBF24' },
                  { label: 'WAVEWATCH', v: 70, color: '#34D399' },
                  { label: 'SEASCOPE',  v: 88, color: '#5EEAD4' },
                ].map((m) => (
                  <div key={m.label} className="grid items-center gap-2" style={{ gridTemplateColumns: '70px 1fr 30px' }}>
                    <span className="font-mono text-[10px] text-ss-fg/50 tracking-[0.08em]">{m.label}</span>
                    <div className="h-1 bg-white/[0.06] rounded-[2px] overflow-hidden">
                      <div className="h-full rounded-[2px]" style={{ width: `${m.v}%`, background: m.color }} />
                    </div>
                    <span className="font-mono text-[10px] text-right" style={{ color: m.color }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Step 3 */}
          <Reveal delay={240}>
            <div className="bg-ss-surface border border-white/7 rounded-ss-lg p-7 flex flex-col gap-[18px] min-h-[360px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em] text-ss-teal">03</span>
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Compass size={18} />
                </span>
              </div>
              <h3 className="text-[20px] leading-[1.25] font-medium m-0">Obtenez votre signal.</h3>
              <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">
                Une recommandation tranchée — meilleure fenêtre, heure de retour, niveau adapté à votre pratique.
              </p>
              {/* Signal visualisation */}
              <div className="mt-auto bg-ss-bg-2 border border-white/7 rounded-[12px] p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <Pill kind="bon">BON</Pill>
                  <span className="font-mono text-[11px] text-ss-fg/50 tracking-[0.1em]">88 / 100</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-mono text-[9px] text-ss-fg/50 tracking-[0.14em] uppercase">Départ optimal</div>
                    <div className="font-mono text-[18px] font-medium mt-1">08:00 — 11:00</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] text-ss-rentrer tracking-[0.14em] uppercase">Rentrer avant</div>
                    <div className="font-mono text-[18px] font-medium text-ss-rentrer mt-1">10:15</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.4: Create `components/sections/Trust.tsx`**

```tsx
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Layers, Eye, Compass, Cpu, Lock, Bell } from '@/components/ui/icons'

const items = [
  {
    Icon: Layers,
    title: 'Fusion multi-sources',
    body: 'Plusieurs modèles météo marins — ARPEGE, ICON-EU, GFS, WaveWatch — agrégés et pondérés selon leur fiabilité locale.',
  },
  {
    Icon: Eye,
    title: 'Recommandations explicables',
    body: 'Chaque score affiche les seuils dépassés, les modèles utilisés et le niveau d\'incertitude. Vous voyez ce qu\'on vous dit.',
  },
  {
    Icon: Compass,
    title: 'Personnalisation réelle',
    body: 'Vos limites de vent, vagues et rafales définissent le BON. Pas un seuil moyen pour navigateur moyen.',
  },
  {
    Icon: Cpu,
    title: 'Logique transparente',
    body: 'Un score, trois moments (départ, pire, retour), des raisons nommées. Aucune magie, aucun algorithme secret.',
  },
  {
    Icon: Lock,
    title: 'Stockage local',
    body: 'Vos préférences, vos spots, vos sorties — sur votre appareil. Pas de profil cloud, pas de revente.',
  },
  {
    Icon: Bell,
    title: 'Alertes utiles',
    body: 'Un signal seulement quand la fenêtre s\'ouvre — ou quand la mer se referme. Pas de notification pour le bruit.',
  },
]

export function Trust() {
  return (
    <section id="trust" className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Confiance"
            heading={<>Une décision n'a de valeur<br />que si on peut la défendre.</>}
            lead="Pas de boîte noire, pas de cloud personnel, pas de score marketing. Chaque recommandation est traçable jusqu'aux chiffres qui l'ont produite."
          />
        </Reveal>

        <Reveal>
          <div
            className="grid gap-px rounded-ss-lg overflow-hidden border border-white/7 grid-cols-1 md:grid-cols-3"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            {items.map(({ Icon, title, body }) => (
              <div key={title} className="bg-ss-bg flex flex-col gap-3.5 p-7 min-h-[220px]">
                <span className="w-9 h-9 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal">
                  <Icon size={18} />
                </span>
                <h3 className="text-[18px] font-medium m-0 tracking-[-0.005em]">{title}</h3>
                <p className="text-[14px] text-ss-fg/50 leading-[1.5] m-0">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.5: Create `components/sections/FeedbackLoop.tsx`**

```tsx
import { Reveal } from '@/components/ui/Reveal'

export function FeedbackLoop() {
  return (
    <section className="py-[120px] bg-ss-bg-2 border-y border-white/7">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          <Reveal>
            <div className="flex items-center gap-3 mb-[22px]">
              <span className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ss-teal">
                <span className="w-1.5 h-1.5 rounded-full bg-ss-teal shadow-[0_0_0_4px_rgba(94,234,212,0.15)]" />
                Boucle terrain
              </span>
            </div>
            <h2 className="text-[clamp(30px,3.4vw,50px)] leading-[1.08] tracking-[-0.02em] font-medium mb-4 text-balance">
              La beta sert à affûter<br />les recommandations réelles.
            </h2>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 mt-4 text-pretty">
              On ne cherche pas à valider une démo. On cherche à valider une
              décision : est-ce que SeaScope a vu juste cette fois ?
              Vos retours terrain font évoluer la pondération des modèles,
              les seuils par profil, et la façon dont on formule un signal.
            </p>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 mt-3 text-pretty">
              L'objectif n'est pas une appli météo de plus. C'est un vrai
              copilote de décision — entraîné avec vous.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-white/7 rounded-ss-xl p-8 bg-ss-surface grid grid-cols-3 gap-3.5">
              {[
                { n: '01 · AVANT',  t: 'SeaScope recommande.',  d: 'Score, fenêtre, heure de retour adaptés à votre profil.' },
                { n: '02 · APRÈS',  t: 'Vous notez la réalité.', d: 'Mer vue, vent ressenti, écart à la prévision, décision prise.' },
                { n: '03 · ENTRE',  t: 'Le modèle s\'ajuste.',   d: 'Pondération locale, calibrage par zone, par profil, par saison.' },
              ].map((s) => (
                <div key={s.n} className="border border-white/7 rounded-ss p-[18px] bg-black/[0.15] flex flex-col gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-ss-teal">{s.n}</span>
                  <span className="text-[14px] font-medium">{s.t}</span>
                  <span className="text-[12px] text-ss-fg/50 leading-[1.5]">{s.d}</span>
                </div>
              ))}
              <div className="col-span-3 mt-3 pt-4 border-t border-white/7 flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.14em] text-ss-fg/50 uppercase">Boucle fermée · Métrique principale</span>
                <span className="font-mono text-[14px] text-ss-teal">"SeaScope a-t-il vu juste ?"</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.6: Add sections to `app/page.tsx` and verify dev server**

Update `app/page.tsx`:

```tsx
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Trust } from '@/components/sections/Trust'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        {/* Personalization, BetaForm, FeedbackForm added in Task 6 */}
        <Trust />
        <FeedbackLoop />
      </main>
      <Footer />
    </>
  )
}
```

Then run:

```bash
npm run dev
```

Expected: All 5 sections render with correct layout and colors. Scroll animations fade in. Device frame shows `screen-bon.png`.

- [ ] **Step 5.7: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5.8: Commit**

```bash
git add components/sections/Hero.tsx components/sections/Problem.tsx components/sections/HowItWorks.tsx components/sections/Trust.tsx components/sections/FeedbackLoop.tsx app/page.tsx
git commit -m "feat: add Hero, Problem, HowItWorks, Trust, FeedbackLoop sections"
```

---

## Task 6: Interactive Client Sections

**Files:**
- Create: `components/sections/Personalization.tsx`
- Create: `components/sections/BetaForm.tsx`
- Create: `components/sections/FeedbackForm.tsx`

All three are `'use client'` components with `useState`.

- [ ] **Step 6.1: Create `components/sections/Personalization.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { PERSONAS, TOLERANCES, REC_CARDS } from '@/lib/data'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pill } from '@/components/ui/Pill'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { Callout } from '@/components/ui/Callout'
import { Reveal } from '@/components/ui/Reveal'
import { Kicker } from '@/components/ui/Kicker'
import { Check, Wind, Waves, Bolt, Clock, Compass, Anchor, Users, Fish, Sail } from '@/components/ui/icons'
import type { PersonaId, ToleranceId, Reason } from '@/types'

const personaIcons: Record<PersonaId, React.ReactNode> = {
  balade:  <Anchor size={16} />,
  famille: <Users size={16} />,
  courte:  <Clock size={16} />,
  peche:   <Fish size={16} />,
  sport:   <Sail size={16} />,
}

const reasonIcons: Record<Reason['icon'], React.ReactNode> = {
  wind:    <Wind size={14} />,
  wave:    <Waves size={14} />,
  bolt:    <Bolt size={14} />,
  clock:   <Clock size={14} />,
  compass: <Compass size={14} />,
}

const reasonStateColor: Record<Reason['state'], string> = {
  good: 'text-ss-bon',
  warn: 'text-ss-delicat',
  bad:  'text-ss-deconseille',
}

const cardBorder: Record<string, string> = {
  bon:         'border-ss-bon/30',
  delicat:     'border-ss-delicat/30',
  deconseille: 'border-ss-deconseille/30',
}

export function Personalization() {
  const [activePersona, setActivePersona] = useState<PersonaId>('famille')
  const [activeTol, setActiveTol] = useState<ToleranceId>('vivante')

  const personaName = PERSONAS.find((p) => p.id === activePersona)?.name ?? ''

  return (
    <section id="perso" className="py-[120px]">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <Reveal>
          <SectionHeader
            kicker="Personnalisation"
            heading={<>SeaScope s'adapte à votre<br />façon de naviguer.</>}
            lead="Mêmes conditions, recommandations différentes. Vos seuils, votre pratique et votre tolérance définissent ce qui vous est confortable — et ce qui ne l'est pas."
          />
        </Reveal>

        {/* Persona picker */}
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.16em] text-ss-fg/50 uppercase mb-3">
            01 — Vous naviguez plutôt comment ?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-3.5">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePersona(p.id)}
                className={clsx(
                  'text-left rounded-ss bg-ss-surface border p-[18px] flex flex-col gap-3 min-h-[140px] cursor-pointer transition-[border-color,background,transform,box-shadow] duration-150',
                  activePersona === p.id
                    ? 'border-ss-teal bg-gradient-to-b from-ss-teal/[0.06] to-transparent shadow-[0_0_0_4px_rgba(94,234,212,0.06)]'
                    : 'border-white/7 hover:border-white/14 hover:-translate-y-0.5'
                )}
              >
                <span
                  className={clsx(
                    'w-8 h-8 rounded-[8px] inline-flex items-center justify-center border flex-none',
                    activePersona === p.id
                      ? 'bg-ss-teal text-[#052a26] border-transparent'
                      : 'bg-white/4 border-white/7 text-ss-fg/72'
                  )}
                >
                  {personaIcons[p.id]}
                </span>
                <span className="text-[14px] font-medium text-ss-fg">{p.name}</span>
                <span className="text-[12px] text-ss-fg/50 leading-[1.45]">{p.desc}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Tolerance picker */}
        <Reveal delay={80} className="mt-8">
          <p className="font-mono text-[11px] tracking-[0.16em] text-ss-fg/50 uppercase mb-3">
            02 — Votre sortie idéale, c'est quoi ?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {TOLERANCES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTol(t.id)}
                className={clsx(
                  'text-left rounded-ss bg-ss-surface border px-[18px] py-4 flex items-center gap-3.5 cursor-pointer transition-[border-color,background] duration-150',
                  activeTol === t.id
                    ? 'border-ss-teal bg-gradient-to-b from-ss-teal/[0.06] to-transparent'
                    : 'border-white/7 hover:border-white/14'
                )}
              >
                <span className="w-9 h-[18px] flex items-center gap-[3px] flex-none">
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={clsx('flex-1 h-full rounded-[2px]', n <= t.bars ? 'bg-ss-teal' : 'bg-white/18')}
                    />
                  ))}
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-medium">{t.name}</span>
                  <span className="block text-[12px] text-ss-fg/50">{t.sub}</span>
                </span>
                <span
                  className={clsx(
                    'transition-opacity duration-150 text-ss-teal flex-none',
                    activeTol === t.id ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <Check size={16} />
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Compose block */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[60px] items-center">
          <div className="relative min-h-[720px] flex justify-center items-center">
            <div
              className="absolute pointer-events-none"
              style={{ inset: '-10% -20%', background: 'radial-gradient(closest-side, rgba(94,234,212,0.10), transparent 70%)' }}
            />
            <Reveal>
              <DeviceFrame rotate={-2}>
                <Image
                  src="/assets/screen-delicat.png"
                  alt="SeaScope — simulation sortie délicate"
                  fill
                  className="object-cover"
                  sizes="(max-width: 720px) 280px, 340px"
                />
              </DeviceFrame>
            </Reveal>
            <Callout num="A" label="Score personnalisé" text="38 / 100 — recalculé pour votre profil et vos seuils." style={{ left: -40, top: 44 }} />
            <Callout num="B" label="Dépassements" text="Rafales 13 nd, soit 11 nd au-dessus de votre confort." style={{ right: -40, top: '44%' }} />
            <Callout num="C" label="Trois moments" text="Départ, pire moment, retour — chaque étape évaluée." style={{ left: -32, bottom: 120 }} />
          </div>

          <Reveal>
            <div className="flex items-center gap-3 mb-[22px]">
              <Kicker>Cas réel · simulation</Kicker>
            </div>
            <h3 className="text-[clamp(28px,2.4vw,40px)] leading-[1.08] tracking-[-0.02em] font-medium mb-4 text-balance">
              Sur cette sortie, vos seuils disent{' '}
              <span className="text-ss-delicat">DÉLICAT</span>.
            </h3>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 mt-4 text-pretty">
              SeaScope a comparé le départ, le pire moment et le retour à vos
              limites personnelles. Vent trop fort par rafales, mer dans le profil
              mais à la limite. Le score traduit ce que vous savez déjà — sans
              avoir à le calculer.
            </p>
            <ul className="list-none m-0 p-0 mt-6 flex flex-col gap-3">
              {[
                'Vos limites personnelles, pas des moyennes anonymes.',
                'Chaque dépassement nommé, chiffré, expliqué.',
                'Un score qui change avec votre profil — pas avec le marketing.',
              ].map((line) => (
                <li key={line} className="flex gap-3 items-start text-[14px] text-ss-fg/72">
                  <span className="text-ss-teal mt-0.5 flex-none"><Check size={16} /></span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Scenario cards */}
        <div className="mt-20 border-t border-white/7 pt-16">
          <div className="flex items-end justify-between gap-10 mb-9 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-[22px]">
                <Kicker>Comparaison live</Kicker>
              </div>
              <h3 className="text-[clamp(24px,2.2vw,34px)] leading-[1.08] tracking-[-0.02em] font-medium m-0">
                Mêmes conditions. Trois verdicts.
              </h3>
            </div>
            <p className="text-[14px] text-ss-fg/50 max-w-[360px] m-0">
              Trévignon · 14 août · 09h — Vent 14 nd ESE, vagues 1.0 m, rafales 15 nd.
              Vos réglages ci-dessus changent la recommandation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TOLERANCES.map((t) => {
              const card = REC_CARDS[t.id]
              const isActive = activeTol === t.id
              return (
                <div
                  key={t.id}
                  className={clsx(
                    'border rounded-ss-lg bg-ss-surface p-[22px] flex flex-col gap-3.5 relative overflow-hidden transition-opacity duration-200',
                    cardBorder[card.kind],
                    isActive ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  <div className="font-mono text-[11px] tracking-[0.16em] text-ss-fg/50 uppercase">
                    {t.name} · {personaName}
                  </div>
                  <div className="flex items-center justify-between">
                    <Pill kind={card.kind}>{card.pill}</Pill>
                    <span className="font-mono text-[11px] text-ss-fg/50 tracking-[0.1em]">
                      {card.score} / 100
                    </span>
                  </div>
                  <div className="text-[18px] font-medium leading-[1.3] tracking-[-0.01em]">{card.title}</div>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.14em] text-ss-fg/50 uppercase">Fenêtre</div>
                      <div className="font-mono text-[22px] font-medium tracking-[-0.01em]">{card.window}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] tracking-[0.14em] text-ss-fg/50 uppercase">Rentrer avant</div>
                      <div className="font-mono text-[22px] font-medium text-ss-rentrer tracking-[-0.01em]">{card.ret}</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/7 -mx-1 my-2" />
                  <div className="flex flex-col gap-2 text-[13px]">
                    {card.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-ss-fg/72">
                        <span className={clsx('w-3.5 flex-none', reasonStateColor[r.state])}>
                          {reasonIcons[r.icon]}
                        </span>
                        <span>{r.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-2 font-mono text-[11px] text-ss-fg/50 tracking-[0.06em]">
                    <span
                      className="w-2 h-2 rounded-[2px]"
                      style={{ background: `var(--tw-color-ss-${card.kind === 'deconseille' ? 'deconseille' : card.kind})` }}
                    />
                    Profil {t.name.toLowerCase()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
```

> **Note:** The swatch `style` uses a CSS variable. Alternatively, define a `swatchColor` map: `{ bon: '#34D399', delicat: '#F59E0B', deconseille: '#EF4444', variable: '#FBBF24' }` and use `style={{ background: swatchColor[card.kind] }}`.

- [ ] **Step 6.2: Create `components/sections/BetaForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  NAV_TYPES, FREQUENCIES, PLATFORMS, PRACTICES,
} from '@/lib/data'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Check, ArrowRight } from '@/components/ui/icons'
import type { BetaFormValues } from '@/types'

const EMPTY: BetaFormValues = {
  firstname: '', email: '', region: '', navType: '', freq: '',
  boat: '', platform: '', practice: '', blocker: '', consent: false,
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validate(d: BetaFormValues) {
  return (
    d.firstname.trim().length >= 2 &&
    isValidEmail(d.email) &&
    d.region.trim().length >= 2 &&
    !!d.navType && !!d.freq && !!d.platform && !!d.practice &&
    d.consent
  )
}

const inputClass =
  'bg-black/[0.18] border border-white/7 rounded-[10px] px-3.5 py-3.5 text-[15px] text-ss-fg outline-none w-full placeholder:text-ss-fg/32 transition-[border-color,background] duration-150 hover:border-white/14 focus:border-ss-teal focus:bg-ss-teal/4'
const labelClass = 'font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50'
const errorClass = 'border-ss-deconseille'

export function BetaForm() {
  const [data, setData]           = useState<BetaFormValues>(EMPTY)
  const [touched, setTouched]     = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const upd = (key: keyof BetaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }))

  const set = (key: keyof BetaFormValues, val: string | boolean) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validate(data)) setSubmitted(true)
  }

  if (submitted) {
    return (
      <section id="beta" className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-8 sm:px-5">
          <div className="bg-ss-surface border border-white/7 rounded-ss-xl flex flex-col items-center text-center gap-4 py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-ss-bon/10 border border-ss-bon/30 text-ss-bon grid place-items-center">
              <Check size={28} />
            </div>
            <h2 className="text-[clamp(24px,2.4vw,32px)] tracking-[-0.02em] font-medium m-0">
              Bienvenue à bord, {data.firstname}.
            </h2>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 max-w-[50ch] text-pretty m-0">
              On a bien reçu votre candidature. Vous recevrez un lien d'accès
              à la beta et l'invitation au Discord testeurs dans les prochains jours.
            </p>
            <div className="flex gap-3 flex-wrap justify-center mt-4">
              <Button href="#feedback-form" variant="ghost">Vous êtes déjà en beta ?</Button>
              <Button onClick={() => { setData(EMPTY); setTouched(false); setSubmitted(false) }}>
                Inscrire quelqu'un d'autre
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const t = touched
  return (
    <section id="beta" className="py-[120px]">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <SectionHeader
          kicker="Rejoindre la beta"
          heading="Candidatez à la beta fermée."
          lead="La beta est limitée. On sélectionne sur la diversité des pratiques et des zones de navigation, pas sur l'ancienneté."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[60px] items-start">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-ss-surface border border-white/7 rounded-ss-xl p-10 sm:p-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3.5 mb-[22px]">
              <div className="flex flex-col gap-2">
                <label htmlFor="b-firstname" className={labelClass}>Prénom</label>
                <input
                  id="b-firstname"
                  className={clsx(inputClass, t && data.firstname.trim().length < 2 && errorClass)}
                  value={data.firstname}
                  onChange={upd('firstname')}
                  placeholder="Camille"
                  autoComplete="given-name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="b-email" className={labelClass}>Email</label>
                <input
                  id="b-email"
                  type="email"
                  className={clsx(inputClass, t && !isValidEmail(data.email) && errorClass)}
                  value={data.email}
                  onChange={upd('email')}
                  placeholder="camille@exemple.fr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="b-region" className={labelClass}>Région de navigation</label>
              <input
                id="b-region"
                className={clsx(inputClass, t && data.region.trim().length < 2 && errorClass)}
                value={data.region}
                onChange={upd('region')}
                placeholder="Sud Finistère, Quiberon, Côte d'Azur…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelClass}>Type de navigation</span>
              <div className="flex flex-wrap gap-2">
                {NAV_TYPES.map((v) => (
                  <Chip key={v} active={data.navType === v} onClick={() => set('navType', v)}>{v}</Chip>
                ))}
              </div>
              {t && !data.navType && <span className="text-[12px] text-ss-deconseille font-mono">Sélectionnez un type</span>}
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelClass}>Fréquence de sortie</span>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map((v) => (
                  <Chip key={v} active={data.freq === v} onClick={() => set('freq', v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3.5 mb-[22px]">
              <div className="flex flex-col gap-2">
                <label htmlFor="b-boat" className={labelClass}>Bateau / engin</label>
                <input
                  id="b-boat"
                  className={inputClass}
                  value={data.boat}
                  onChange={upd('boat')}
                  placeholder="Modèle, longueur, propulsion (optionnel)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Plateforme</span>
                <div className="flex gap-2">
                  {PLATFORMS.map((v) => (
                    <Chip key={v} active={data.platform === v} onClick={() => set('platform', v)}>{v}</Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelClass}>Pratique principale</span>
              <div className="flex flex-wrap gap-2">
                {PRACTICES.map((v) => (
                  <Chip key={v} active={data.practice === v} onClick={() => set('practice', v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="b-blocker" className={labelClass}>
                Qu'est-ce qui vous fait généralement renoncer à une sortie ?
              </label>
              <textarea
                id="b-blocker"
                className={clsx(inputClass, 'resize-y min-h-[96px] leading-[1.45]')}
                value={data.blocker}
                onChange={upd('blocker')}
                rows={3}
                placeholder="Vent qui tourne, météo incertaine, équipage hésitant…"
              />
            </div>

            <label
              className="flex items-start gap-3 p-3.5 rounded-[10px] bg-black/[0.18] border border-white/7 text-[13px] text-ss-fg/72 leading-relaxed cursor-pointer mb-[22px]"
            >
              <input
                type="checkbox"
                className="mt-0.5 flex-none w-[18px] h-[18px] rounded-[5px] border border-white/14 appearance-none cursor-pointer bg-transparent checked:bg-ss-teal checked:border-ss-teal"
                checked={data.consent}
                onChange={(e) => set('consent', e.target.checked)}
              />
              <span>
                J'accepte de participer à la beta fermée de SeaScope et de partager mes
                retours d'usage. Mes données ne sont utilisées que pour le programme beta,
                sans cession à un tiers.
              </span>
            </label>

            {t && !validate(data) && (
              <p className="font-mono text-[12px] text-ss-deconseille tracking-[0.06em] mb-4">
                Veuillez remplir tous les champs obligatoires (prénom, email, région, type, fréquence, plateforme, pratique) et accepter les conditions.
              </p>
            )}

            <div className="flex items-center gap-3.5">
              <Button type="submit" size="lg">
                Demander un accès beta
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>
              <span className="font-mono text-[11px] text-ss-fg/50 tracking-[0.08em]">
                Réponse sous 5 jours ouvrés
              </span>
            </div>
          </form>

          <aside className="sticky top-24 flex flex-col gap-5">
            {[
              {
                title: "Ce qu'on attend de vous",
                content: (
                  <ul className="list-none m-0 p-0 mt-3.5 flex flex-col gap-3">
                    {[
                      { n: '01', t: 'Tester en conditions réelles, avant chaque sortie.' },
                      { n: '02', t: 'Comparer la recommandation à la réalité observée.' },
                      { n: '03', t: "Signaler quand SeaScope se trompe — et pourquoi." },
                    ].map(({ n, t }) => (
                      <li key={n} className="flex gap-3 items-start text-[13px] text-ss-fg/72">
                        <span className="font-mono text-[11px] text-ss-teal tracking-[0.14em] mt-0.5">{n}</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                title: 'Canaux beta',
                content: (
                  <>
                    <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0 mt-2">
                      Un Discord privé pour les testeurs. Un fil Telegram pour les alertes critiques.
                    </p>
                    <div className="flex gap-2 mt-3.5">
                      {['Discord', 'Telegram'].map((c) => (
                        <span key={c} className="inline-flex items-center gap-2 h-6 px-2.5 rounded-full font-mono text-[11px] font-semibold tracking-[0.08em] text-ss-bon bg-ss-bon/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{c}
                        </span>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                title: 'Critères de sélection',
                content: (
                  <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0 mt-2">
                    Diversité de la zone, du bateau, de la pratique. Une session régulière
                    sur l'été 2026, et l'envie d'aider à construire un outil que vous utiliserez.
                  </p>
                ),
              },
            ].map(({ title, content }) => (
              <div key={title} className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
                <h4 className="text-[14px] font-medium m-0 mb-2">{title}</h4>
                {content}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6.3: Create `components/sections/FeedbackForm.tsx`**

```tsx
'use client'

import { useState, useRef } from 'react'
import clsx from 'clsx'
import { FEEDBACK_TYPES } from '@/lib/data'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Check, ArrowRight, Image as ImageIcon } from '@/components/ui/icons'
import type { FeedbackFormValues } from '@/types'

const EMPTY: FeedbackFormValues = {
  email: '', fbtype: '', spot: '', what: '', expected: '',
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validate(d: FeedbackFormValues) {
  return isValidEmail(d.email) && !!d.fbtype && d.what.trim().length >= 10
}

const inputClass =
  'bg-black/[0.18] border border-white/7 rounded-[10px] px-3.5 py-3.5 text-[15px] text-ss-fg outline-none w-full placeholder:text-ss-fg/32 transition-[border-color,background] duration-150 hover:border-white/14 focus:border-ss-teal focus:bg-ss-teal/4'
const labelClass = 'font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50'
const errorClass = 'border-ss-deconseille'

export function FeedbackForm() {
  const [data, setData]       = useState<FeedbackFormValues>(EMPTY)
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upd = (key: keyof FeedbackFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }))

  const set = (key: keyof FeedbackFormValues, val: string) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validate(data)) setSubmitted(true)
  }

  const reset = () => {
    setData(EMPTY)
    setTouched(false)
    setSubmitted(false)
    setFileName('')
  }

  if (submitted) {
    return (
      <section id="feedback-form" className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-8 sm:px-5">
          <div className="bg-ss-surface border border-white/7 rounded-ss-xl flex flex-col items-center text-center gap-4 py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-ss-bon/10 border border-ss-bon/30 text-ss-bon grid place-items-center">
              <Check size={28} />
            </div>
            <h2 className="text-[clamp(22px,2vw,30px)] tracking-[-0.02em] font-medium m-0">
              Merci, votre retour a bien été envoyé.
            </h2>
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 max-w-[46ch] text-pretty m-0">
              On revient vers vous si on a besoin de précisions. Continuez à naviguer.
            </p>
            <Button variant="ghost" onClick={reset} className="mt-2">
              Envoyer un autre retour
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const t = touched
  return (
    <section id="feedback-form" className="py-[120px]">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <SectionHeader
          kicker="Bêta-testeurs"
          heading="Envoyez un retour terrain."
          lead="Une recommandation qui ne collait pas ? Un bug ? Ce formulaire va directement à l'équipe produit. Chaque retour est traité — pas archivé."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-[60px] items-start">
          <aside className="flex flex-col gap-5">
            {[
              {
                title: "Ce qu'on cherche à comprendre",
                content: (
                  <ul className="list-none m-0 p-0 mt-3.5 flex flex-col gap-3">
                    {[
                      { n: '01', t: 'Les cas où la recommandation et la réalité divergent.' },
                      { n: '02', t: 'Les données manquantes pour votre zone ou pratique.' },
                      { n: '03', t: "Les moments où l'interface vous a bloqué ou confus." },
                    ].map(({ n, t }) => (
                      <li key={n} className="flex gap-3 items-start text-[13px] text-ss-fg/72">
                        <span className="font-mono text-[11px] text-ss-teal tracking-[0.14em] mt-0.5">{n}</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                title: 'Délai de traitement',
                content: (
                  <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0 mt-2">
                    Les retours "recommandation incorrecte" sont examinés sous 48h. Les bugs critiques sous 24h.
                  </p>
                ),
              },
            ].map(({ title, content }) => (
              <div key={title} className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
                <h4 className="text-[14px] font-medium m-0">{title}</h4>
                {content}
              </div>
            ))}
            <div className="border border-ss-teal/20 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium text-ss-teal m-0 mb-2">Pas encore en beta ?</h4>
              <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0 mb-3.5">
                Ce formulaire est réservé aux testeurs. Pour rejoindre la beta, candidatez ci-dessus.
              </p>
              <Button href="#beta" size="sm">Rejoindre la beta</Button>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-ss-surface border border-white/7 rounded-ss-xl p-10 sm:p-6"
          >
            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-email" className={labelClass}>Votre email (testeur)</label>
              <input
                id="fb-email"
                type="email"
                className={clsx(inputClass, t && !isValidEmail(data.email) && errorClass)}
                value={data.email}
                onChange={upd('email')}
                placeholder="camille@exemple.fr"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelClass}>Type de retour</span>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map((v) => (
                  <Chip key={v} active={data.fbtype === v} onClick={() => set('fbtype', v)}>{v}</Chip>
                ))}
              </div>
              {t && !data.fbtype && <span className="text-[12px] text-ss-deconseille font-mono">Sélectionnez un type</span>}
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-spot" className={labelClass}>Spot concerné</label>
              <input
                id="fb-spot"
                className={inputClass}
                value={data.spot}
                onChange={upd('spot')}
                placeholder="Trévignon, Quiberon, port de départ…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-what" className={labelClass}>Que s'est-il passé ?</label>
              <textarea
                id="fb-what"
                className={clsx(inputClass, 'resize-y min-h-[96px] leading-[1.45]', t && data.what.trim().length < 10 && errorClass)}
                value={data.what}
                onChange={upd('what')}
                rows={4}
                placeholder="SeaScope m'a dit BON, mais une fois au large les conditions étaient…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-expected" className={labelClass}>Qu'est-ce que vous attendiez ?</label>
              <textarea
                id="fb-expected"
                className={clsx(inputClass, 'resize-y min-h-[72px] leading-[1.45]')}
                value={data.expected}
                onChange={upd('expected')}
                rows={3}
                placeholder="J'aurais voulu que SeaScope me signale le changement avant le départ…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelClass}>Capture d'écran (optionnel)</span>
              <label
                className="flex items-center gap-3 p-3.5 rounded-[10px] bg-black/[0.18] border border-dashed border-white/14 cursor-pointer text-[13px] text-ss-fg/50 hover:border-ss-teal hover:bg-ss-teal/4 hover:text-ss-fg/72 transition-[border-color,background,color] duration-150"
              >
                <ImageIcon size={18} />
                <span>{fileName || 'Ajouter une capture (PNG, JPG — max 5 Mo)'}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                />
              </label>
            </div>

            {t && !validate(data) && (
              <p className="font-mono text-[12px] text-ss-deconseille tracking-[0.06em] mb-4">
                Veuillez renseigner votre email, le type de retour et décrire ce qui s'est passé (min. 10 caractères).
              </p>
            )}

            <div className="flex items-center gap-3.5">
              <Button type="submit" size="lg">
                Envoyer un retour
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6.4: Verify TypeScript for client components**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6.5: Commit**

```bash
git add components/sections/Personalization.tsx components/sections/BetaForm.tsx components/sections/FeedbackForm.tsx
git commit -m "feat: add interactive Personalization, BetaForm, FeedbackForm client sections"
```

---

## Task 7: Final Assembly + Build Verification

**Files:**
- Modify: `app/page.tsx` (insert all sections in correct order)
- Run: `npm run build`

- [ ] **Step 7.1: Update `app/page.tsx` with all sections**

```tsx
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Personalization } from '@/components/sections/Personalization'
import { Trust } from '@/components/sections/Trust'
import { BetaForm } from '@/components/sections/BetaForm'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'
import { FeedbackForm } from '@/components/sections/FeedbackForm'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Personalization />
        <Trust />
        <BetaForm />
        <FeedbackLoop />
        <FeedbackForm />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 7.2: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7.3: Production build**

```bash
npm run build
```

Expected: Build succeeds. No `next build` errors. Note any warnings about missing `alt` attributes or similar — fix them.

- [ ] **Step 7.4: Smoke test dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Nav is sticky and has blur on scroll
- [ ] Hero renders device frame with `screen-bon.png`
- [ ] Scroll reveals animate each section into view
- [ ] Persona picker updates both the compose-block callouts and scenario card profiles
- [ ] Tolerance picker highlights correct scenario card and fades others
- [ ] BetaForm shows validation errors on empty submit
- [ ] BetaForm shows success state with user's first name after valid submit
- [ ] FeedbackForm file input shows selected filename
- [ ] FeedbackForm shows success state after valid submit
- [ ] Mobile (375px): nav links collapse, grid stacks to single column, device frame is 280px wide, callouts hidden

- [ ] **Step 7.5: Final commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble complete SeaScope landing page — all sections wired"
```

---

## Responsive Breakpoints Reference

| Screen | Container padding | Device frame | Persona grid | Steps grid | Problems grid |
|---|---|---|---|---|---|
| < 640px (`sm`) | `px-5` | `w-[280px]` | 1 col | 1 col | 1 col |
| 640–1024px (`md`) | `px-8` | `w-[340px]` | 3 col | 3 col | 2 col |
| > 1024px (`lg`) | `px-8` | `w-[380px]` (hero) | 5 col | 3 col | 12-col CSS grid |

Callouts (`.hidden.lg:flex`) only appear on large screens to avoid overlap.

## Vercel Deployment

This project requires no additional configuration. Push to a GitHub repository, connect to Vercel, deploy. The `next build` output from Task 7 is what Vercel runs.
