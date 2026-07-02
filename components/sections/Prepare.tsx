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
