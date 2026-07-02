import { Reveal } from '@/components/ui/Reveal'
import { Kicker } from '@/components/ui/Kicker'
import { PhoneMock } from '@/components/ui/PhoneMock'
import { StoreButton } from '@/components/ui/StoreButton'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 60% 20%, rgba(94,234,212,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="container-landing">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">

          {/* ── Copy column ── */}
          <div className="relative z-10 max-w-[580px]">
            <Reveal>
              <Kicker>Assistant de décision plaisance</Kicker>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 text-[clamp(36px,4.2vw,64px)] leading-[1.05] tracking-[-0.025em] font-medium text-balance">
                Puis-je sortir{' '}
                <span className="text-ss-teal">aujourd&apos;hui&nbsp;?</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 text-[clamp(15px,1.25vw,19px)] leading-relaxed text-ss-fg/72 text-pretty max-w-[52ch]">
                SeaScope analyse météo, vent, vagues, marées, courants et
                sécurité pour vous donner un verdict clair — en quelques secondes.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 md:mt-10">
                <StoreButton
                  store="googlePlay"
                  href="https://play.google.com/store/apps/details?id=fr.pennarstudio.seascope"
                />
              </div>
            </Reveal>

            <Reveal delay={320}>
              <ul className="mt-8 flex flex-col sm:flex-row flex-wrap gap-y-2 gap-x-6 text-[13px] text-ss-fg/50 list-none m-0 p-0">
                {[
                  'Un verdict, pas un tableau de chiffres',
                  'Créneaux idéaux calculés automatiquement',
                  'Gratuit pour toujours',
                ].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-ss-teal flex-none" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ── Phone column ── */}
          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Soft halo behind the phone */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-125"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(94,234,212,0.13), transparent 80%)',
                }}
              />
              <PhoneMock
                src="/screens/dashboard-decision.webp"
                alt="Tableau de bord SeaScope — verdict BON, fenêtre idéale calculée"
                priority
                large
              />
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
