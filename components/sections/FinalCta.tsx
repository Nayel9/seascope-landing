import { Reveal } from '@/components/ui/Reveal'
import { StoreButton } from '@/components/ui/StoreButton'

export function FinalCta() {
  return (
    <section
      id="final-cta"
      className="relative py-20 md:py-[140px] overflow-hidden"
    >
      {/* Background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(94,234,212,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="container-landing">
        <div className="flex flex-col items-center text-center gap-8 md:gap-10 max-w-[680px] mx-auto">

          <Reveal>
            <div className="flex items-center justify-center">
              <span className="w-px h-8 bg-ss-teal/30 mx-auto block" aria-hidden="true" />
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 className="text-[clamp(32px,4vw,60px)] leading-[1.06] tracking-[-0.025em] font-medium text-balance m-0">
              Prêt à décider en{' '}
              <span className="text-ss-teal">quelques secondes&nbsp;?</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-[clamp(15px,1.2vw,18px)] leading-relaxed text-ss-fg/65 text-pretty max-w-[50ch] m-0">
              Téléchargez SeaScope gratuitement. Vos premières décisions de
              sortie en mer vous attendent — sans inscription, sans abonnement
              requis.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <StoreButton
                store="googlePlay"
                href="https://play.google.com/store/apps/details?id=fr.pennarstudio.seascope"
              />
              <StoreButton store="appStore" disabled />
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="text-[12px] text-ss-fg/30 m-0">
              Gratuit pour toujours · Sans engagement · Android uniquement pour l&apos;instant
            </p>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
