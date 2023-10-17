/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.*.html',
    './src/**/*.{vue,js}',
  ],
  theme: {
    extend: {
      colors: {
        tboptions: '#23222b',
        zinc: {
          750: '#2F2F38',
          925: '#111113',
        }
      },
      gridTemplateColumns: {
        option: '1fr 50%',
      }
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms')
  ],
}
