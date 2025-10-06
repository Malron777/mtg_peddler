import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f6f7f3",
          100: "#e8eadc",
          200: "#d4d7c2",
          300: "#b3b896",
          400: "#94996e",
          500: "#7a8057",
          600: "#626745",
          700: "#4e5238",
          800: "#3f432f",
          900: "#353829",
        },
        gold: {
          50: "#fffef5",
          100: "#fff9db",
          200: "#ffeeb3",
          300: "#ffdd80",
          400: "#ffc94d",
          500: "#ffb01f",
          600: "#e6960a",
          700: "#bf7a0a",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        rarity: {
          common: "#1e293b",
          uncommon: "#71717a",
          rare: "#eab308",
          mythic: "#ea580c",
          special: "#a855f7",
        },
        condition: {
          nm: "#16a34a",
          lp: "#0891b2",
          mp: "#eab308",
          hp: "#ea580c",
          dmg: "#dc2626",
        },
        status: {
          trade: "#7a8057",
          sale: "#0891b2",
          both: "#7c3aed",
          reserved: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
