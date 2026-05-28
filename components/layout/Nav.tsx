import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/7 bg-ss-bg/72">
      <div className="max-w-landing mx-auto px-8 sm:px-5 flex items-center justify-between h-16">
        <Link href="/" className="font-sans font-semibold text-[20px] tracking-[-0.02em] inline-flex items-baseline gap-0">
          <span className="text-ss-teal">Sea</span>
          <span className="text-ss-fg/90">Scope</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {[
            { href: '#problem',  label: 'Problème' },
            { href: '#how',      label: 'Fonctionnement' },
            { href: '#perso',    label: 'Personnalisation' },
            { href: '#trust',    label: 'Confiance' },
            { href: '#beta',     label: 'Beta' },
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
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.16em] uppercase text-ss-fg/50 border border-white/7 rounded-full px-2.5 py-[5px]">
            Beta · 2026
          </span>
          <Button href="#beta" size="sm">Rejoindre</Button>
        </div>
      </div>
    </header>
  )
}
