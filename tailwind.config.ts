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
          50: "var(--olive-50)",
          100: "var(--olive-100)",
          200: "var(--olive-200)",
          300: "var(--olive-300)",
          400: "var(--olive-400)",
          500: "var(--olive-500)",
          600: "var(--olive-600)",
          700: "var(--olive-700)",
          800: "var(--olive-800)",
          900: "var(--olive-900)",
        },
        gold: {
          50: "var(--gold-50)",
          100: "var(--gold-100)",
          200: "var(--gold-200)",
          300: "var(--gold-300)",
          400: "var(--gold-400)",
          500: "var(--gold-500)",
          600: "var(--gold-600)",
          700: "var(--gold-700)",
        },
        slate: {
          50: "var(--slate-50)",
          100: "var(--slate-100)",
          200: "var(--slate-200)",
          300: "var(--slate-300)",
          400: "var(--slate-400)",
          500: "var(--slate-500)",
          600: "var(--slate-600)",
          700: "var(--slate-700)",
          800: "var(--slate-800)",
          900: "var(--slate-900)",
          950: "var(--slate-950)",
        },
        rarity: {
          common: "var(--rarity-common)",
          uncommon: "var(--rarity-uncommon)",
          rare: "var(--rarity-rare)",
          mythic: "var(--rarity-mythic)",
          special: "var(--rarity-special)",
        },
        condition: {
          nm: "var(--condition-nm)",
          lp: "var(--condition-lp)",
          mp: "var(--condition-mp)",
          hp: "var(--condition-hp)",
          dmg: "var(--condition-dmg)",
        },
        status: {
          trade: "var(--status-trade)",
          sale: "var(--status-sale)",
          both: "var(--status-both)",
          reserved: "var(--status-reserved)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
