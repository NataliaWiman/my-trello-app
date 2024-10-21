import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        checkmark: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M20 6 9 17l-5-5"/%3E%3C/svg%3E');`,
      },
    },
  },
  plugins: [],
};
export default config;
