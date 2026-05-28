interface KickerProps {
  children: React.ReactNode
  className?: string
}

export function Kicker({ children, className }: KickerProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ss-teal ${className ?? ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-ss-teal shadow-[0_0_0_4px_rgba(94,234,212,0.15)]" />
      {children}
    </span>
  )
}
