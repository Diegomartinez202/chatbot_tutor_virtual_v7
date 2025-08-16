// admin_panel_react/tests/e2e/stats-v2.spec.a11y.ts
import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test.describe("A11y StatsPageV2", () => {
    test("sin violaciones cr�ticas/serias y roles b�sicos presentes", async ({ page }) => {
        // Mock m�nimo para /api/stats (si la p�gina carga datos)
        const mock = {
            summary: { total_messages: 10, bot_success: 8, not_understood: 2, avg_response_ms: 300, accuracy: 0.8 },
            series: { by_day: [], latency_ms_p50: [], latency_ms_p95: [] },
            top_confusions: [],
        };
        await page.route("**/api/stats**", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mock) });
        });

        await page.goto("/stats-v2");

        // Roles/sem�ntica b�sicos
        await expect(page.getByRole("heading").first()).toBeVisible(); // t�tulo presente
        // si tienes region/main/landmark, puedes descomentar:
        // await expect(page.getByRole("main")).toBeVisible();

        // Inyecta Axe y revisa accesibilidad
        await injectAxe(page);

        // Reglas: permite "minor" y falla si hay "serious" o "critical"
        await checkA11y(page, undefined, {
            detailedReport: true,
            detailedReportOptions: { html: true },
            axeOptions: {
                // Puedes excluir gr�ficos si dan falsos positivos:
                // rules: { "color-contrast": { enabled: true } },
            },
            includedImpacts: ["serious", "critical"],
        });
    });
});
