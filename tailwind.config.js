/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A1834',
          800: '#0F2247',
          700: '#15305F'
        },
        brand: {
          red: '#E4202C',
          blue: '#1F5FDB',
          green: '#1E9E5A'
        }
      }
    }
  },
  plugins: []
}
