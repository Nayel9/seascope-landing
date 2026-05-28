interface LogoProps {
  size?: number
  className?: string
  showWordmark?: boolean
  wordmarkSize?: number
}

export function Logo({ size = 40, className, showWordmark = false, wordmarkSize = 20 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ss-bg-grad" cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="#0E2236" />
            <stop offset="100%" stopColor="#061425" />
          </radialGradient>
          <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
          </radialGradient>
          <filter id="ss-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="200" height="200" rx="44" ry="44" fill="url(#ss-bg-grad)" />
        <rect width="200" height="200" rx="44" ry="44" fill="url(#ss-glow)" />

        {/* Outer decorative ring */}
        <circle cx="100" cy="100" r="77" stroke="#5EEAD4" strokeWidth="0.75" opacity="0.22" />

        {/* Main ring */}
        <circle cx="100" cy="100" r="66" stroke="#5EEAD4" strokeWidth="2" opacity="0.80" />

        {/* Inner ring */}
        <circle cx="100" cy="100" r="54" stroke="#5EEAD4" strokeWidth="0.75" opacity="0.18" />

        {/* Cardinal ticks — N S E W */}
        <line x1="100" y1="26" x2="100" y2="38" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="162" x2="100" y2="174" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="100" x2="38" y2="100" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />
        <line x1="162" y1="100" x2="174" y2="100" stroke="#5EEAD4" strokeWidth="2" strokeLinecap="round" />

        {/* Diagonal ticks (NE NW SE SW) — lighter */}
        <line x1="152" y1="48" x2="144" y2="56" stroke="#5EEAD4" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        <line x1="48" y1="48" x2="56" y2="56" stroke="#5EEAD4" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        <line x1="152" y1="152" x2="144" y2="144" stroke="#5EEAD4" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        <line x1="48" y1="152" x2="56" y2="144" stroke="#5EEAD4" strokeWidth="1" strokeLinecap="round" opacity="0.35" />

        {/* Wave / sea horizon — main identity mark */}
        <path
          d="M28,100 C44,83 58,83 72,100 S96,117 110,100 S134,83 154,100 S170,86 178,92"
          stroke="#5EEAD4"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          filter="url(#ss-blur)"
        />

        {/* Center point */}
        <circle cx="100" cy="100" r="5.5" stroke="#5EEAD4" strokeWidth="1.2" opacity="0.35" />
        <circle cx="100" cy="100" r="2.5" fill="#5EEAD4" filter="url(#ss-blur)" />
      </svg>

      {showWordmark && (
        <span
          className="font-sans font-semibold tracking-[-0.02em] inline-flex items-baseline"
          style={{ fontSize: wordmarkSize }}
        >
          <span className="text-ss-teal">Sea</span>
          <span className="text-ss-fg" style={{ opacity: 0.92 }}>Scope</span>
        </span>
      )}
    </span>
  )
}
