// admin_panel_react/tests/e2e/stats-v2.spec.a11y.ts
import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test.describe("A11y StatsPageV2", () => {
    test("sin violaciones críticas/serias y roles básicos presentes", async ({ page }) => {
        // Mock mínimo para /api/stats (si la página carga datos)
        const mock = {
            summary: { total_messages: 10, bot_success: 8, not_understood: 2, avg_response_ms: 300, accuracy: 0.8 },
            series: { by_day: [], latency_ms_p50: [], latency_ms_p95: [] },
            top_confusions: [],
        };
        await page.route("**/api/stats**", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mock) });
        });

        await page.goto("/stats-v2");

        // Roles/semántica básicos
        await expect(page.getByRole("heading").first()).toBeVisible(); // título presente
        // si tienes region/main/landmark, puedes descomentar:
        // await expect(page.getByRole("main")).toBeVisible();

        // Inyecta Axe y revisa accesibilidad
        await injectAxe(page);

        // Reglas: permite "minor" y falla si hay "serious" o "critical"
        await checkA11y(page, undefined, {
            detailedReport: true,
            detailedReportOptions: { html: true },
            axeOptions: {
                // Puedes excluir gráficos si dan falsos positivos:
                // rules: { "color-contrast": { enabled: true } },
            },
            includedImpacts: ["serious", "critical"],
        });
    });
});
