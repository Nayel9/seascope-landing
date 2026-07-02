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
                Une app née
                <br />
                d&apos;une frustration réelle.
              </>
            }
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-start">
          {/* Citation mise en avant */}
          <Reveal>
            <blockquote className="border-l-2 border-ss-teal pl-6 md:pl-8 m-0">
              <p className="text-[clamp(20px,2.2vw,32px)] leading-[1.35] tracking-[-0.015em] font-medium text-ss-fg text-pretty m-0">
                &ldquo;Je voulais juste savoir si je pouvais sortir en mer ce matin.
                Il m&apos;a fallu consulter trois applis et vingt minutes
                pour répondre à cette question simple.&rdquo;
              </p>
              <footer className="mt-5 text-[13px] text-ss-fg/45 not-italic">
                — Le fondateur de SeaScope, plaisancier depuis 4 ans
              </footer>
            </blockquote>
          </Reveal>

          {/* Récit */}
          <Reveal delay={80}>
            <div className="flex flex-col gap-5 text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72">
              <p>
                Quand j&apos;ai commencé la voile, je passais mes matinées à jongler
                entre Windy, une app de marées, le site du SHOM et les groupes
                Facebook de plaisanciers locaux — juste pour décider si la
                météo était acceptable.
              </p>
              <p>
                Ce n&apos;est pas un problème de données. Les données existent,
                elles sont gratuites ou peu coûteuses. Le problème, c&apos;est
                l&apos;interprétation. Combiner vent, vagues, courant de marée et
                visibilité en une décision claire demande de l&apos;expérience — et
                du temps que je n&apos;avais pas.
              </p>
              <p>
                SeaScope est la réponse à ce problème : transformer des données
                marines complexes en une décision simple. Pas un tableau de
                chiffres — une réponse. Et si la réponse est non, expliquer
                pourquoi et proposer un meilleur moment.
              </p>
              <p className="text-ss-fg/50 text-[13px]">
                Aujourd&apos;hui SeaScope est utilisé par plusieurs milliers de
                plaisanciers sur les côtes françaises, de la Bretagne à la
                Méditerranée. Nous continuons à construire l&apos;application
                que nous aurions voulu avoir dès le départ.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
