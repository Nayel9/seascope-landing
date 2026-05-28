import clsx from 'clsx'

interface DeviceFrameProps {
  children: React.ReactNode
  large?: boolean
  rotate?: number
  className?: string
}

export function DeviceFrame({ children, large, rotate, className }: DeviceFrameProps) {
  return (
    <div
      className={clsx(
        'rounded-ss-2xl p-[10px] relative flex-none',
        large
          ? 'w-[220px] sm:w-[300px] lg:w-[380px]'
          : 'w-[200px] sm:w-[270px] lg:w-[340px]',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #1a2c44 0%, #0a1726 100%)',
        boxShadow:
          '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <div
        className="rounded-[36px] overflow-hidden bg-[#050E1A] relative"
        style={{ aspectRatio: '388 / 862' }}
      >
        {children}
      </div>
    </div>
  )
}
