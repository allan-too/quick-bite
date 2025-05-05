/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8f5',
          100: '#fff1eb',
          200: '#ffe4d8',
          300: '#ffc7ae',
          400: '#ff9a71',
          500: '#ff7a42',
          600: '#ff5a00', // Main primary
          700: '#cc4800',
          800: '#a63a00',
          900: '#7a2b00',
          950: '#451800',
        },
        secondary: {
          50: '#effffd',
          100: '#c8fffa',
          200: '#94fff5',
          300: '#4ff5ea',
          400: '#1ce0d5',
          500: '#00CCBC', // Main secondary
          600: '#00a296',
          700: '#00807a',
          800: '#006560',
          900: '#00504d',
          950: '#002e2c',
        },
        accent: {
          50: '#f2f9fd',
          100: '#e4f0fa',
          200: '#c4e1f4',
          300: '#91c9ec',
          400: '#57abe0',
          500: '#318ed0',
          600: '#2371b0',
          700: '#1d5a8e',
          800: '#1c4d76',
          900: '#1b4162',
          950: '#12283e',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f9fafb',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'header': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};