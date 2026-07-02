import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PricingCard } from '@/components/ui/PricingCard'
import { StoreButton } from '@/components/ui/StoreButton'
import { OFFERINGS } from '@/lib/pricing'

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-16 md:py-[120px] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 60%, rgba(94,234,212,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Tarifs"
            heading={
              <>
                Commencez gratuitement,
                <br />
                évoluez à votre rythme.
              </>
            }
            lead="Les fonctions de sécurité et de décision de base sont gratuites pour toujours. Passez à Premium pour débloquer l'analyse complète."
          />
        </Reveal>

        {/* Free tier callout */}
        <Reveal delay={60}>
          <div className="mb-8 md:mb-10 rounded-ss-lg border border-white/7 bg-ss-surface px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-ss-teal/10 inline-flex items-center justify-center text-ss-teal">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" aria-hidden="true">
                <path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm0 3.5v3.25m0 2h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <div>
              <span className="text-[14px] font-medium text-ss-fg">
                Gratuit, pour toujours
              </span>
              <span className="text-[13px] text-ss-fg/55 ml-2">
                — sécurité, météo de base, carte et journal inclus sans abonnement.
              </span>
            </div>
          </div>
        </Reveal>

        {/* Pricing cards */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <PricingCard offering={OFFERINGS.premium} />
            <PricingCard offering={OFFERINGS.premiumPlus} />
          </div>
        </Reveal>

        {/* Fine print */}
        <Reveal delay={160}>
          <p className="mt-6 text-center text-[12px] text-ss-fg/35 tracking-[0.01em]">
            Sans engagement · résiliable à tout moment depuis le Google Play Store
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={200}>
          <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <StoreButton
              store="googlePlay"
              href="https://play.google.com/store/apps/details?id=fr.pennarstudio.seascope"
            />
            <StoreButton store="appStore" disabled />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
