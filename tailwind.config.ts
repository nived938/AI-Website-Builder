import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        foreground: "#F4F3EF",
        graphite: {
          DEFAULT: "#111827",
          50: "#1E2738",
          100: "#1A2234",
          200: "#161F30",
          300: "#111827",
          400: "#0D131F",
          500: "#080C14",
        },
        mint: {
          DEFAULT: "#C8FF70",
          hover: "#B5F255",
          dim: "rgba(200, 255, 112, 0.15)",
        },
        violet: {
          DEFAULT: "#8B75FF",
          hover: "#7861F2",
          dim: "rgba(139, 117, 255, 0.15)",
        },
        porcelain: {
          DEFAULT: "#F4F3EF",
          muted: "#929BAD",
        },
        border: {
          DEFAULT: "#1F293D",
          light: "#2C3954",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      boxShadow: {
        mint: "0 0 20px -3px rgba(200, 255, 112, 0.3)",
        violet: "0 0 20px -3px rgba(139, 117, 255, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
