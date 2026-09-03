import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-white/7 pt-14 pb-10">
      <div className="container-landing">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 items-start">
          <div>
            <Logo size={40} showWordmark wordmarkSize={22} />
            <p className="mt-4 text-[13px] text-ss-fg/50 max-w-[36ch] leading-relaxed">
              Copilote décisionnel pour la navigation côtière.
              <br />Conçu pour décider, pas pour scroller.
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
                { href: '#decide',  label: 'Décider' },
                { href: '#explore', label: 'Explorer' },
                { href: '#pricing', label: 'Tarifs' },
                { href: '#faq',     label: 'FAQ' },
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
              Légal
            </h5>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              <li>
                <Link href="/privacy" className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/suppression-compte" className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors">
                  Suppression de compte
                </Link>
              </li>
              <li>
                <a
                  href="mailto:seascope-contact@pennarstudio.fr"
                  className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors"
                >
                  seascope-contact@pennarstudio.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/7 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.06em] text-ss-fg/50">
          <span className="flex items-center gap-x-4 gap-y-2 flex-wrap">
            <span>© 2026 SeaScope · Tous droits réservés</span>
            <Link href="/privacy" className="hover:text-ss-fg transition-colors">
              Confidentialité
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
