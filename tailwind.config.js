module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#18181b',
          accent: '#d4af37',
          surface: '#f8f5f2',
          primary: '#1e293b',
          secondary: '#14532d',
        },
        vaha: {
          ink: '#0c0c0c',
          'ink-soft': '#141414',
          cream: '#f4efe6',
          muted: 'rgba(244, 239, 230, 0.72)',
          gold: '#c9a962',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
