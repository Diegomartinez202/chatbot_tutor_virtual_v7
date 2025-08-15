// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const isExternal = !!process.env.PLAYWRIGHT_BASE_URL && !BASE.includes('localhost');

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    fullyParallel: true,
    use: {
        baseURL: BASE,
        headless: true,
    },
    // Proyectos/navegadores a ejecutar en matriz
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    // Si apuntas a Railway (externo), NO levanta server local
    webServer: isExternal
        ? undefined
        : {
            command: 'npm run dev',
            port: 5173,
            reuseExistingServer: true,
        },
});