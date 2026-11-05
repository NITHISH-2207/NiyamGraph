/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'var(--color-brand-navy)',
          'navy-dark': 'var(--color-brand-navy-dark)',
          'navy-deep': 'var(--color-brand-navy-deep)',
          blue: 'var(--color-brand-blue)',
          'blue-hover': 'var(--color-brand-blue-hover)',
          gold: 'var(--color-brand-gold)',
          'gold-light': 'var(--color-brand-gold-light)',
          bg: 'var(--color-brand-bg)',
          surface: 'var(--color-brand-surface)',
          secondary: 'var(--color-brand-secondary)',
          border: 'var(--color-brand-border)',
          'border-subtle': 'var(--color-brand-border-subtle)',
          success: 'var(--color-brand-success)',
          warning: 'var(--color-brand-warning)',
          error: 'var(--color-brand-error)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

