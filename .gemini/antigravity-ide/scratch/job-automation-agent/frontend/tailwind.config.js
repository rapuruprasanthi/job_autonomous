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
        bg: {
          DEFAULT: '#0B0F14',
          surface: '#121821',
          elevated: '#1A2230',
        },
        border: {
          DEFAULT: '#263043',
          light: '#334155',
        },
        txt: {
          DEFAULT: '#E6EAF2',
          muted: '#8B95A7',
        },
        brand: {
          violet: '#8B5CF6',
          cyan: '#22D3EE',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#F87171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'glow-violet': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.3)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      }
    },
  },
  plugins: [],
}
