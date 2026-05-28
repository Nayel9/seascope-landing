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

function isValid(d: FeedbackFormValues) {
  return isValidEmail(d.email) && !!d.fbtype && d.what.trim().length >= 10
}

const inputBase =
  'bg-black/[0.18] border border-white/7 rounded-[10px] px-3.5 py-3.5 text-[15px] text-ss-fg outline-none w-full placeholder:text-ss-fg/32 transition-[border-color,background] duration-150 hover:border-white/14 focus:border-ss-teal focus:bg-ss-teal/4'
const labelBase = 'font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50'

export function FeedbackForm() {
  const [data, setData]           = useState<FeedbackFormValues>(EMPTY)
  const [touched, setTouched]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName]   = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upd = (key: keyof FeedbackFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }))

  const set = (key: keyof FeedbackFormValues, val: string) =>
    setData((d) => ({ ...d, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setApiError('')
    if (!isValid(data)) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setApiError(json.error ?? 'Une erreur est survenue. Réessayez.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setApiError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setData(EMPTY)
    setTouched(false)
    setSubmitted(false)
    setFileName('')
    setApiError('')
  }

  if (submitted) {
    return (
      <section id="feedback-form" className="py-16 md:py-[120px]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 md:px-8">
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
    <section id="feedback-form" className="py-16 md:py-[120px]">
      <div className="max-w-landing mx-auto px-4 sm:px-6 md:px-8">
        <SectionHeader
          kicker="Bêta-testeurs"
          heading="Envoyez un retour terrain."
          lead="Une recommandation qui ne collait pas ? Un bug ? Ce formulaire va directement à l'équipe produit. Chaque retour est traité — pas archivé."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-[60px] items-start">
          <aside className="flex flex-col gap-5">
            <div className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium m-0">Ce qu&apos;on cherche à comprendre</h4>
              <ul className="list-none m-0 p-0 mt-3.5 flex flex-col gap-3">
                {[
                  { n: '01', text: 'Les cas où la recommandation et la réalité divergent.' },
                  { n: '02', text: 'Les données manquantes pour votre zone ou pratique.' },
                  { n: '03', text: "Les moments où l'interface vous a bloqué ou confus." },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3 items-start text-[13px] text-ss-fg/72">
                    <span className="font-mono text-[11px] text-ss-teal tracking-[0.14em] mt-0.5">{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-white/7 rounded-ss-lg p-[22px] bg-ss-surface/50">
              <h4 className="text-[14px] font-medium m-0 mb-2">Délai de traitement</h4>
              <p className="text-[13px] text-ss-fg/50 leading-relaxed m-0">
                Les retours &quot;recommandation incorrecte&quot; sont examinés sous 48h. Les bugs critiques sous 24h.
              </p>
            </div>
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
            className="bg-ss-surface border border-white/7 rounded-ss-xl p-5 sm:p-6 lg:p-10"
          >
            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-email" className={labelBase}>Votre email (testeur)</label>
              <input
                id="fb-email"
                type="email"
                className={clsx(inputBase, t && !isValidEmail(data.email) && 'border-ss-deconseille')}
                value={data.email}
                onChange={upd('email')}
                placeholder="camille@exemple.fr"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelBase}>Type de retour</span>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TYPES.map((v) => (
                  <Chip key={v} active={data.fbtype === v} onClick={() => set('fbtype', v)}>{v}</Chip>
                ))}
              </div>
              {t && !data.fbtype && <span className="font-mono text-[12px] text-ss-deconseille">Sélectionnez un type</span>}
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-spot" className={labelBase}>Spot concerné</label>
              <input
                id="fb-spot"
                className={inputBase}
                value={data.spot}
                onChange={upd('spot')}
                placeholder="Trévignon, Quiberon, port de départ…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-what" className={labelBase}>Que s&apos;est-il passé ?</label>
              <textarea
                id="fb-what"
                className={clsx(inputBase, 'resize-y min-h-[96px] leading-[1.45]', t && data.what.trim().length < 10 && 'border-ss-deconseille')}
                value={data.what}
                onChange={upd('what')}
                rows={4}
                placeholder="SeaScope m'a dit BON, mais une fois au large les conditions étaient…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <label htmlFor="fb-expected" className={labelBase}>Qu&apos;est-ce que vous attendiez ?</label>
              <textarea
                id="fb-expected"
                className={clsx(inputBase, 'resize-y min-h-[72px] leading-[1.45]')}
                value={data.expected}
                onChange={upd('expected')}
                rows={3}
                placeholder="J'aurais voulu que SeaScope me signale le changement avant le départ…"
              />
            </div>

            <div className="flex flex-col gap-2 mb-[22px]">
              <span className={labelBase}>Capture d&apos;écran (optionnel)</span>
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

            {t && !isValid(data) && (
              <p className="font-mono text-[12px] text-ss-deconseille tracking-[0.06em] mb-4">
                Veuillez renseigner votre email, le type de retour et décrire ce qui s&apos;est passé (min. 10 caractères).
              </p>
            )}

            <div className="flex items-center gap-3.5">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? 'Envoi en cours…' : 'Envoyer un retour'}
                {!isLoading && <ArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />}
              </Button>
            </div>
            {apiError && (
              <p className="font-mono text-[12px] text-ss-deconseille tracking-[0.06em] mt-2">{apiError}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
