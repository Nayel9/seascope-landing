import Link from 'next/link'
import clsx from 'clsx'

type Variant = 'default' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  default: 'bg-ss-teal border-transparent text-[#052a26] hover:bg-[#79f0db] hover:-translate-y-px active:translate-y-0',
  ghost:   'bg-transparent border-white/14 text-ss-fg hover:bg-white/4 hover:border-white/25',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-12 px-[22px] text-[15px] tracking-[-0.005em]',
  lg: 'h-14 px-7 text-base tracking-[-0.005em]',
}

const baseClasses =
  'group inline-flex items-center justify-center gap-2.5 rounded-full border font-medium cursor-pointer whitespace-nowrap transition-[transform,background-color,border-color,color] duration-150 select-none'

type BaseProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type AsButton = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink   = BaseProps & { href: string; onClick?: undefined; type?: undefined; disabled?: undefined }

export type ButtonProps = AsButton | AsLink

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)

  if (href !== undefined) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
