import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-white/7 pt-14 pb-10">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 items-start">
          <div>
            <Logo size={40} showWordmark wordmarkSize={22} />
            <p className="mt-4 text-[13px] text-ss-fg/50 max-w-[36ch] leading-relaxed">
              Copilote météo décisionnel pour navigation côtière.
              <br />Conçu pour la décision, pas pour la décoration.
            </p>
            <p className="mt-4">
              <a
                href="mailto:seascope-contact@pennarstudio.fr"
                className="font-mono text-[12px] tracking-[0.06em] text-ss-teal"
              >
                seascope-contact@pennarstudio.fr
              </a>
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50 mb-3.5 font-medium">
              Produit
            </h5>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {[
                { href: '#how',   label: 'Comment ça marche' },
                { href: '#perso', label: 'Personnalisation' },
                { href: '#trust', label: 'Confiance' },
                { href: '#faq',   label: 'FAQ' },
                { href: '#beta',  label: 'Beta fermée' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.14em] uppercase text-ss-fg/50 mb-3.5 font-medium">
              Programme beta
            </h5>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {[
                { href: '#beta',          label: 'Candidater' },
                { href: '#feedback-form', label: 'Envoyer un retour' },
                { href: 'mailto:seascope-contact@pennarstudio.fr', label: 'seascope-contact@pennarstudio.fr' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/7 flex items-center justify-between font-mono text-[11px] tracking-[0.06em] text-ss-fg/50">
          <span>© 2026 SeaScope · Tous droits réservés</span>
          <span>Beta privée · Été 2026</span>
        </div>
      </div>
    </footer>
  )
}
