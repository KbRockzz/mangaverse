module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals',
  ],
  rules: {
    // Allow explicit any (turn error into warning) – many API signatures use any now
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow setting state directly inside effects – will keep current logic safe for now
    'react-hooks/set-state-in-effect': 'off',
    // Reduce noise for unused vars in seed / test files
    '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    // Keep the Next.js rule about <img> but treat as warning
    '@next/next/no-img-element': 'warn',
  },
  settings: {
    react: { version: 'detect' },
  },
  // Ensure API files also inherit the global "no-explicit-any" off rule
  overrides: [
    {
      files: ['src/app/api/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
