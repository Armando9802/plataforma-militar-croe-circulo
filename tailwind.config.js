/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tenant: {
          primary: 'var(--color-primary)',
          'primary-dark': 'var(--color-primary-dark)',
          'primary-light': 'var(--color-primary-light)',
          accent: 'var(--color-accent)',
          'accent-light': 'var(--color-accent-light)',
          neutral: 'var(--color-neutral-dark)',
          subtle: 'var(--color-bg-subtle)',
        },
        croe: {
          primary: '#8B1E24',
          dark: '#6A1318',
          light: '#A82930',
          gold: '#D4AF37',
          champagne: '#F3E5AB',
          charcoal: '#1A1D20',
        },
        circulo: {
          primary: '#1B365D',
          dark: '#11233D',
          light: '#254B82',
          gold: '#C8A051',
          'gold-light': '#E8D5A7',
          midnight: '#0B1320',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};
