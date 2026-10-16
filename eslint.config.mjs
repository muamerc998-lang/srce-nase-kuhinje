import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^(_|ignore)', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      '.data/',
      'media/',
      'screenshots/',
      'test-results/',
      'playwright-report/',
      'next-env.d.ts',
      'src/payload-types.ts',
      'src/app/(payload)/',
      'src/migrations/',
    ],
  },
]

export default eslintConfig
