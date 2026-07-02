import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'

const apps = [
  {
    icon: '🌬️',
    label: 'Appli météo',
    value: 'Vent 18 nœuds, rafales 26',
    note: 'Mais quelle houle ?',
  },
  {
    icon: '🗺️',
    label: 'Appli cartes',
    value: 'Carte marine navvable',
    note: 'Pas de météo ni de marée',
  },
  {
    icon: '🌊',
    label: 'Site des marées',
    value: 'Coefficient 82, PM 10h14',
    note: 'Courants non précisés',
  },
  {
    icon: '📡',
    label: 'Modèle houle',
    value: 'Hm0 1,2 m · Tp 7 s',
    note: 'Source différente, verdict différent',
  },
  {
    icon: '🧭',
    label: 'Météo au port',
    value: 'VHF : Bonne brise',
    note: 'Trop vague pour décider',
  },
]

export function Problem() {
  return (
    <section
      id="problem"
      className="py-16 md:py-[120px] bg-ss-bg-2 border-y border-white/7"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Le problème"
            heading={
              <>
                Fini de jongler
                <br />
                entre 5&nbsp;applis.
              </>
            }
            lead="Météo, cartes, marées, courants, sécurité — chaque source parle une langue différente. SeaScope centralise tout et tranche."
          />
        </Reveal>

        {/* Apps grid */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/7 rounded-ss-lg overflow-hidden mb-8 md:mb-14">
            {apps.map((app) => (
              <div
                key={app.label}
                className="bg-ss-bg flex flex-col gap-2.5 p-5 md:p-6"
              >
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {app.icon}
                </span>
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/40">
                  {app.label}
                </div>
                <div className="text-[15px] font-medium text-ss-fg leading-snug">
                  {app.value}
                </div>
                <div className="text-[12px] text-ss-fg/40 leading-snug mt-auto">
                  {app.note}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Resolution card */}
        <Reveal delay={100}>
          <div
            className="rounded-ss-lg border border-ss-teal/20 px-6 py-7 md:px-10 md:py-9 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(94,234,212,0.06) 0%, rgba(94,234,212,0.02) 100%)',
            }}
          >
            {/* Teal badge */}
            <div className="flex-none w-12 h-12 rounded-ss bg-ss-teal/12 border border-ss-teal/24 flex items-center justify-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-ss-teal"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>

            <div>
              <div className="text-[18px] md:text-[22px] font-medium text-ss-fg tracking-[-0.01em] leading-snug">
                SeaScope centralise toutes les sources et vous donne{' '}
                <span className="text-ss-teal">un seul verdict</span>.
              </div>
              <p className="mt-2 text-[14px] text-ss-fg/55 leading-relaxed max-w-[60ch]">
                Météo-France AROME, SHOM, Open-Meteo, données courants — une
                seule app, une seule réponse adaptée à votre profil.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
