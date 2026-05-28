import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ss-bg flex flex-col items-center justify-center gap-6 px-8 text-center">
      <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ss-teal">404</span>
      <h1 className="text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.02em] text-ss-fg">
        Page introuvable
      </h1>
      <Link
        href="/"
        className="font-mono text-[13px] text-ss-fg/50 hover:text-ss-fg transition-colors underline underline-offset-4"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
