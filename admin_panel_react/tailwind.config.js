/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class', // ⬅️ Esto activa el modo oscuro
    theme: {
        extend: {
            colors: {
                primary: "#6366F1",  // Indigo-500
                secondary: "#10B981", // Green-500
                accent: "#FBBF24",   // Yellow-400
            },
        },
    },
    plugins: [],
}