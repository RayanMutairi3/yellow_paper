/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        note: "0 14px 34px -22px rgba(84, 65, 28, 0.55)",
        "note-dark": "0 14px 34px -22px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
