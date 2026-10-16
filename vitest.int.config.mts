import { defineConfig } from 'vitest/config'

// Integracijski testovi: Payload + PostgreSQL (zahtijevaju pokrenutu bazu, npm run db).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/int/**/*.int.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
})
