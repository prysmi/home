/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./script.js",
    "./**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'accent-pink': '#FF53AC',
        'accent-yellow': '#EEFF41',
        'bg-body-dark': '#0A0A0A',
        'bg-body-light': '#F5F5F5',
        'bg-section-dark': 'rgba(26, 26, 26, 0.75)',
        'bg-section-light': 'rgba(255, 255, 255, 0.75)',
        'text-primary-dark': '#E0E0E0',
        'text-primary-light': '#333333',
        'text-heading-dark': '#FFFFFF',
        'text-heading-light': '#0A0A0A'
      },
      fontFamily: {
        'libre-franklin': ['Libre Franklin', 'sans-serif'],
        'libre-baskerville': ['Libre Baskerville', 'serif']
      }
    },
  },
  plugins: [],
}