import { Map, BookOpen, Ship, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'

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

export function Navigate() {
  return (
    <section
      id="navigate"
      className="py-16 md:py-[120px] bg-ss-bg-2 border-y border-white/7"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Naviguer"
            heading={
              <>
                Naviguez avec
                <br />
                toutes les cartes.
              </>
            }
            lead="IGN, AIS, journal de bord, mouillages réglementaires — tout ce qu'un plaisancier exigeant attend d'une appli de navigation."
          />
        </Reveal>

        {/* Main feature row */}
        <Reveal>
          <FeatureRow
            title="La carte de navigation complète"
            image={{
              src: '/screens/navigation.webp',
              alt: 'Écran navigation SeaScope — carte IGN + tracé de route + AIS',
            }}
            reverse
          >
            <p>
              Tracez votre route, suivez votre position et gardez un oeil sur
              le trafic maritime — tout en consultant les prévisions de vent
              et de courant sur votre chemin.
            </p>
            <p>
              La carte fonctionne hors-ligne une fois les tuiles téléchargées.
              Plus d&apos;inquiétude dans les zones sans réseau.
            </p>
          </FeatureRow>
        </Reveal>

        {/* Feature grid */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {navigateFeatures.map((feature) => (
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
