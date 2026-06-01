import Image from 'next/image'
import { Kicker } from '@/components/ui/Kicker'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { DeviceFrame } from '@/components/ui/DeviceFrame'
import { Callout } from '@/components/ui/Callout'
import { ArrowRight } from '@/components/ui/icons'

export function Hero() {
  return (
    <section className="pt-8 pb-12 md:pt-20 md:pb-24 relative overflow-hidden">
      <div className="max-w-landing mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-20 items-center lg:items-start lg:pt-6">

          {/* Copy */}
          <div className="relative z-10">
            <Reveal>
              <div className="flex items-center gap-3 mb-5">
                <Kicker>Beta fermée · Été 2026</Kicker>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[clamp(34px,3.6vw,48px)] leading-[1.08] tracking-[-0.022em] font-medium m-0 text-balance">
                Décidez quand sortir.
                <br />
                Sachez quand rentrer.
                <br />
                <span className="text-ss-teal">Sans interpréter la météo.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-4 md:mt-[22px] text-[clamp(15px,1.25vw,19px)] leading-[1.6] text-ss-fg/72 max-w-[60ch] text-pretty">
                SeaScope transforme les conditions marines en recommandations
                concrètes, adaptées à votre façon de naviguer : la meilleure
                fenêtre, l&apos;heure de retour, et le niveau de confiance.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex gap-3 mt-7 md:mt-9 flex-wrap">
                <Button href="#beta" size="lg">
                  Rejoindre la beta
                  <ArrowRight className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Button>
                <Button href="#how" variant="ghost" size="lg">
                  Voir comment ça marche
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-7 md:mt-9 flex flex-wrap gap-3 sm:gap-6 items-center text-[13px] text-ss-fg/50">
                {[
                  'Une réponse, pas un tableau de chiffres',
                  'Recommandations explicables',
                  'Stockage local uniquement',
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-ss-teal flex-none" />
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Device stage */}
          <div className="relative flex justify-center items-center min-h-0 lg:min-h-[720px] mt-4 lg:mt-0">
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-10% -20%',
                background: 'radial-gradient(closest-side, rgba(94,234,212,0.10), transparent 70%)',
              }}
            />
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
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 380px"
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
              text="Mer maniable, vent stable — rien ne dépasse vos limites."
              style={{ left: -40, bottom: 120 }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
