import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/7 pt-14 pb-10">
      <div className="max-w-landing mx-auto px-8 sm:px-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 items-start">
          <div>
            <span className="font-sans font-semibold text-[22px] tracking-[-0.02em] inline-flex items-baseline">
              <span className="text-ss-teal">Sea</span>
              <span className="text-ss-fg/90">Scope</span>
            </span>
            <p className="mt-3 text-[13px] text-ss-fg/50 max-w-[36ch] leading-relaxed">
              Copilote météo décisionnel pour navigation côtière.
              <br />Conçu pour la décision, pas pour la décoration.
            </p>
            <p className="mt-4">
              <a
                href="mailto:beta@seascope.app"
                className="font-mono text-[12px] tracking-[0.06em] text-ss-teal"
              >
                beta@seascope.app
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
                { href: 'mailto:beta@seascope.app', label: 'beta@seascope.app' },
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
