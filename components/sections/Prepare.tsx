import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeatureRow } from '@/components/ui/FeatureRow'

const prepareItems = [
  {
    icon: '📅',
    title: "Aujourd'hui",
    desc: 'Score, verdict, fenêtres horaires et heure de retour pour la journée en cours.',
  },
  {
    icon: '📆',
    title: '7 jours',
    desc: 'Vue calendrier sur la semaine — identifiez d\'un coup d\'œil les bonnes journées.',
  },
  {
    icon: '🌤️',
    title: 'Météo détaillée',
    desc: 'Vent, rafales, vagues, houle, précipitations, visibilité — tout ce dont vous avez besoin.',
  },
  {
    icon: '🗓️',
    title: 'Planning de sortie',
    desc: 'Planifiez plusieurs sorties et comparez les conditions sur les jours à venir.',
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
            lead="Pas juste aujourd'hui — planifiez la semaine, choisissez le bon créneau et arrivez au départ en confiance."
          />
        </Reveal>

        {/* 7-day forecast row */}
        <Reveal>
          <FeatureRow
            title="7 jours de prévisions marines"
            image={{
              src: '/screens/forecast-7days.webp',
              alt: 'Écran prévisions 7 jours — calendrier hebdomadaire avec verdicts',
            }}
          >
            <p>
              Chaque jour de la semaine affiche son verdict, son score et
              ses créneaux idéaux. Choisissez la meilleure journée sans
              ouvrir une seule autre appli.
            </p>
            <p>
              Les jours déconseillés sont clairement signalés — finies les
              mauvaises surprises le matin du départ.
            </p>
          </FeatureRow>
        </Reveal>

        {/* Detailed weather row — reversed */}
        <Reveal delay={80}>
          <div className="mt-14 md:mt-20">
            <FeatureRow
              title="Météo marine détaillée"
              image={{
                src: '/screens/weather.webp',
                alt: 'Écran météo détaillée — vent, vagues, houle, précipitations',
              }}
              reverse
            >
              <p>
                Vent, rafales, direction de vague, houle, marée, courants,
                précipitations, visibilité — toutes les variables dans un seul
                écran, présentées de façon lisible.
              </p>
              <p>
                Les données sont issues de Météo-France AROME (modèle haute
                résolution) et d&apos;Open-Meteo, rafraîchies plusieurs fois par jour.
              </p>
            </FeatureRow>
          </div>
        </Reveal>

        {/* Feature cards */}
        <Reveal delay={120}>
          <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {prepareItems.map((item) => (
              <div
                key={item.title}
                className="bg-ss-bg p-6 md:p-7 flex flex-col gap-3"
              >
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {item.icon}
                </span>
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
