/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Quick-commerce vibrant color palette
        primary: {
          DEFAULT: '#0c831f', // Fresh green accent for buttons, cart, badge
          dark: '#096317',
          light: '#eaf7ed',
        },
        secondary: {
          DEFAULT: '#ffc107', // Bright yellow for banners & highlight badges
          dark: '#e0a800',
          light: '#fff9e6',
        },
        dark: {
          100: '#363636',
          200: '#1f1f1f',
          300: '#121212',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
