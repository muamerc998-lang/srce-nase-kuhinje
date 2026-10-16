import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

/**
 * E2E tokovi. Pretpostavka: baza radi i demo sadržaj je učitan.
 * Server: koristi postojeći na BASE_URL ili pokreće `npm run dev`.
 */
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: { baseURL, trace: 'retain-on-failure', locale: 'bs-BA' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobilni/ },
    { name: 'mobilni', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }, grep: /@mobilni/ },
  ],
  webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
})
