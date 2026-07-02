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
