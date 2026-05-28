import { Kicker } from '@/components/ui/Kicker'

interface SectionHeaderProps {
  kicker: string
  heading: React.ReactNode
  lead?: React.ReactNode
  className?: string
}

export function SectionHeader({ kicker, heading, lead, className }: SectionHeaderProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end mb-[60px] ${className ?? ''}`}
    >
      <div>
        <div className="flex items-center gap-3 mb-[22px]">
          <Kicker>{kicker}</Kicker>
        </div>
        <h2 className="text-[clamp(30px,3.4vw,50px)] leading-[1.08] tracking-[-0.02em] font-medium m-0 text-balance">
          {heading}
        </h2>
      </div>
      {lead && (
        <p className="text-[clamp(16px,1.25vw,19px)] leading-relaxed text-ss-fg/72 max-w-[60ch] m-0 text-pretty">
          {lead}
        </p>
      )}
    </div>
  )
}
