import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ComparisonTable } from '@/components/ui/ComparisonTable'

export function Comparison() {
  return (
    <section
      id="comparison"
      className="py-16 md:py-[120px] bg-ss-bg-2"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Comparatif"
            heading={
              <>
                Ce que vous avez
                <br />
                selon votre formule.
              </>
            }
            lead="SeaScope est gratuit pour les fonctions essentielles de sécurité et de décision. Les formules Premium débloquent l'analyse avancée, le planning et la surveillance Guardian."
          />
        </Reveal>

        <Reveal delay={80}>
          <ComparisonTable />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-6 text-center text-[13px] text-ss-fg/40">
            Les fonctionnalités marquées{' '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-ss-variable/10 text-ss-variable text-[9px] font-mono font-semibold tracking-[0.08em] uppercase">
                Bientôt
              </span>
            </span>{' '}
            sont en cours de développement et seront disponibles prochainement.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
