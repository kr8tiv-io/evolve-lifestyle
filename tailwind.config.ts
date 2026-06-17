import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EVOLVE locked brand system
        void: {
          DEFAULT: "#050505", // Boreal Void — base
          900: "#0a0a0a",
          800: "#101110",
          700: "#16181a",
          600: "#1d2022",
        },
        neon: {
          DEFAULT: "#00ff41", // Aurora Neon — primary accent
          soft: "#4ade80", // Aurora soft — labels/accents
          lime: "#39ff14", // Cyber Lime — underlines/highlights
        },
        silver: {
          DEFAULT: "#c9ced4", // Alloy Silver
          bright: "#f3f4f6",
          dim: "#8a9099",
          metal: "#9aa3ab",
        },
      },
      fontFamily: {
        // Neue Montreal — see src/app/globals.css @font-face + public/fonts/README
        sans: ["var(--font-neue)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Dramatic display scale
        "display-sm": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display": ["clamp(3.5rem, 11vw, 10rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(4.5rem, 16vw, 16rem)", { lineHeight: "0.85", letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tracked: "0.18em",
        "tracked-lg": "0.28em",
      },
      maxWidth: {
        grid: "1680px",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
        "evolve": "cubic-bezier(0.65, 0.05, 0, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "grain-shift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "20%": { transform: "translate(-5%, 5%)" },
          "40%": { transform: "translate(5%, -5%)" },
          "60%": { transform: "translate(-3%, -3%)" },
          "80%": { transform: "translate(3%, 3%)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "marquee-slow": "marquee 64s linear infinite",
        grain: "grain-shift 0.6s steps(2) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
