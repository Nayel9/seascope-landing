import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '40px',
        background: 'linear-gradient(145deg, #0E2236 0%, #061425 100%)',
      }}
    >
      <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
        {/* Outer ring */}
        <circle cx="100" cy="100" r="77" stroke="#5EEAD4" strokeWidth="2" opacity="0.25" />
        {/* Main ring */}
        <circle cx="100" cy="100" r="66" stroke="#5EEAD4" strokeWidth="4" opacity="0.85" />
        {/* Inner ring */}
        <circle cx="100" cy="100" r="54" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.18" />
        {/* Cardinal ticks */}
        <line x1="100" y1="26" x2="100" y2="38" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="162" x2="100" y2="174" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
        <line x1="26" y1="100" x2="38" y2="100" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
        <line x1="162" y1="100" x2="174" y2="100" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
        {/* Wave */}
        <path
          d="M28,100 C44,83 58,83 72,100 S96,117 110,100 S134,83 154,100 S170,86 178,92"
          stroke="#5EEAD4"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center */}
        <circle cx="100" cy="100" r="6" stroke="#5EEAD4" strokeWidth="2.5" opacity="0.4" />
        <circle cx="100" cy="100" r="3" fill="#5EEAD4" />
      </svg>
    </div>,
    { ...size },
  )
}
