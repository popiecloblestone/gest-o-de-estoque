/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Bebas Neue', 'cursive'], // Mapped to Bebas for headers
                display: ['Bebas Neue', 'cursive'], // Explicit display font
            },
            colors: {
                'brand-black': '#090909',
                'brand-dark': '#121212',
                'brand-gold': '#D4AF37',
                'brand-gold-light': '#F3E5AB',
                'brand-gold-dark': '#AA8C2C',
                'brand-gray': '#f5f5f5',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },

        },
    },
    plugins: [],
}
