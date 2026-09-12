/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dolly: {
          dark: '#08090d',
          card: '#12141c',
          border: '#1f2433',
          accent: '#6366f1',
          cyan: '#06b6d4',
          pink: '#ec4899',
          glow: 'rgba(99, 102, 241, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 35px rgba(236, 72, 153, 0.6))' },
        }
      }
    },
  },
  plugins: [],
}
