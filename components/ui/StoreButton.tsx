import Link from 'next/link'
import clsx from 'clsx'

interface StoreButtonProps {
  store: 'googlePlay' | 'appStore'
  href?: string
  disabled?: boolean
}

function GooglePlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="w-6 h-6 flex-none"
      fill="none"
    >
      <path
        d="M3.18 1.76a1.5 1.5 0 0 0-.68 1.27v17.94c0 .53.28 1 .7 1.27l.07.05 10.05-10.05v-.24L3.25 1.71l-.07.05Z"
        fill="url(#gp-a)"
      />
      <path
        d="M16.65 15.63 13.32 12.3v-.24l3.34-3.34.07.04 3.96 2.25c1.13.64 1.13 1.69 0 2.33l-3.96 2.25-.08.04Z"
        fill="url(#gp-b)"
      />
      <path
        d="m16.72 15.59-3.4-3.4-10.14 10.14c.37.4.98.44 1.66.05l11.88-6.79Z"
        fill="url(#gp-c)"
      />
      <path
        d="M16.72 8.41 4.84 1.62C4.16 1.22 3.55 1.27 3.18 1.67l10.14 10.13 3.4-3.39Z"
        fill="url(#gp-d)"
      />
      <defs>
        <linearGradient id="gp-a" x1="12.52" y1="2.84" x2="-1.86" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A0FF"/>
          <stop offset="1" stopColor="#00A0FF" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="gp-b" x1="22.01" y1="12" x2="12.49" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE000"/>
          <stop offset=".41" stopColor="#FFBD00"/>
          <stop offset=".78" stopColor="#FFA500"/>
          <stop offset="1" stopColor="#FF6B00"/>
        </linearGradient>
        <linearGradient id="gp-c" x1="14.65" y1="13.82" x2="-1.56" y2="30.94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF3A44"/>
          <stop offset="1" stopColor="#C31162"/>
        </linearGradient>
        <linearGradient id="gp-d" x1="1.07" y1="-4.65" x2="8.59" y2="2.72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#32A071"/>
          <stop offset=".07" stopColor="#2DA771"/>
          <stop offset=".48" stopColor="#15CF74"/>
          <stop offset=".8" stopColor="#06E775"/>
          <stop offset="1" stopColor="#00F076"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="w-5 h-5 flex-none"
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

export function StoreButton({ store, href, disabled }: StoreButtonProps) {
  const isAppStore = store === 'appStore'
  const isDisabled = disabled ?? isAppStore

  const inner = (
    <>
      {isAppStore ? (
        <AppleIcon />
      ) : (
        <GooglePlayIcon />
      )}
      <div className="flex flex-col items-start leading-tight">
        <span className={clsx(
          'text-[10px] tracking-[0.06em] uppercase',
          isDisabled ? 'text-ss-fg/32' : 'text-[#052a26]/72'
        )}>
          {isDisabled ? 'Bientôt sur' : 'Disponible sur'}
        </span>
        <span className={clsx(
          'text-[15px] font-semibold tracking-[-0.01em]',
          isDisabled ? 'text-ss-fg/32' : 'text-[#052a26]'
        )}>
          {isAppStore ? 'iOS / App Store' : 'Google Play'}
        </span>
      </div>
    </>
  )

  const baseClasses = clsx(
    'inline-flex items-center gap-3 h-14 px-5 rounded-ss-lg border font-medium',
    'transition-[transform,background-color,border-color,opacity] duration-150 select-none whitespace-nowrap',
    isDisabled
      ? 'bg-ss-surface border-white/7 text-ss-fg/32 cursor-not-allowed'
      : 'bg-ss-teal border-transparent cursor-pointer hover:bg-[#79f0db] hover:-translate-y-px active:translate-y-0'
  )

  if (!isDisabled && href) {
    return (
      <Link href={href} className={baseClasses} aria-label={isAppStore ? 'Bientôt sur iOS' : 'Télécharger sur Google Play'}>
        {inner}
      </Link>
    )
  }

  return (
    <div
      className={baseClasses}
      aria-disabled="true"
      role="button"
      aria-label={isDisabled ? 'Bientôt sur iOS' : undefined}
    >
      {inner}
    </div>
  )
}
