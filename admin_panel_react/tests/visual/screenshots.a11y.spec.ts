import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// === Mocks ===
const statsMock = {
    summary: { total_messages: 345, bot_success: 290, not_understood: 24, avg_response_ms: 420, accuracy: 0.89 },
    series: {
        by_day: [
            { date: "2025-08-10", messages: 40, success: 35, fallback: 3 },
            { date: "2025-08-11", messages: 52, success: 46, fallback: 4 },
            { date: "2025-08-12", messages: 63, success: 51, fallback: 7 },
        ],
        latency_ms_p50: [
            { date: "2025-08-10", value: 350 },
            { date: "2025-08-11", value: 400 },
            { date: "2025-08-12", value: 430 },
        ],
        latency_ms_p95: [
            { date: "2025-08-10", value: 800 },
            { date: "2025-08-11", value: 900 },
            { date: "2025-08-12", value: 950 },
        ],
    },
    top_confusions: [
        { intent: "nlu_fallback", count: 12, example: "no entiendo esto" },
        { intent: "faq_envio", count: 4, example: "cuando llega?" },
    ],
};

const logsMock = {
    total: 6,
    items: Array.from({ length: 6 }).map((_, i) => ({
        _id: `log_${i + 1}`,
        request_id: `req_${1000 + i}`,
        sender_id: i % 2 ? "anonimo" : `user_${i}`,
        user_message: i % 3 === 0 ? "No puedo ingresar" : "Hola, necesito ayuda",
        bot_response: ["Claro, te ayudo con eso."],
        intent: i % 2 ? "problema_no_ingreso" : "saludo",
        timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
        ip: "127.0.0.1",
        user_agent: "PlaywrightBot/1.0",
        origen: i % 2 ? "widget" : "autenticado",
        metadata: { mocked: true },
    })),
};

async function mockApis(page) {
    await page.route("**/api/stats**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(statsMock) })
    );
    await page.route("**/api/logs**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(logsMock) })
    );
}

// Helper para rellenar el primer locator que exista
async function fillFirst(page, locators: import("@playwright/test").Locator[], value: string) {
    for (const l of locators) {
        if ((await l.count()) > 0) {
            await l.first().fill(value);
            return true;
        }
    }
    return false;
}

// Click en el primer botón que exista
async function clickFirst(page, locators: import("@playwright/test").Locator[]) {
    for (const l of locators) {
        if ((await l.count()) > 0) {
            await l.first().click();
            return true;
        }
    }
    return false;
}

// Login opcional por ENV (si no configuras las variables, se salta)
async function loginIfNeeded(page, baseURL?: string) {
    const loginPath = process.env.PLAYWRIGHT_LOGIN_PATH;
    const user = process.env.PLAYWRIGHT_LOGIN_USER;
    const pass = process.env.PLAYWRIGHT_LOGIN_PASS;
    if (!loginPath || !user || !pass) return;

    await page.goto(new URL(loginPath, baseURL || page.url()).toString());

    // Prioriza data-testid y luego fallback a name/role
    await fillFirst(page, [
        page.getByTestId("login-email"),
        page.locator('input[name="email"]'),
        page.locator('input[name="username"]'),
    ], user);

    await fillFirst(page, [
        page.getByTestId("login-password"),
        page.locator('input[type="password"]'),
    ], pass);

    await clickFirst(page, [
        page.getByTestId("login-submit"),
        page.locator('button[type="submit"]'),
        page.getByRole("button", { name: /(Ingresar|Login|Entrar)/i }),
    ]);

    await page.waitForLoadState("networkidle");
}

// Axe (falla si hay violaciones serious/critical)
async function assertNoSeriousA11y(page) {
    const results = await new AxeBuilder({ page })
        // Si los charts generan falsos positivos, puedes excluirlos descomentando:
        // .exclude("svg")
        .analyze();

    const bad = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
    if (bad.length) {
        console.log("A11y serious/critical violations:\n", JSON.stringify(bad, null, 2));
    }
    expect(bad.map(v => v.id), "Violaciones de accesibilidad (serious/critical)").toHaveLength(0);
}

test("A11y: dashboard, stats, stats-v2, intentos-fallidos, diagnostico, chat", async ({ page, baseURL }) => {
    await mockApis(page);
    await loginIfNeeded(page, baseURL);

    const routes = ["/dashboard", "/stats", "/stats-v2", "/intentos-fallidos", "/diagnostico", "/chat"];
    for (const r of routes) {
        await page.goto(r);
        await assertNoSeriousA11y(page);
    }

    // Home con widget
    await page.goto("/");
    await assertNoSeriousA11y(page);
});