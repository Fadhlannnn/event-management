
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create compat helper for legacy shareable configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 1) Extend Next.js recommended rules (Core Web Vitals) & its TS plugin
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2) Add any project-wide overrides or custom rules here:
  {
    // Apply to JS/TS/JSX/TSX files
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Example customizations:
      // "no-console": "warn",
      // "react/react-in-jsx-scope": "off",
    },
  },
];
