import type { Config } from "tailwindcss";

// Mirrors src/theme/colors.ts in playverse-app so both apps share one brand.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pv: {
          bg: "#0F0B1E",
          elevated: "#181129",
          elevated2: "#221A38",
          primary: "#7B5CFF",
          primaryPressed: "#6647E0",
          secondary: "#FF5CA8",
          coin: "#FFB020",
          success: "#2DD4BF",
          danger: "#FF5C5C",
          text: "#F3F1FF",
          textSecondary: "#A79FCB",
          textMuted: "#6B6488",
          border: "#2C2447",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        numeric: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
