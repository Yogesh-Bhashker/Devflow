/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#0B0E13",
        surface: "#131720",
        border: "#232A36",
        textmuted: "#9AA4B2",
        brass: "#C98A4B",
        teal: "#4FB8A6",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};