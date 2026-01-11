// Flat ESLint config (modern) — mirrors rules from legacy .eslintrc.cjs.
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
	{
		   ignores: [
			   '.next/',
			   'node_modules/',
			   'dist/',
			   'build/',
			   'out/',
			   '.turbopack/',
			   '**/__tests__/**',
			   'src/scripts/**',
			   'src/**/*.test.*',
			   'src/**/*.spec.*',
			   'src/**/*.d.ts',
			   'middleware.ts',
			   'middleware-enhanced.ts',
			   'proxy.ts',
			   'next-env.d.ts',
		   ],
	},
	{
		files: ['**/*.{ts,tsx}'],
		// Keep typed lint rules for TS files and add targeted overrides below
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: 'module',
				project: './tsconfig.eslint.json',
				tsconfigRootDir: __dirname,
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			react: reactPlugin,
		},
		rules: {
			'no-console': 'warn',
			'prefer-const': 'error',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'react/no-danger': 'off',
		},
	},
	{
		files: [
			'src/app/api/**',
			'src/lib/**',
			'src/services/**',
			'src/sw/**',
			'src/store/**',
			'src/proxy.ts',
			'src/proxy.disabled.ts',
		],
		rules: {
			// Server-side code and service worker use console for logging — allow it
			'no-console': 'off',
		},
	},
];
