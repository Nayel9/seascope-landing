'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { NAV_TYPES, FREQUENCIES, PLATFORMS, PRACTICES } from '@/lib/data'
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

function isValid(d: BetaFormValues) {
  return (
    d.firstname.trim().length >= 2 &&
    isValidEmail(d.email) &&
    d.region.trim().length >= 2 &&
    !!d.navType && !!d.freq && !!d.platform && !!d.practice &&
    d.consent
  )
}

const inputBase =
  'bg-black/[0.18] border border-white/7 rounded-[10px] px-3.5 py-3.5 text-[15px] text-ss-fg outline-none w-full placeholder:text-ss-fg/32 transition-[border-color,background] duration-150 hover:border-white/14 focus:border-ss-teal focus:bg-ss-teal/4'
const labelBase = 'font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50'

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
    if (isValid(data)) setSubmitted(true)
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
              On a bien reçu votre candidature. Vous recevrez un lien d&apos;accès
              à la beta et l&apos;invitation au Discord testeurs dans les prochains jours.
            </p>
            <div className="flex gap-3 flex-wrap justify-center mt-4">
              <Button href="#feedback-form" variant="ghost">Vous êtes déjà en beta ?</Button>
              <Button onClick={() => { setData(EMPTY); setTouched(false); setSubmitted(false) }}>
                Inscrire quelqu&apos;un d&apos;autre
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
                <label htmlFor="b-firstname" className={labelBase}>Prénom</label>
                <input
                  id="b-firstname"
                  className={clsx(inputBase, t && data.firstname.trim().length < 2 && 'border-ss-deconseille')}
                  value={data.firstname}
                  onChange={upd('firstname')}
                  placeholder="Camille"
                  autoComplete="given-name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="b-email" className={labelBase}>Email</label>
                <input
                  id="b-email"
                  type="email"
                  className={clsx(inputBase, t && !isValidEmail(data.email) && 'border-ss-deconseille')}
                  value={data.email}
                  onChange={upd('email')}
                  placeholder="camille@exemple.fr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="b-region" className={labelBase}>Région de navigation</label>
              <input
                id="b-region"
                className={clsx(inputBase, t && data.region.trim().length < 2 && 'border-ss-deconseille')}
                value={data.region}
                onChange={upd('region')}
                placeholder="Sud Finistère, Quiberon, Côte d'Azur…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelBase}>Type de navigation</span>
              <div className="flex flex-wrap gap-2">
                {NAV_TYPES.map((v) => (
                  <Chip key={v} active={data.navType === v} onClick={() => set('navType', v)}>{v}</Chip>
                ))}
              </div>
              {t && !data.navType && <span className="font-mono text-[12px] text-ss-deconseille">Sélectionnez un type</span>}
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelBase}>Fréquence de sortie</span>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map((v) => (
                  <Chip key={v} active={data.freq === v} onClick={() => set('freq', v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3.5 mb-[22px]">
              <div className="flex flex-col gap-2">
                <label htmlFor="b-boat" className={labelBase}>Bateau / engin</label>
                <input
                  id="b-boat"
                  className={inputBase}
                  value={data.boat}
                  onChange={upd('boat')}
                  placeholder="Modèle, longueur, propulsion (optionnel)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className={labelBase}>Plateforme</span>
                <div className="flex gap-2">
                  {PLATFORMS.map((v) => (
                    <Chip key={v} active={data.platform === v} onClick={() => set('platform', v)}>{v}</Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelBase}>Pratique principale</span>
              <div className="flex flex-wrap gap-2">
                {PRACTICES.map((v) => (
                  <Chip key={v} active={data.practice === v} onClick={() => set('practice', v)}>{v}</Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="b-blocker" className={labelBase}>
                Qu&apos;est-ce qui vous fait généralement renoncer à une sortie ?
              </label>
              <textarea
                id="b-blocker"
                className={clsx(inputBase, 'resize-y min-h-[96px] leading-[1.45]')}
                value={data.blocker}
                onChange={upd('blocker')}
                rows={3}
                placeholder="Vent qui tourne, météo incertaine, équipage hésitant…"
              />
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-[10px] bg-black/[0.18] border border-white/7 text-[13px] text-ss-fg/72 leading-relaxed cursor-pointer mb-[22px]">
              <input
                type="checkbox"
                className="mt-0.5 flex-none w-[18px] h-[18px] rounded-[5px] border border-white/14 appearance-none cursor-pointer bg-transparent checked:bg-ss-teal checked:border-ss-teal"
                checked={data.consent}
                onChange={(e) => set('consent', e.target.checked)}
              />
              <span>
                J&apos;accepte de participer à la beta fermée de SeaScope et de partager mes
                retours d&apos;usage. Mes données ne sont utilisées que pour le programme beta,
                sans cession à un tiers.
              </span>
            </label>

            {t && !isValid(data) && (
              <p className="font-mono text-[12px] text-ss-deconseille tracking-[0.06em] mb-4">
                Veuillez remplir tous les champs obligatoires et accepter les conditions.
              </p>
            )}

            <div className="flex items-center gap-3.5 flex-wrap">
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
            <div className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium m-0 mb-2">Ce qu&apos;on attend de vous</h4>
              <ul className="list-none m-0 p-0 mt-3.5 flex flex-col gap-3">
                {[
                  { n: '01', text: 'Tester en conditions réelles, avant chaque sortie.' },
                  { n: '02', text: 'Comparer la recommandation à la réalité observée.' },
                  { n: '03', text: 'Signaler quand SeaScope se trompe — et pourquoi.' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3 items-start text-[13px] text-ss-fg/72">
                    <span className="font-mono text-[11px] text-ss-teal tracking-[0.14em] mt-0.5">{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium m-0 mb-2">Canaux beta</h4>
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
            </div>
            <div className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium m-0 mb-2">Critères de sélection</h4>
              <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0 mt-2">
                Diversité de la zone, du bateau, de la pratique. Une session régulière
                sur l&apos;été 2026, et l&apos;envie d&apos;aider à construire un outil que vous utiliserez.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
