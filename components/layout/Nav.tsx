import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { StoreButton } from '@/components/ui/StoreButton'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/7 bg-ss-bg/72">
      <div className="container-landing flex items-center justify-between h-16">
        <Link href="/" className="flex-none">
          <Logo size={36} showWordmark wordmarkSize={20} />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {[
            { href: '#decide',  label: 'Décider' },
            { href: '#explore', label: 'Explorer' },
            { href: '#pricing', label: 'Tarifs' },
            { href: '#faq',     label: 'FAQ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] text-ss-fg/72 hover:text-ss-fg transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block transform scale-[0.82] origin-right">
            <StoreButton
              store="googlePlay"
              href="https://play.google.com/store/apps/details?id=fr.pennarstudio.seascope"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
