import clsx from 'clsx'
import { PhoneMock } from '@/components/ui/PhoneMock'

interface FeatureRowProps {
  title: string
  children: React.ReactNode
  image: {
    src: string
    alt: string
    priority?: boolean
  }
  reverse?: boolean
}

export function FeatureRow({ title, children, image, reverse = false }: FeatureRowProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-10 md:gap-16 lg:gap-20',
        'lg:flex-row lg:items-center',
        reverse && 'lg:flex-row-reverse'
      )}
    >
      {/* Text column */}
      <div className="flex-1 max-w-[520px]">
        <h3 className="text-[clamp(22px,2.4vw,36px)] leading-[1.1] tracking-[-0.02em] font-medium text-ss-fg mb-4">
          {title}
        </h3>
        <div className="text-[clamp(14px,1.1vw,17px)] leading-relaxed text-ss-fg/72 space-y-3">
          {children}
        </div>
      </div>

      {/* Phone column */}
      <div className="flex-none flex justify-center">
        <PhoneMock
          src={image.src}
          alt={image.alt}
          priority={image.priority}
          large
        />
      </div>
    </div>
  )
}
