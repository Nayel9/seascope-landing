import clsx from 'clsx'

interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3.5 py-2 rounded-full border text-[13px] cursor-pointer transition-[border-color,background-color,color] duration-150',
        active
          ? 'border-ss-teal bg-ss-teal/10 text-ss-teal'
          : 'border-white/7 bg-white/[0.03] text-ss-fg/72 hover:border-white/14 hover:text-ss-fg',
        className
      )}
    >
      {children}
    </button>
  )
}
