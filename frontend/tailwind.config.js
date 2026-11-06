/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F243E',
          800: '#17365D', // Primary Navy
          700: '#1E4675',
          600: '#245B87', // Secondary Blue
        },
        saffron: {
          500: '#D9952B', // Saffron Accent
          600: '#B87919',
          100: '#FDF6E9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F5F7FA',  // Main Background
          subtle: '#F0F3F7',
        },
        border: {
          DEFAULT: '#E1E6EC',
          dark: '#CAD3DD',
        },
        txt: {
          primary: '#273444',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          approved: '#237A46',
          'approved-bg': '#E8F5EC',
          pending: '#A66A0A',
          'pending-bg': '#FFF4DD',
          rejected: '#B42332',
          'rejected-bg': '#FCEBEC',
          review: '#245B87',
          'review-bg': '#EAF2FA',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '10px',
      }
    },
  },
  plugins: [],
}

