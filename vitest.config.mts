import { defineConfig } from 'vitest/config'

// Unit testovi: čista logika, bez baze.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
