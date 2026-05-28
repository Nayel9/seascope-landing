import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ss-bg':          '#061425',
        'ss-bg-2':        '#081A2D',
        'ss-surface':     '#0E2236',
        'ss-surface-2':   '#14293F',
        'ss-surface-hi':  '#1B334C',
        'ss-fg':          '#E6EEF6',
        'ss-teal':        '#5EEAD4',
        'ss-teal-ink':    '#2DD4BF',
        'ss-teal-deep':   '#0E4D49',
        'ss-bon':         '#34D399',
        'ss-bon-ink':     '#6EE7B7',
        'ss-variable':    '#FBBF24',
        'ss-delicat':     '#F59E0B',
        'ss-deconseille': '#EF4444',
        'ss-rentrer':     '#FF6B6B',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      maxWidth: {
        landing: '1240px',
      },
      borderRadius: {
        ss:      '12px',
        'ss-lg': '20px',
        'ss-xl': '28px',
        'ss-2xl': '44px',
      },
      opacity: {
        '4':  '0.04',
        '7':  '0.07',
        '14': '0.14',
        '18': '0.18',
        '32': '0.32',
        '72': '0.72',
      },
    },
  },
  plugins: [],
}

export default config
