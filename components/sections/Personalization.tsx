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

const cardBorderColor: Record<string, string> = {
  bon:         'border-ss-bon/30',
  delicat:     'border-ss-delicat/30',
  deconseille: 'border-ss-deconseille/30',
  variable:    'border-ss-variable/30',
}

const swatchColor: Record<string, string> = {
  bon:         '#34D399',
  delicat:     '#F59E0B',
  deconseille: '#EF4444',
  variable:    '#FBBF24',
}

export function Personalization() {
  const [activePersona, setActivePersona] = useState<PersonaId>('famille')
  const [activeTol, setActiveTol] = useState<ToleranceId>('vivante')

  const personaName = PERSONAS.find((p) => p.id === activePersona)?.name ?? ''

  return (
    <section id="perso" className="py-16 md:py-[120px]">
      <div className="max-w-landing mx-auto px-4 sm:px-6 md:px-8">
        <Reveal>
          <SectionHeader
            kicker="Personnalisation"
            heading={<>SeaScope s&apos;adapte à votre<br />façon de naviguer.</>}
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
            02 — Votre sortie idéale, c&apos;est quoi ?
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
        <div className="mt-10 lg:mt-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[60px] items-center">
          <div className="relative min-h-0 lg:min-h-[720px] flex justify-center items-center">
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
                    cardBorderColor[card.kind],
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
                    <span className="w-2 h-2 rounded-[2px]" style={{ background: swatchColor[card.kind] }} />
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
