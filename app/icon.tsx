import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
        background: 'linear-gradient(145deg, #0E2236 0%, #061425 100%)',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 200 200" fill="none">
        {/* Main ring */}
        <circle cx="100" cy="100" r="66" stroke="#5EEAD4" strokeWidth="9" opacity="0.85" />
        {/* Wave */}
        <path
          d="M26,100 C44,82 58,82 72,100 S96,118 110,100 S134,82 156,100 S172,86 178,92"
          stroke="#5EEAD4"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center dot */}
        <circle cx="100" cy="100" r="9" fill="#5EEAD4" />
      </svg>
    </div>,
    { ...size },
  )
}
