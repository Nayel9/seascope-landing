import Image from 'next/image'
import { DeviceFrame } from '@/components/ui/DeviceFrame'

interface PhoneMockProps {
  src: string
  alt: string
  priority?: boolean
  large?: boolean
  className?: string
}

export function PhoneMock({ src, alt, priority = false, large, className }: PhoneMockProps) {
  return (
    <DeviceFrame large={large} className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={large ? '(max-width: 640px) 220px, (max-width: 1024px) 300px, 380px'
                     : '(max-width: 640px) 200px, (max-width: 1024px) 270px, 340px'}
        className="object-cover"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
      />
    </DeviceFrame>
  )
}
