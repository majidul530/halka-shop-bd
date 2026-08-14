/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E",
          dark: "#0B5A54",
          light: "#14B8A6",
        },
        secondary: "#F59E0B",
        surface: "#F8FAFC",
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
}
