/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /./,
    },
  ],
  theme: {
    extend: {
      colors: {
        'low': '#FFEB3B',
        'medium': '#FF9800',
        'high': '#F44336',
        'severe': '#9C27B0',
      },
    },
  },
  plugins: [],
} 