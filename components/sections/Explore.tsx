import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DeviceFrame } from '@/components/ui/DeviceFrame'

const layers = [
  { label: 'Spots', icon: '📍' },
  { label: 'Balises', icon: '🔴' },
  { label: 'Vent', icon: '💨' },
  { label: 'Pluie', icon: '🌧️' },
  { label: 'Courants', icon: '🌊' },
  { label: 'Bathymétrie', icon: '📏' },
  { label: 'POI', icon: '⭐' },
]

export function Explore() {
  return (
    <section
      id="explore"
      className="relative py-16 md:py-[120px] overflow-hidden"
    >
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 30% 60%, rgba(94,234,212,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Explorer"
            heading={
              <>
                La carte marine
                <br />
                qui répond à tout.
              </>
            }
            lead="Spots, balises, courants, bathymétrie — toutes les couches d'information utile, superposées en un seul geste."
          />
        </Reveal>

        {/* Large map visual + layer pills */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">

          {/* Left: large phone mock */}
          <Reveal className="flex-none flex justify-center lg:justify-start">
            <div className="relative">
              {/* Halo behind phone */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-[1.4]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(94,234,212,0.10), transparent 80%)',
                }}
              />
              <DeviceFrame large className="lg:w-[420px]">
                <Image
                  src="/screens/map.webp"
                  alt="Carte SeaScope — spots, balises, courants, bathymétrie superposés"
                  fill
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 420px"
                  className="object-cover"
                  loading="lazy"
                />
              </DeviceFrame>
            </div>
          </Reveal>

          {/* Right: copy + layer chips */}
          <div className="flex-1 max-w-[560px] pt-0 lg:pt-10">
            <Reveal delay={80}>
              <h3 className="text-[clamp(22px,2.4vw,36px)] leading-[1.1] tracking-[-0.02em] font-medium text-ss-fg mb-5">
                Toutes les couches,
                <br />
                activées d&apos;un tap.
              </h3>
            </Reveal>

            <Reveal delay={120}>
              <p className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72 mb-8">
                La carte SeaScope rassemble en un seul endroit toutes les
                données dont vous avez besoin avant de larguer les amarres.
                Activez les couches qui vous intéressent — elles se combinent
                sans s&apos;encombrer.
              </p>
            </Reveal>

            {/* Layer pills */}
            <Reveal delay={160}>
              <div className="flex flex-wrap gap-2.5 mb-8">
                {layers.map((layer) => (
                  <span
                    key={layer.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-ss-teal/25 bg-ss-teal/8 text-ss-teal text-[13px] font-medium"
                  >
                    <span aria-hidden="true">{layer.icon}</span>
                    {layer.label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Feature list */}
            <Reveal delay={200}>
              <ul className="space-y-3.5 list-none p-0 m-0">
                {[
                  {
                    title: 'Spots de navigation',
                    desc: 'Repérez les zones adaptées à votre type de pratique, annotées par la communauté.',
                  },
                  {
                    title: 'Bathymétrie précise',
                    desc: 'Données de fond marin (EMODnet/LAT) pour anticiper les hauts-fonds et calculer votre marge sous la quille.',
                  },
                  {
                    title: 'Courants en temps réel',
                    desc: 'Direction et intensité des courants de surface superposés à votre route prévue.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3 items-start">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ss-teal flex-none" />
                    <div>
                      <span className="text-[14px] font-medium text-ss-fg leading-snug">
                        {item.title}&nbsp;&mdash;&nbsp;
                      </span>
                      <span className="text-[14px] text-ss-fg/60 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Bottom stat strip */}
        <Reveal delay={240}>
          <div className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/7 rounded-ss-lg overflow-hidden">
            {[
              { value: '7 couches', label: 'de données superposables' },
              { value: 'Temps réel', label: 'courants + vent sur la carte' },
              { value: 'Hors-ligne', label: 'carte IGN téléchargeable (Premium)' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-ss-bg p-6 md:p-8 text-center"
              >
                <div className="text-[22px] md:text-[26px] font-medium text-ss-teal tracking-[-0.02em] mb-1">
                  {stat.value}
                </div>
                <div className="text-[12px] md:text-[13px] text-ss-fg/50 leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
