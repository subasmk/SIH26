/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bento: {
          primary: '#FAD4C0',
          secondary: '#80A1C1',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          surface: '#FFF5E6',
          text: '#111827',
          neutral: '#FFF5E6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'bento-sm': '4px',
        'bento-md': '8px',
        'bento-lg': '16px',
      }
    },
  },
  plugins: [],
}
