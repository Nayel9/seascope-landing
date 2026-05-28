import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number) {
  return {
    viewBox: '0 0 24 24' as const,
    width: size,
    height: size,
    fill: 'none' as const,
    stroke: 'currentColor' as const,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

export const Wind = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 8h10a3 3 0 1 0-3-3" />
    <path d="M3 12h15a3 3 0 1 1-3 3" />
    <path d="M3 16h8" />
  </svg>
)

export const Waves = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2 9c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
    <path d="M2 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
  </svg>
)

export const Bolt = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
  </svg>
)

export const Anchor = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v14" />
    <path d="M5 13a7 7 0 0 0 14 0" />
    <path d="M8 11H5M16 11h3" />
  </svg>
)

export const Users = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="16" cy="9" r="2" />
    <path d="M3 19c0-3 2.5-5 5-5s5 2 5 5" />
    <path d="M13 18c.5-2 2-3.5 3-3.5s2.5 1 3 3" />
  </svg>
)

export const Clock = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const Fish = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 12c3-5 8-6 12-6 3 0 6 2 6 6s-3 6-6 6c-4 0-9-1-12-6Z" />
    <path d="m3 12 4-3v6z" />
    <circle cx="16" cy="11" r=".6" fill="currentColor" />
  </svg>
)

export const Sail = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v15" />
    <path d="M12 5c4 2 7 7 7 12H5c0-5 3-10 7-12Z" />
    <path d="M3 21h18" />
  </svg>
)

export const MapPin = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

export const Layers = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3 2 8l10 5 10-5z" />
    <path d="M2 13l10 5 10-5" />
    <path d="M2 18l10 5 10-5" />
  </svg>
)

export const Lock = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export const Eye = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Cpu = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
)

export const Compass = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-2 5-5 2 2-5z" />
  </svg>
)

export const Check = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

export const ArrowRight = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const Bell = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
)

export const Image = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)
