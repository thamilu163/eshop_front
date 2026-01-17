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
      // Allow console.warn and console.error, but warn on console.log
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // Warn on explicit any - should be documented when used
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Error on unused vars, but allow underscore prefix for intentionally unused
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
];
