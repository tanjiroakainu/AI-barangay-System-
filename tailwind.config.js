/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        surface: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          sky: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.03) 1px, transparent 1px)',
        'glow': 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.15), transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(56, 189, 248, 0.4)',
        'glow-sm': '0 0 20px -5px rgba(56, 189, 248, 0.3)',
        'inner-glow': 'inset 0 0 60px -20px rgba(56, 189, 248, 0.1)',
      },
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
