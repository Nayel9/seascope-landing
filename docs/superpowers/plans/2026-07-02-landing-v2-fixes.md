# Landing V2 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 6 user-feedback corrections to the seascope-landing V2: replace emojis with lucide-react icons, rewrite Story/Prepare copy, trim Security section, fix Decide layout, and correct the ComparisonTable paywall data.

**Architecture:** All changes are isolated to React/TSX components under `components/sections/` and `components/ui/`. lucide-react is added as a pnpm dependency. No new route, API, or data-fetching layer is touched.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v3, pnpm, lucide-react (new dep)

## Global Constraints

- Repo: `C:/Users/nvainer/WebstormProjects/seascope-landing` — NEVER touch seaScope.
- Branch: must be `feature/landing-v2-fixes` — verify with `git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD` before every commit; abort if not on this branch.
- `git add` specific files only. NEVER touch `components/admin/**` or `components/beta/**`.
- Single `<h1>` in Hero — do not add more.
- Do not rename `/screens/*.webp` assets.
- `pnpm typecheck` (0 errors) + `pnpm build` (clean) after final task.
- No emojis in output code (per user request).
- Icons: lucide-react, size 18, `strokeWidth={1.5}`, colour via `currentColor` or `text-ss-teal` via Tailwind className as context dictates.
- Existing design tokens: `ss-teal`, `ss-fg`, `ss-bg`, `ss-bg-2`, `ss-bon`, `ss-variable`, `ss-delicat`, `ss-deconseille`, `ss-bon/10`, etc.

---

### Task 1: Install lucide-react

**Files:**
- Modify: `package.json` (pnpm adds it automatically)
- Modify: `pnpm-lock.yaml` (auto-updated by pnpm)

**Interfaces:**
- Produces: `lucide-react` importable in all TSX files, e.g. `import { Calendar, Sun, Bell } from 'lucide-react'`

- [ ] **Step 1: Verify branch**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```
Expected output: `feature/landing-v2-fixes`

- [ ] **Step 2: Install lucide-react**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm add lucide-react
```
Expected: pnpm outputs "Done" with lucide-react listed.

- [ ] **Step 3: Verify it installed**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && node -e "require('lucide-react'); console.log('ok')"
```
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add package.json pnpm-lock.yaml
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "chore(landing): install lucide-react"
```

---

### Task 2: Replace emojis with lucide-react icons — sections

**Files:**
- Modify: `components/sections/Decide.tsx`
- Modify: `components/sections/Security.tsx`
- Modify: `components/sections/Navigate.tsx`
- Modify: `components/sections/Problem.tsx`
- Modify: `components/sections/Prepare.tsx`
- Modify: `components/sections/Explore.tsx`

**Interfaces:**
- Consumes: `lucide-react` installed in Task 1
- Produces: zero emoji characters in `components/sections/**`; each icon slot renders a lucide-react `<Icon className="w-[18px] h-[18px] text-ss-teal" strokeWidth={1.5} aria-hidden="true" />`

#### Context: icon mapping per file

**Decide.tsx** — `features` array icons:
- `'⚡'` (Score en temps réel) → `Zap`
- `'✅'` (Verdict immédiat) → `CheckCircle`
- `'🕐'` (Creneaux idéaux) → `Clock`
- `'↩️'` (Heure de retour) → `CornerDownLeft`

**Security.tsx** — `guardianFeatures` array icons:
- `'👁️'` (Guardian Watch) → `Eye`
- `'⚓'` (Verdict mouillage) → `Anchor`
- `'🔔'` (Alertes intelligentes) → `Bell`
- `'🛡️'` (Surveillance d'ancre) → `ShieldCheck`

**Navigate.tsx** — `navigateFeatures` array icons:
- `'🗺️'` (Cartographie IGN) → `Map`
- `'⚓'` (Journal de bord) → `BookOpen`
- `'🚢'` (Trafic AIS) → `Ship`
- `'🌙'` (Zones de mouillage) → `MapPin`

**Problem.tsx** — `apps` array icons:
- `'🌬️'` (Appli météo) → `Wind`
- `'🗺️'` (Appli cartes) → `Map`
- `'🌊'` (Site des marées) → `Waves`
- `'📡'` (Modèle houle) → `Radio`
- `'🧭'` (Météo au port) → `Compass`

**Prepare.tsx** — `prepareItems` array icons:
- `'📅'` (Aujourd'hui) → `CalendarDays`
- `'📆'` (7 jours) → `Calendar`
- `'🌤️'` (Météo détaillée) → `CloudSun`
- `'🗓️'` (Planning) → `CalendarRange`

**Explore.tsx** — `layers` array icons (small pills):
- `'📍'` (Spots) → `MapPin`
- `'🔴'` (Balises) → `CircleDot`
- `'💨'` (Vent) → `Wind`
- `'🌧️'` (Pluie) → `CloudRain`
- `'🌊'` (Courants) → `Waves`
- `'📏'` (Bathymétrie) → `Ruler`
- `'⭐'` (POI) → `Star`

#### Implementation pattern

Each section that currently has `icon: 'emoji'` in a data array uses the `icon` field rendered as a `<span className="text-2xl">{item.icon}</span>`. The replacement approach is:

1. Change the data array type so `icon` is a React component reference (or render inline).
2. The simplest approach: add an `Icon` component type in the array and render it directly.

For feature-card arrays (Decide, Security, Navigate, Problem, Prepare):

```tsx
// Before (example from Decide.tsx):
const features = [
  { icon: '⚡', title: 'Score en temps réel', desc: '...' },
  ...
]
// ... in JSX:
<span className="text-2xl leading-none select-none" aria-hidden="true">
  {f.icon}
</span>
```

```tsx
// After (example from Decide.tsx):
import { Zap, CheckCircle, Clock, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const features: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Zap,            title: 'Score en temps réel',      desc: 'Toutes les variables marines agrégées en un indice de 0 à 100 — mis à jour à chaque nouvelle prévision.' },
  { Icon: CheckCircle,    title: 'Verdict immédiat',          desc: "BON, VARIABLE, DELICAT ou DECONSEILLE — affiché dès l'ouverture, sans lecture d'un seul chiffre." },
  { Icon: Clock,          title: 'Créneaux idéaux',           desc: 'Les meilleures fenêtres de sortie calculées heure par heure, selon votre profil et vos limites.' },
  { Icon: CornerDownLeft, title: 'Heure de retour conseillée', desc: "SeaScope surveille la dégradation et vous indique à quelle heure être rentré au port." },
]

// ... in JSX:
<f.Icon
  className="w-[18px] h-[18px] text-ss-teal"
  strokeWidth={1.5}
  aria-hidden="true"
/>
```

For Explore.tsx layers (pills), the icon is inline in the pill span:

```tsx
// Before:
import { Zap } from 'lucide-react' // (example)
const layers = [
  { label: 'Spots', icon: '📍' },
  ...
]
// <span aria-hidden="true">{layer.icon}</span>

// After:
import { MapPin, CircleDot, Wind, CloudRain, Waves, Ruler, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const layers: { label: string; Icon: LucideIcon }[] = [
  { label: 'Spots',       Icon: MapPin    },
  { label: 'Balises',     Icon: CircleDot },
  { label: 'Vent',        Icon: Wind      },
  { label: 'Pluie',       Icon: CloudRain },
  { label: 'Courants',    Icon: Waves     },
  { label: 'Bathymétrie', Icon: Ruler     },
  { label: 'POI',         Icon: Star      },
]

// In JSX pill:
<layer.Icon className="w-[14px] h-[14px]" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 1: Edit Decide.tsx**

Full replacement for `C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections/Decide.tsx`:

```tsx
import { Zap, CheckCircle, Clock, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'
import { Pill } from '@/components/ui/Pill'

const features: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Zap,
    title: 'Score en temps réel',
    desc: 'Toutes les variables marines agrégées en un indice de 0 à 100 — mis à jour à chaque nouvelle prévision.',
  },
  {
    Icon: CheckCircle,
    title: 'Verdict immédiat',
    desc: "BON, VARIABLE, DELICAT ou DECONSEILLE — affiché dès l'ouverture, sans lecture d'un seul chiffre.",
  },
  {
    Icon: Clock,
    title: 'Créneaux idéaux',
    desc: 'Les meilleures fenêtres de sortie calculées heure par heure, selon votre profil et vos limites.',
  },
  {
    Icon: CornerDownLeft,
    title: 'Heure de retour conseillée',
    desc: "SeaScope surveille la dégradation et vous indique à quelle heure être rentré au port.",
  },
]

export function Decide() {
  return (
    <section id="decide" className="py-16 md:py-[120px]">
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Décider"
            heading={
              <>
                Décider en
                <br />
                quelques&nbsp;secondes.
              </>
            }
            lead="Plus besoin d'interpréter les chiffres. SeaScope lit les données marines à votre place et vous dit simplement si vous pouvez sortir."
          />
        </Reveal>

        <Reveal>
          <FeatureRow
            title="Votre prévision du jour, d'un coup d'oeil"
            image={{
              src: '/screens/forecast-today.webp',
              alt: 'Écran prévision du jour — score, verdict, fenêtres horaires',
              priority: false,
            }}
          >
            <p>
              En haut de l&apos;écran : le verdict du jour, le score global et la
              fenêtre optimale. En bas : le détail heure par heure si vous voulez
              comprendre.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill kind="bon">Sortie idéale</Pill>
              <Pill kind="variable">Sortie possible</Pill>
              <Pill kind="deconseille">Déconseillé</Pill>
            </div>
          </FeatureRow>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-ss-bg p-6 md:p-8 flex flex-col gap-3"
              >
                <f.Icon
                  className="w-[18px] h-[18px] text-ss-teal"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-[17px] md:text-[19px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {f.title}
                </h3>
                <p className="text-[13px] md:text-[14px] text-ss-fg/55 leading-relaxed m-0">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 md:mt-20">
            <FeatureRow
              title="Le tableau de bord décisionnel"
              image={{
                src: '/screens/dashboard-decision.webp',
                alt: 'Tableau de bord SeaScope — vue décisionnelle complète',
              }}
              reverse
            >
              <p>
                Le dashboard regroupe vent, vagues, marées, courants et
                sécurité Guardian sur un seul écran. Zéro navigation entre
                applis.
              </p>
              <p>
                Chaque indicateur est contextualisé : un vent de 15 noeuds n&apos;a
                pas le même impact selon votre bateau et votre expérience.
              </p>
            </FeatureRow>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Edit Security.tsx**

Replace the `guardianFeatures` array and its render (the `icon` field + `<span>` → `Icon` component):

```tsx
// Top imports — replace existing icon imports section:
import { Eye, Anchor, Bell, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Replace guardianFeatures array:
const guardianFeatures: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Eye,
    title: 'Guardian Watch',
    desc: "Surveillance continue de vos conditions de mouillage — vent, vague, affourchage — même en arrière-plan.",
  },
  {
    Icon: Anchor,
    title: 'Verdict mouillage',
    desc: "SeaScope évalue si votre zone de mouillage est sûre : profondeur, protection, risque de dragage.",
  },
  {
    Icon: Bell,
    title: 'Alertes intelligentes',
    desc: "Notification immédiate si une variable dépasse votre seuil de sécurité personnalisé : vent, houle, marée.",
  },
  {
    Icon: ShieldCheck,
    title: "Surveillance d'ancre",
    desc: "Trace un périmètre autour de votre position. Alerte dès que le bateau sort du rayon défini.",
  },
]

// In JSX, replace:
// <span className="text-2xl leading-none select-none" aria-hidden="true">{feature.icon}</span>
// with:
// <feature.Icon className="w-[18px] h-[18px] text-ss-teal" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 3: Edit Navigate.tsx**

```tsx
// Top imports add:
import { Map, BookOpen, Ship, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Replace navigateFeatures array:
const navigateFeatures: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Map,
    title: 'Cartographie IGN',
    desc: "Cartes marines officielles IGN avec fond bathymétrique intégré. Téléchargement hors-ligne pour naviguer sans réseau.",
  },
  {
    Icon: BookOpen,
    title: 'Journal de bord',
    desc: "Enregistrez vos sorties automatiquement — traces GPS, conditions rencontrées, points d'intérêt.",
  },
  {
    Icon: Ship,
    title: 'Trafic AIS',
    desc: "Visualisez le trafic maritime AIS autour de vous : cargos, ferries, vedettes — en temps réel.",
  },
  {
    Icon: MapPin,
    title: 'Zones de mouillage',
    desc: "Trouvez les mouillages réglementaires, évaluez leur protection selon les conditions du moment.",
  },
]

// In JSX replace <span className="text-2xl...">{feature.icon}</span>
// with:
// <feature.Icon className="w-[18px] h-[18px] text-ss-teal" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 4: Edit Problem.tsx**

```tsx
// Top imports add:
import { Wind, Map, Waves, Radio, Compass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Replace apps array:
const apps: { Icon: LucideIcon; label: string; value: string; note: string }[] = [
  {
    Icon: Wind,
    label: 'Appli météo',
    value: 'Vent 18 noeuds, rafales 26',
    note: 'Mais quelle houle ?',
  },
  {
    Icon: Map,
    label: 'Appli cartes',
    value: 'Carte marine naviguable',
    note: 'Pas de météo ni de marée',
  },
  {
    Icon: Waves,
    label: 'Site des marées',
    value: 'Coefficient 82, PM 10h14',
    note: 'Courants non précisés',
  },
  {
    Icon: Radio,
    label: 'Modèle houle',
    value: 'Hm0 1,2 m · Tp 7 s',
    note: 'Source différente, verdict différent',
  },
  {
    Icon: Compass,
    label: 'Météo au port',
    value: 'VHF : Bonne brise',
    note: 'Trop vague pour décider',
  },
]

// In JSX replace <span className="text-2xl...">{app.icon}</span>
// with:
// <app.Icon className="w-[18px] h-[18px] text-ss-teal" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 5: Edit Prepare.tsx**

```tsx
// Top imports add:
import { CalendarDays, Calendar, CloudSun, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Replace prepareItems array:
const prepareItems: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: CalendarDays,
    title: "Aujourd'hui",
    desc: "Score, verdict, fenêtres horaires et heure de retour pour la journée en cours.",
  },
  {
    Icon: Calendar,
    title: 'Meilleures fenêtres',
    desc: "Vue des meilleurs créneaux à venir — identifiez d'un coup d'oeil les sorties recommandées selon vos contraintes.",
  },
  {
    Icon: CloudSun,
    title: 'Conditions détaillées',
    desc: "Vent, rafales, vagues, houle, précipitations, visibilité — tout ce dont vous avez besoin pour décider.",
  },
  {
    Icon: CalendarRange,
    title: 'Planning de sortie',
    desc: "Planifiez plusieurs sorties et comparez les créneaux optimaux sur les jours à venir.",
  },
]

// In JSX replace <span className="text-2xl...">{item.icon}</span>
// with:
// <item.Icon className="w-[18px] h-[18px] text-ss-teal" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 6: Edit Explore.tsx**

```tsx
// Top imports add:
import { MapPin, CircleDot, Wind, CloudRain, Waves, Ruler, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Replace layers array:
const layers: { label: string; Icon: LucideIcon }[] = [
  { label: 'Spots',       Icon: MapPin    },
  { label: 'Balises',     Icon: CircleDot },
  { label: 'Vent',        Icon: Wind      },
  { label: 'Pluie',       Icon: CloudRain },
  { label: 'Courants',    Icon: Waves     },
  { label: 'Bathymétrie', Icon: Ruler     },
  { label: 'POI',         Icon: Star      },
]

// In JSX pill replace <span aria-hidden="true">{layer.icon}</span>
// with:
// <layer.Icon className="w-[14px] h-[14px]" strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 7: Verify zero emojis remain in sections**

```bash
grep -rloP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]" "C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections"
```
Expected: no output (no files matched).

- [ ] **Step 8: Verify zero emojis remain in ui**

```bash
grep -rloP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]" "C:/Users/nvainer/WebstormProjects/seascope-landing/components/ui"
```
Expected: no output.

- [ ] **Step 9: Typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, no errors.

- [ ] **Step 10: Verify branch + commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```
Expected: `feature/landing-v2-fixes`

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add \
  components/sections/Decide.tsx \
  components/sections/Security.tsx \
  components/sections/Navigate.tsx \
  components/sections/Problem.tsx \
  components/sections/Prepare.tsx \
  components/sections/Explore.tsx
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "refactor(landing): emojis -> icones lucide-react"
```

---

### Task 3: Rewrite Story.tsx copy + fix Prepare.tsx copy (meilleures fenêtres)

**Files:**
- Modify: `components/sections/Story.tsx`
- Modify: `components/sections/Prepare.tsx`

**Interfaces:**
- Consumes: Prepare.tsx already edited for icons in Task 2 (the icon array `prepareItems` is already patched; this task updates only the text body of Prepare and the entire prose of Story)
- Produces: Story prose is factual/credible, no forced storytelling; Prepare copy says "meilleures fenêtres" not "7 jours bruts"; `weather.webp` FeatureRow block removed from Prepare

Note: The `prepareItems[1]` title was already updated to "Meilleures fenêtres" in Task 2 Step 5. This task aligns the main body copy.

- [ ] **Step 1: Rewrite Story.tsx**

Full replacement for `C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections/Story.tsx`:

```tsx
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'

export function Story() {
  return (
    <section
      id="story"
      className="py-16 md:py-[120px] bg-ss-bg-2"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Pourquoi SeaScope existe"
            heading={
              <>
                Un outil construit
                <br />
                par un plaisancier.
              </>
            }
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-start">
          {/* Citation */}
          <Reveal>
            <blockquote className="border-l-2 border-ss-teal pl-6 md:pl-8 m-0">
              <p className="text-[clamp(20px,2.2vw,32px)] leading-[1.35] tracking-[-0.015em] font-medium text-ss-fg text-pretty m-0">
                &ldquo;Je voulais juste savoir si je pouvais sortir en mer ce
                matin. Trois applis et vingt minutes plus tard, je n&apos;avais
                toujours pas de réponse.&rdquo;
              </p>
              <footer className="mt-5 text-[13px] text-ss-fg/45 not-italic">
                — Le fondateur, plaisancier depuis 4 ans
              </footer>
            </blockquote>
          </Reveal>

          {/* Narrative */}
          <Reveal delay={80}>
            <div className="flex flex-col gap-5 text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72">
              <p>
                Les données marines existent. Elles sont précises, souvent
                gratuites. Le problème, c&apos;est l&apos;interprétation : combiner vent,
                vagues, courant de marée et visibilité en une décision concrète
                demande de l&apos;expérience et du temps.
              </p>
              <p>
                SeaScope a été conçu pour combler cet écart — transformer des
                données complexes en une réponse simple. Pas un tableau de
                chiffres de plus, une décision : vous pouvez sortir, ou pas,
                et si oui, à quelle heure.
              </p>
              <p className="text-ss-fg/50 text-[13px]">
                Utilisé par plusieurs milliers de plaisanciers sur les côtes
                françaises, de la Bretagne à la Méditerranée.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite Prepare.tsx body copy and remove weather.webp block**

Important: the `prepareItems` array was already updated in Task 2 Step 5.
This step rewrites only the SectionHeader `lead`, the first FeatureRow body copy, and removes the second FeatureRow block (weather.webp).

Full replacement for `C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections/Prepare.tsx`:

```tsx
import { CalendarDays, Calendar, CloudSun, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'

const prepareItems: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: CalendarDays,
    title: "Aujourd'hui",
    desc: "Score, verdict, fenêtres horaires et heure de retour pour la journée en cours.",
  },
  {
    Icon: Calendar,
    title: 'Meilleures fenêtres',
    desc: "Les meilleurs créneaux à venir triés selon vos contraintes et votre profil — pas un calendrier brut.",
  },
  {
    Icon: CloudSun,
    title: 'Conditions détaillées',
    desc: "Vent, rafales, vagues, houle, précipitations, visibilité — tout ce dont vous avez besoin pour décider.",
  },
  {
    Icon: CalendarRange,
    title: 'Planning de sortie',
    desc: "Planifiez plusieurs sorties et comparez les créneaux optimaux sur les jours à venir.",
  },
]

export function Prepare() {
  return (
    <section
      id="prepare"
      className="py-16 md:py-[120px] bg-ss-bg-2 border-y border-white/7"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Préparer"
            heading={
              <>
                Préparer ses
                <br />
                sorties à l&apos;avance.
              </>
            }
            lead="SeaScope repère pour vous les meilleurs créneaux à venir, classés selon vos disponibilités et votre profil — pas de prévisions brutes à interpréter."
          />
        </Reveal>

        {/* Best windows feature row */}
        <Reveal>
          <FeatureRow
            title="Les meilleures fenêtres, sélectionnées pour vous"
            image={{
              src: '/screens/forecast-7days.webp',
              alt: 'Écran meilleures fenêtres — créneaux de sortie classés et filtrés',
            }}
          >
            <p>
              SeaScope analyse les prochains jours et met en avant les créneaux
              où les conditions correspondent à votre profil et vos limites.
              Vous voyez directement ce qui est navigable pour vous — pas une
              liste de chiffres à déchiffrer.
            </p>
            <p>
              Les créneaux déconseillés sont clairement signalés. Finies les
              mauvaises surprises le matin du départ.
            </p>
          </FeatureRow>
        </Reveal>

        {/* Feature cards */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {prepareItems.map((item) => (
              <div
                key={item.title}
                className="bg-ss-bg p-6 md:p-7 flex flex-col gap-3"
              >
                <item.Icon
                  className="w-[18px] h-[18px] text-ss-teal"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-[16px] md:text-[17px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] text-ss-fg/55 leading-relaxed m-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, no errors.

- [ ] **Step 4: Verify branch + commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add \
  components/sections/Story.tsx \
  components/sections/Prepare.tsx
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "fix(landing): copy Story + Préparer (meilleures fenêtres, pas 7 jours brut)"
```

---

### Task 4: Security section — remove sources banner + settings-sources screenshot

**Files:**
- Modify: `components/sections/Security.tsx`

**Interfaces:**
- Consumes: Security.tsx already has icons replaced (Task 2). This task removes the two blocks after the guardian feature cards: the second `FeatureRow` (settings-sources.webp) and the trust banner (dataSources array + rendered div).
- Produces: Security.tsx with only the main DeviceFrame visual (dashboard-decision.webp), the text column, and the guardianFeatures card grid.

- [ ] **Step 1: Rewrite Security.tsx — remove FeatureRow + trust banner**

Full replacement for `C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections/Security.tsx`:

```tsx
import Image from 'next/image'
import { Eye, Anchor, Bell, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Callout } from '@/components/ui/Callout'
import { DeviceFrame } from '@/components/ui/DeviceFrame'

const guardianFeatures: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Eye,
    title: 'Guardian Watch',
    desc: "Surveillance continue de vos conditions de mouillage — vent, vague, affourchage — même en arrière-plan.",
  },
  {
    Icon: Anchor,
    title: 'Verdict mouillage',
    desc: "SeaScope évalue si votre zone de mouillage est sûre : profondeur, protection, risque de dragage.",
  },
  {
    Icon: Bell,
    title: 'Alertes intelligentes',
    desc: "Notification immédiate si une variable dépasse votre seuil de sécurité personnalisé : vent, houle, marée.",
  },
  {
    Icon: ShieldCheck,
    title: "Surveillance d'ancre",
    desc: "Trace un périmètre autour de votre position. Alerte dès que le bateau sort du rayon défini.",
  },
]

export function Security() {
  return (
    <section
      id="security"
      className="relative py-16 md:py-[120px] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 70% 40%, rgba(94,234,212,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Sécurité — Guardian"
            heading={
              <>
                Mouillé en sécurité,
                <br />
                même la nuit.
              </>
            }
            lead="Guardian surveille vos conditions d'amarrage en continu et vous alerte avant que la situation ne devienne critique."
          />
        </Reveal>

        {/* Main visual: dashboard-decision with Callout overlay */}
        <Reveal>
          <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Phone + callout badge */}
            <div className="relative flex-none flex justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-[1.4]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(94,234,212,0.09), transparent 80%)',
                }}
              />
              <DeviceFrame large>
                <Image
                  src="/screens/dashboard-decision.webp"
                  alt="Tableau de bord SeaScope — bandeau Mouillage autorisé Guardian"
                  fill
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 380px"
                  className="object-cover"
                  loading="lazy"
                />
              </DeviceFrame>
              <Callout
                num="✓"
                label="Guardian"
                text="Mouillage autorisé"
                style={{ top: '30%', right: '-80px' }}
              />
            </div>

            {/* Text column */}
            <div className="flex-1 max-w-[520px]">
              <h3 className="text-[clamp(22px,2.4vw,36px)] leading-[1.1] tracking-[-0.02em] font-medium text-ss-fg mb-5">
                Un gardien pour votre&nbsp;mouillage.
              </h3>
              <p className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72 mb-6">
                Vous êtes à terre, vous dormez dans la cabine — Guardian
                continue de surveiller. Vent qui fraîchit, ancre qui dérape,
                marée qui découvre : SeaScope vous prévient avant qu&apos;il ne
                soit trop tard.
              </p>
              <p className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72">
                Les seuils sont entièrement personnalisables selon votre bateau
                et votre tolérance au risque. Un voilier de 9 mètres et un
                catamaran n&apos;ont pas les mêmes limites.
              </p>
            </div>

          </div>
        </Reveal>

        {/* Guardian feature cards */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {guardianFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-ss-bg p-6 md:p-8 flex flex-col gap-3"
              >
                <feature.Icon
                  className="w-[18px] h-[18px] text-ss-teal"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-[17px] md:text-[19px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[13px] md:text-[14px] text-ss-fg/55 leading-relaxed m-0">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, no errors.

- [ ] **Step 3: Verify branch + commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add components/sections/Security.tsx
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "fix(landing): section Securite — retire bandeau sources + settings screenshot"
```

---

### Task 5: Rework Decide.tsx — premium layout for the capture

**Files:**
- Modify: `components/sections/Decide.tsx`

**Interfaces:**
- Consumes: Decide.tsx already fully rewritten in Task 2 Step 1 (icons replaced, same FeatureRow layout). This task replaces the second `FeatureRow` (dashboard-decision) with a premium centered layout using `screen-bon.png` asset inside a `PhoneMock`, with explicit spacing and a verdict caption.
- Produces: The second visual in Decide uses `PhoneMock` centered in a styled container with caption text, not a raw `FeatureRow` call that feels "claqué au sol".

Assets available:
- `/screens/screen-bon.png` — verdict "Bon" screen (more appropriate for "Décider" than dashboard-decision which is already used in Hero and Security)
- `/screens/dashboard-decision.webp` — currently used in Hero + Security

Design decision: use `screen-bon.png` here to show score/verdict clearly; keep `dashboard-decision.webp` for Hero/Security. The layout: full-width centered wrapper, `PhoneMock large`, centered caption row with score label.

- [ ] **Step 1: Rewrite Decide.tsx second visual block**

Full replacement for `C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections/Decide.tsx`:

```tsx
import { Zap, CheckCircle, Clock, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'
import { PhoneMock } from '@/components/ui/PhoneMock'
import { Pill } from '@/components/ui/Pill'

const features: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Zap,
    title: 'Score en temps réel',
    desc: 'Toutes les variables marines agrégées en un indice de 0 à 100 — mis à jour à chaque nouvelle prévision.',
  },
  {
    Icon: CheckCircle,
    title: 'Verdict immédiat',
    desc: "BON, VARIABLE, DELICAT ou DECONSEILLE — affiché dès l'ouverture, sans lecture d'un seul chiffre.",
  },
  {
    Icon: Clock,
    title: 'Créneaux idéaux',
    desc: 'Les meilleures fenêtres de sortie calculées heure par heure, selon votre profil et vos limites.',
  },
  {
    Icon: CornerDownLeft,
    title: 'Heure de retour conseillée',
    desc: "SeaScope surveille la dégradation et vous indique à quelle heure être rentré au port.",
  },
]

export function Decide() {
  return (
    <section id="decide" className="py-16 md:py-[120px]">
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Décider"
            heading={
              <>
                Décider en
                <br />
                quelques&nbsp;secondes.
              </>
            }
            lead="Plus besoin d'interpréter les chiffres. SeaScope lit les données marines à votre place et vous dit simplement si vous pouvez sortir."
          />
        </Reveal>

        {/* Main feature row — forecast-today */}
        <Reveal>
          <FeatureRow
            title="Votre prévision du jour, d'un coup d'oeil"
            image={{
              src: '/screens/forecast-today.webp',
              alt: 'Écran prévision du jour — score, verdict, fenêtres horaires',
              priority: false,
            }}
          >
            <p>
              En haut de l&apos;écran : le verdict du jour, le score global et la
              fenêtre optimale. En bas : le détail heure par heure si vous voulez
              comprendre.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill kind="bon">Sortie idéale</Pill>
              <Pill kind="variable">Sortie possible</Pill>
              <Pill kind="deconseille">Déconseillé</Pill>
            </div>
          </FeatureRow>
        </Reveal>

        {/* Feature cards grid */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-ss-bg p-6 md:p-8 flex flex-col gap-3"
              >
                <f.Icon
                  className="w-[18px] h-[18px] text-ss-teal"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="text-[17px] md:text-[19px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                  {f.title}
                </h3>
                <p className="text-[13px] md:text-[14px] text-ss-fg/55 leading-relaxed m-0">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Premium score/verdict visual — centered PhoneMock */}
        <Reveal delay={120}>
          <div className="mt-20 md:mt-28 flex flex-col items-center gap-8 md:gap-10">
            {/* Caption above */}
            <div className="text-center max-w-[480px]">
              <h3 className="text-[clamp(20px,2.2vw,32px)] leading-[1.15] tracking-[-0.02em] font-medium text-ss-fg mb-3">
                Le verdict en un mot.
              </h3>
              <p className="text-[clamp(13px,1vw,15px)] leading-relaxed text-ss-fg/60">
                Bon, Variable, Délicat ou Déconseillé — le score contextualise chaque condition
                selon votre bateau et votre expérience.
              </p>
            </div>

            {/* Phone centered with halo */}
            <div className="relative flex justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-[1.5]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(94,234,212,0.10), transparent 80%)',
                }}
              />
              <PhoneMock
                src="/screens/screen-bon.png"
                alt="Écran SeaScope — verdict BON affiché clairement avec score"
                large
              />
            </div>

            {/* Caption below */}
            <p className="text-[12px] text-ss-fg/35 text-center max-w-[38ch]">
              Verdict « Bon » — score 87/100, fenêtre optimale identifiée
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, no errors.

- [ ] **Step 3: Verify branch + commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add components/sections/Decide.tsx
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "fix(landing): rework visuel section Décider"
```

---

### Task 6: Fix ComparisonTable — correct Guardian/tier distribution

**Files:**
- Modify: `components/ui/ComparisonTable.tsx`

**Interfaces:**
- Consumes: existing ComparisonTable structure (FEATURES array of FeatureLine, Cell renderer, CheckIcon/DashIcon — unchanged)
- Produces: FEATURES array matches the exact paywall spec provided verbatim by the user

Current bugs in FEATURES:
- `Simulateur` row: free=`'3 spots'` — wrong label (should be the row about Spots, not Simulateur); the data is mixed up. The spec says:
  - "Simulateur (sortie du jour)": free=true, premium=true, premiumPlus=true
  - "Spots enregistrés illimités": free=`'3 spots'`, premium=`'illimité'`, premiumPlus=`'illimité'`
  - "Journal de bord": free=true (label "Journal" is correct)
- `Simulateur avancé`: spec says free=false, **premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Overlay courant`: spec says free=false, **premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Alertes personnalisées` (currently "Alertes perso"): spec says free=false, **premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Profils bateau multiples` (currently "Profils bateau"): spec says free=false, **premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Guardian Watch` (tag: security): spec says **free=true, premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Guardian Intelligent`: spec says free=false, **premium=true**, premiumPlus=true — currently false/false/true (WRONG)
- `Arrival Intelligence avancée` (currently "Arrival Intelligence"): spec says free=false, premium=false, premiumPlus=true — OK
- Row labels need updating to match spec exactly

- [ ] **Step 1: Replace FEATURES array in ComparisonTable.tsx**

Edit only the `FEATURES` constant. The rest of the file (Cell, CheckIcon, DashIcon, JSX table render) stays identical.

Replace the entire `const FEATURES: FeatureLine[] = [...]` block with:

```tsx
const FEATURES: FeatureLine[] = [
  // Toutes paliers
  { label: 'Verdict mouillage',            tag: 'security', free: true,        premium: true,        premiumPlus: true        },
  { label: 'Météo de base',                                 free: true,        premium: true,        premiumPlus: true        },
  { label: 'Score de décision',                             free: true,        premium: true,        premiumPlus: true        },
  { label: 'Carte & POI',                                   free: true,        premium: true,        premiumPlus: true        },
  { label: 'Journal de bord',                               free: true,        premium: true,        premiumPlus: true        },
  { label: 'Simulateur (sortie du jour)',                   free: true,        premium: true,        premiumPlus: true        },
  // Premium +
  { label: 'Prévisions étendues',                           free: false,       premium: true,        premiumPlus: true        },
  { label: 'Planning multi-jours',                          free: false,       premium: true,        premiumPlus: true        },
  { label: 'Spots enregistrés',                             free: '3 spots',   premium: 'illimité',  premiumPlus: 'illimité'  },
  { label: "Courants & hauteur d'eau",                      free: false,       premium: true,        premiumPlus: true        },
  { label: 'Simulateur avancé',                             free: false,       premium: true,        premiumPlus: true        },
  { label: 'Overlay courant (carte)',                       free: false,       premium: true,        premiumPlus: true        },
  { label: 'Alertes personnalisées',                        free: false,       premium: true,        premiumPlus: true        },
  { label: 'Profils bateau multiples',                      free: false,       premium: true,        premiumPlus: true        },
  { label: 'Guardian Watch',              tag: 'security',  free: true,        premium: true,        premiumPlus: true        },
  { label: 'Guardian Intelligent',                          free: false,       premium: true,        premiumPlus: true        },
  // Premium+ exclusif
  { label: 'Guardian Pro',               tag: 'soon',       free: false,       premium: false,       premiumPlus: true        },
  { label: 'Arrival Intelligence avancée',                  free: false,       premium: false,       premiumPlus: true        },
  { label: 'Réglementation avancée',                        free: false,       premium: false,       premiumPlus: true        },
  { label: 'Synchronisation cloud',                         free: false,       premium: false,       premiumPlus: true        },
  { label: 'Équipage',                   tag: 'soon',       free: false,       premium: false,       premiumPlus: true        },
  { label: 'Communauté',                 tag: 'soon',       free: false,       premium: false,       premiumPlus: true        },
  { label: 'Partage avancé',             tag: 'soon',       free: false,       premium: false,       premiumPlus: true        },
]
```

- [ ] **Step 2: Typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, no errors.

- [ ] **Step 3: Verify branch + commit**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" rev-parse --abbrev-ref HEAD
```

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" add components/ui/ComparisonTable.tsx
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" commit -m "fix(landing): comparatif — répartition Guardian/paliers correcte (miroir paywall)"
```

---

### Task 7: Final build verification + write report

**Files:**
- Create: `.superpowers/sdd/landing-fixes-report.md`

**Interfaces:**
- Consumes: all previous tasks completed, branch still `feature/landing-v2-fixes`

- [ ] **Step 1: Full typecheck**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm typecheck
```
Expected: exits 0, zero errors.

- [ ] **Step 2: Full build**

```bash
cd "C:/Users/nvainer/WebstormProjects/seascope-landing" && pnpm build
```
Expected: exits 0, `Route (app)` table printed, no TypeScript or build errors.

- [ ] **Step 3: Zero emoji final check**

```bash
grep -rloP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]" \
  "C:/Users/nvainer/WebstormProjects/seascope-landing/components/sections" \
  "C:/Users/nvainer/WebstormProjects/seascope-landing/components/ui"
```
Expected: no output.

- [ ] **Step 4: Git log for commit SHAs**

```bash
git -C "C:/Users/nvainer/WebstormProjects/seascope-landing" log --oneline -6
```
Capture output for the report.

- [ ] **Step 5: Write report**

Create `C:/Users/nvainer/WebstormProjects/seascope-landing/.superpowers/sdd/landing-fixes-report.md` with:
- Status: DONE or DONE_WITH_CONCERNS
- Branch guard confirmation
- lucide-react install confirmation
- Zero emoji confirmation
- List of 5 commits (SHA + subject)
- Summary of each fix (1-6)
- pnpm typecheck result
- pnpm build result
