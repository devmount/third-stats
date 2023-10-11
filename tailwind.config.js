/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.*.html',
    './src/**/*.{vue,js}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms')
  ],
}
