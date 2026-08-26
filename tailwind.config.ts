import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10233f",
        brand: { 50: "#eff6ff", 100: "#dbeafe", 500: "#2563eb", 600: "#1d4ed8", 700: "#1e40af" },
      },
      boxShadow: { card: "0 12px 40px rgba(31, 65, 114, 0.08)" },
    },
  },
  plugins: [],
};

export default config;
