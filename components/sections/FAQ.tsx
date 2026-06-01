import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Plus } from '@/components/ui/icons'

const faqs = [
  {
    q: 'C’est encore une app météo ?',
    a: 'Non. La météo est la matière première ; SeaScope produit la décision. Là où une app affiche des chiffres, SeaScope dit sortir ou non, quelle fenêtre, et quand rentrer.',
  },
  {
    q: 'Faut-il être un navigateur expérimenté ?',
    a: 'Non. SeaScope traduit la donnée pour vous, selon vos limites. C’est même conçu pour les jours où on doute.',
  },
  {
    q: 'Mes données sont-elles dans le cloud ?',
    a: 'Non. Vos spots, vos préférences et vos sorties restent sur votre appareil. Pas de profil cloud, pas de revente.',
  },
  {
    q: 'C’est disponible sur iPhone ?',
    a: 'Android d’abord pour la beta. La version iOS arrive prochainement.',
  },
  {
    q: 'Combien ça coûte ?',
    a: 'La beta fermée est gratuite. Les testeurs gardent un avantage à la sortie.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-[120px]">
      <div className="max-w-landing mx-auto px-4 sm:px-6 md:px-8">
        <Reveal>
          <SectionHeader
            kicker="Questions fréquentes"
            heading={<>Ce qu&apos;on nous demande<br />le plus souvent.</>}
            lead="Les objections les plus courantes avant de rejoindre la beta. Si la vôtre n'y est pas, écrivez-nous."
          />
        </Reveal>

        <Reveal>
          <div className="rounded-ss-lg overflow-hidden border border-white/7 divide-y divide-white/7">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group bg-ss-bg">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-7 [&::-webkit-details-marker]:hidden">
                  <span className="text-[16px] md:text-[18px] font-medium tracking-[-0.005em] text-ss-fg">
                    {q}
                  </span>
                  <span className="w-8 h-8 rounded-[10px] bg-ss-teal/[0.08] inline-flex items-center justify-center text-ss-teal flex-none transition-transform duration-200 group-open:rotate-45">
                    <Plus size={18} />
                  </span>
                </summary>
                <p className="text-[14px] md:text-[15px] text-ss-fg/50 leading-[1.6] px-5 md:px-7 pb-5 md:pb-7 -mt-1 max-w-[68ch]">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
