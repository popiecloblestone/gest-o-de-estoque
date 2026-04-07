/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: "class",
  theme: {
      extend: {
          colors: {
              "primary": "#3b82f6",
              "background-light": "#f8fafc",
              "background-dark": "#0f172a",
              "card-dark": "#1e293b",
              "border-dark": "#334155"
          },
          fontFamily: {
              "sans": ["Inter", "system-ui", "-apple-system", "sans-serif"]
          },
          borderRadius: {
              "2xl": "1.25rem",
              "3xl": "1.5rem",
          },
          boxShadow: {
              'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              'soft-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }
      },
  },
  plugins: [],
}
