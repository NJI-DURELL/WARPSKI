/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070809',
          900: '#0c0e10',
          800: '#14181b',
          700: '#1d2226',
          600: '#2a3136',
        },
        flame: {
          DEFAULT: '#ff5a1f',
          400: '#ff7a44',
          500: '#ff5a1f',
          600: '#e84709',
        },
        mist: {
          DEFAULT: '#dfe6ea',
          muted: '#9aa6ad',
        },
      },
      fontFamily: {
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
