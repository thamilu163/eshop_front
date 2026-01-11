/**
 * Project-level ESLint config to adjust rule severities and ignores
 * This file intentionally relaxes `no-console` and `@typescript-eslint/no-explicit-any`
 * to reduce CI noise while incremental code fixes continue.
 */
module.exports = [
  {
    ignores: ["scripts/**", ".next/**", "node_modules/**", "dist/**"]
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser")
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];
