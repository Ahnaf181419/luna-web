/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0c0c0e', // Warm graphite black
          900: '#131316', // Primary card surface
          850: '#18181d', // Secondary surface
          800: '#212128', // Elevated surface & borders
          750: '#2a2a34', // Muted borders
        },
        solar: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b', // Primary Apollo solar gold
          600: '#d97706',
          700: '#b45309',
        },
        lunar: {
          gold: '#f59e0b',
          bronze: '#b45309',
          silver: '#94a3b8',
          emerald: '#10b981',
          graphite: '#18181d',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
