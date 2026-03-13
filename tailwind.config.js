/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base surfaces — deep navy like real EMS/NMS software
        surface: {
          900: '#060c1a',  // page background
          800: '#0a1120',  // sidebar
          700: '#0f1a2e',  // panels
          600: '#162038',  // elevated cards
          500: '#1e2d4a',  // hover states / borders
        },
        // Primary accent — cyan, readable on dark, feels technical
        cyan: {
          DEFAULT: '#00c8e8',
          dim:     '#008ca0',
          bright:  '#33d6f0',
        },
        // Status colours
        status: {
          up:      '#22d3a0',  // green-teal
          ranging: '#f59e0b',  // amber — ONU in ranging state
          down:    '#ef4444',  // red
          warn:    '#fb923c',  // orange
        },
        // Signal level colours (dBm bargraph gradient stops)
        signal: {
          good:    '#22d3a0',
          ok:      '#84cc16',
          low:     '#f59e0b',
          crit:    '#ef4444',
        }
      },
      fontFamily: {
        // UI text — readable, slightly technical
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        // Data readouts — monospace for numbers, addresses, identifiers
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-in':     'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateY(6px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      }
    }
  },
  plugins: []
}
