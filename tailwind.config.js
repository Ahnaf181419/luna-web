/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          black: '#0a0a0c',
        },
        panel: {
          bg: '#111114',
          surface: '#18181b',
          border: '#27272a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      width: {
        'drawer-left': '320px',
        'drawer-right': '380px',
      },
    },
  },
  plugins: [],
}
