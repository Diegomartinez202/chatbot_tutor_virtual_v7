import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    fullyParallel: true,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
        headless: true,
    },
    webServer: process.env.CI
        ? { command: 'npm run preview', port: 5173, reuseExistingServer: !process.env.CI }
        : { command: 'npm run dev', port: 5173, reuseExistingServer: true },
});