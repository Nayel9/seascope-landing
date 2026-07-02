import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Callout } from '@/components/ui/Callout'
import { FeatureRow } from '@/components/ui/FeatureRow'
import { DeviceFrame } from '@/components/ui/DeviceFrame'

const guardianFeatures = [
  {
    icon: '👁️',
    title: 'Guardian Watch',
    desc: 'Surveillance continue de vos conditions de mouillage — vent, vague, affourchage — même en arrière-plan.',
  },
  {
    icon: '⚓',
    title: 'Verdict mouillage',
    desc: 'SeaScope évalue si votre zone de mouillage est sûre : profondeur, protection, risque de dragage.',
  },
  {
    icon: '🔔',
    title: 'Alertes intelligentes',
    desc: 'Notification immédiate si une variable dépasse votre seuil de sécurité personnalisé : vent, houle, marée.',
  },
  {
    icon: '🛡️',
    title: 'Surveillance d\'ancre',
    desc: 'Trace un périmètre autour de votre position. Alerte dès que le bateau sort du rayon défini.',
  },
]

const dataSources = [
  { label: 'Météo-France AROME' },
  { label: 'Open-Meteo' },
  { label: 'SHOM' },
]

export function Security() {
  return (
    <section
      id="security"
      className="py-16 md:py-[120px] overflow-hidden"
    >
      {/* Ambient glow — warmth/urgency hint */}
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
              {/* Halo */}
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
              {/* Callout badge */}
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
                <span
                  className="text-2xl leading-none select-none"
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
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

        {/* Second visual: settings-sources */}
        <Reveal delay={120}>
          <div className="mt-14 md:mt-20">
            <FeatureRow
              title="Configurez vos sources de données"
              image={{
                src: '/screens/settings-sources.webp',
                alt: 'Écran paramètres sources SeaScope — Météo-France AROME, Open-Meteo, SHOM',
              }}
              reverse
            >
              <p>
                Choisissez les sources météo que Guardian utilise pour vous
                alerter. Météo-France AROME pour la haute résolution côtière,
                Open-Meteo pour la couverture globale, SHOM pour les données
                de marée officielles.
              </p>
              <p>
                Guardian combine ces sources et vous présente le scénario le
                plus prudent — parce qu&apos;en mer, mieux vaut une alerte de trop
                qu&apos;une de trop peu.
              </p>
            </FeatureRow>
          </div>
        </Reveal>

        {/* Trust banner — data sources */}
        <Reveal delay={160}>
          <div
            className="mt-14 md:mt-20 rounded-ss-lg border border-ss-teal/20 px-6 py-5 md:px-10 md:py-7"
            style={{ background: 'rgba(94,234,212,0.04)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full bg-ss-teal flex-none shadow-[0_0_0_4px_rgba(94,234,212,0.15)]"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ss-teal">
                  Sources de données certifiées
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {dataSources.map((src, i) => (
                  <span
                    key={src.label}
                    className="flex items-center gap-4 text-[13px] text-ss-fg/72"
                  >
                    {src.label}
                    {i < dataSources.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="w-px h-3 bg-white/14 inline-block"
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
