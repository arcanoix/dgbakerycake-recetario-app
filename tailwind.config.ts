import type { Config } from "tailwindcss";

// Tailwind v4: theme tokens are defined in globals.css via @theme {}
// This file is kept for compatibility with any tooling that reads it,
// but the actual design tokens live in app/globals.css.
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};

export default config;
