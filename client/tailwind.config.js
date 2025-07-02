module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: '#6366f1', // indigo-500
        accent: '#f472b6', // pink-400
        secondary: '#06b6d4', // cyan-500
        background: '#f8fafc', // slate-50
        card: '#fff',
        muted: '#e5e7eb', // gray-200
      },
      boxShadow: {
        'glow': '0 4px 20px 0 rgba(99,102,241,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-in',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateY(30px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}; 