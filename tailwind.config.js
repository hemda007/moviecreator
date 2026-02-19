/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          black: '#0A0A0A',
          gold: '#E8C547',
          'gold-dark': '#D4A017',
          cream: '#F5F0E8',
          interview: '#64C8FF',
          broll: '#64FF96',
          narration: '#FFC864',
          titlecard: '#C896FF',
          montage: '#FF96C8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
