import { Page } from "@playwright/test";

export async function installStatsMock(page: Page) {
    const mock = {
        summary: {
            total_messages: 345,
            bot_success: 290,
            not_understood: 24,
            avg_response_ms: 420,
            accuracy: 0.89,
        },
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

    // Cubre tanto /api/stats como subrutas (alias unificado)
    await page.route("**/api/stats**", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mock),
        });
    });
}