import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1F6F43',
          50:  '#f0faf4',
          100: '#dcf4e8',
          200: '#bbe8d3',
          300: '#88d5b2',
          400: '#4dba8b',
          500: '#2a9d6e',
          600: '#1F6F43',
          700: '#196038',
          800: '#164d2f',
          900: '#123f27',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
