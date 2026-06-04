export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5a4',
          50: '#e6fffc',
          100: '#ccfff9',
          200: '#99fff3',
        },
        accent: {
          DEFAULT: '#7c3aed',
          50: '#f5f3ff',
        },
        muted: '#94a3b8',
        glass: 'rgba(255,255,255,0.06)'
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      boxShadow: {
        'glass-md': '0 10px 30px rgba(2,6,23,0.6)',
      }
    },
  },
  plugins: [],
}
