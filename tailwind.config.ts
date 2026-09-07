import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lacivert / Navy - ana marka rengi
        navy: {
          50: "#eef2f9",
          100: "#d9e1f0",
          200: "#b3c3e1",
          300: "#8098c9",
          400: "#4d6cae",
          500: "#2e4d92",
          600: "#1f3a72",
          700: "#152a57",
          800: "#0d1c3d",
          900: "#0a1730",
          950: "#060e1f",
        },
        // Zümrüt yeşili / Emerald - güven & aksiyon
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Altın / Gold - premium detaylar
        gold: {
          50: "#fbf7ec",
          100: "#f5eccf",
          200: "#ebd79c",
          300: "#e0c069",
          400: "#d4af37",
          500: "#c69a2b",
          600: "#a87b23",
          700: "#855c1f",
          800: "#6f4b20",
          900: "#5f3f20",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(10, 23, 48, 0.08)",
        card: "0 10px 40px rgba(10, 23, 48, 0.10)",
        gold: "0 8px 30px rgba(212, 175, 55, 0.25)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(1200px 600px at 80% -10%, rgba(16,185,129,0.18), transparent), radial-gradient(900px 500px at 0% 20%, rgba(212,175,55,0.10), transparent)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
