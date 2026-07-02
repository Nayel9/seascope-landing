import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Accordion } from '@/components/ui/Accordion'
import { FAQ_ITEMS } from '@/lib/faq'

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-[120px]">
      <div className="container-landing">
        <Reveal>
          <SectionHeader
            kicker="Questions fréquentes"
            heading={
              <>
                Ce qu&apos;on nous demande
                <br />
                le plus souvent.
              </>
            }
            lead="Tout ce que vous voulez savoir avant de télécharger SeaScope. Une question manque ? Écrivez-nous."
          />
        </Reveal>

        <Reveal delay={80}>
          <Accordion items={FAQ_ITEMS} />
        </Reveal>
      </div>
    </section>
  )
}
