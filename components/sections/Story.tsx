import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'

export function Story() {
  return (
    <section
      id="story"
      className="py-16 md:py-[120px] bg-ss-bg-2"
    >
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Pourquoi SeaScope existe"
            heading={
              <>
                Un outil construit
                <br />
                par un plaisancier.
              </>
            }
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-start">
          {/* Citation */}
          <Reveal>
            <blockquote className="border-l-2 border-ss-teal pl-6 md:pl-8 m-0">
              <p className="text-[clamp(20px,2.2vw,32px)] leading-[1.35] tracking-[-0.015em] font-medium text-ss-fg text-pretty m-0">
                &ldquo;Je voulais juste savoir si je pouvais sortir en mer ce
                matin. Trois applis et vingt minutes plus tard, je n&apos;avais
                toujours pas de réponse.&rdquo;
              </p>
              <footer className="mt-5 text-[13px] text-ss-fg/45 not-italic">
                — Le fondateur, plaisancier depuis 4 ans
              </footer>
            </blockquote>
          </Reveal>

          {/* Narrative */}
          <Reveal delay={80}>
            <div className="flex flex-col gap-5 text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72">
              <p>
                Les données marines existent. Elles sont précises, souvent
                gratuites. Le problème, c&apos;est l&apos;interprétation : combiner vent,
                vagues, courant de marée et visibilité en une décision concrète
                demande de l&apos;expérience et du temps.
              </p>
              <p>
                SeaScope a été conçu pour combler cet écart — transformer des
                données complexes en une réponse simple. Pas un tableau de
                chiffres de plus, une décision : vous pouvez sortir, ou pas,
                et si oui, à quelle heure.
              </p>
              <p className="text-ss-fg/50 text-[13px]">
                Utilisé par plusieurs milliers de plaisanciers sur les côtes
                françaises, de la Bretagne à la Méditerranée.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
