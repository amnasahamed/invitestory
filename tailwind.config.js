/** @type {import('tailwindcss').Config} */
// Forest-night shell: deep green-black + bone + single emerald accent.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Outfit"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        night: {
          DEFAULT: "#0E1410",
          soft: "#141C16",
          card: "#1A231C",
        },
        bone: "#EDE8DF",
        emerald: {
          DEFAULT: "#3D7A5F",
          soft: "#6BB890",
          deep: "#2C5A46",
        },
        line: "#EDE8DF14",
      },
      letterSpacing: {
        eyebrow: "0.08em",
      },
      fontSize: {
        caption: ["0.6875rem", { lineHeight: "1.4" }],
        body: ["1.125rem", { lineHeight: "1.75" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        h2: ["2rem", { lineHeight: "1.2" }],
        h1: ["2.625rem", { lineHeight: "1.15" }],
        display: ["3.5rem", { lineHeight: "1.05" }],
        hero: ["4.5rem", { lineHeight: "1.05" }],
      },
      borderRadius: {
        card: "14px",
        pill: "999px",
      },
      boxShadow: {
        calm: "0 24px 48px -16px rgba(8, 14, 10, 0.45)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
