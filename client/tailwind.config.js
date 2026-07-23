/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cocoa: {
          950: '#120A07',
          900: '#1E100A',
          800: '#2C1810',
          700: '#3D2317',
          600: '#543323',
          500: '#7B3F00',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FBF7F0',
          200: '#F5EBE0',
          300: '#E6D5C3',
          400: '#D4C4B0',
        },
        gold: {
          300: '#F3E5AB',
          400: '#E5C158',
          500: '#C9A227',
          600: '#AA7C11',
        },
        caramel: {
          400: '#D4845C',
          500: '#B85C38',
          600: '#8B3A1F',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        marquee: 'marquee 28s linear infinite',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92) translateY(12px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(201, 162, 39, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(201, 162, 39, 0.9)' },
        },
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
