module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#18181b', // deep charcoal
          accent: '#d4af37', // gold
          surface: '#f8f5f2', // off-white
          primary: '#1e293b', // navy
          secondary: '#14532d', // forest green
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
