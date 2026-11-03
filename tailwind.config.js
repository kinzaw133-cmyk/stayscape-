/** @type {import('tailwindcss').Config} */
const ch = (v) => `rgb(var(--${v}) / <alpha-value>)`;
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: ch("bg"), surface: ch("surface"), fg: ch("fg"), muted: ch("muted"),
        accent: ch("accent"), "accent-fg": ch("accent-fg"), sage: ch("sage"),
        forest: "#0B3D2E", gold: "#D4AF37", ivory: "#F8F6EE",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
