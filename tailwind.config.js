/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        numenera: {
          primary: "#1a5490",
          secondary: "#8b4513",
          accent: "#d4af37",
        },
        parchment: {
          light: "#f5e6d3",
          DEFAULT: "#ede1cf",
          dark: "#e5d4be",
        },
        brown: {
          900: "#2d2416",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "serif"],
        handwritten: ["Caveat", "Patrick Hand", "cursive"],
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
};
