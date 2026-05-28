import clsx from 'clsx'
import type { DecisionLevel } from '@/types'

const pillClasses: Record<DecisionLevel, string> = {
  bon:         'text-ss-bon bg-ss-bon/10',
  variable:    'text-ss-variable bg-ss-variable/10',
  delicat:     'text-ss-delicat bg-ss-delicat/10',
  deconseille: 'text-ss-deconseille bg-ss-deconseille/10',
}

interface PillProps {
  kind: DecisionLevel
  children: React.ReactNode
  className?: string
}

export function Pill({ kind, children, className }: PillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 h-6 px-2.5 rounded-full font-mono text-[11px] font-semibold tracking-[0.08em] uppercase',
        pillClasses[kind],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
