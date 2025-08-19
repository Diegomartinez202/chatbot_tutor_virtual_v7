import { test, expect } from "@playwright/test";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

test.describe("Chat (texto) → intercept /api/chat", () => {
    test("envía texto y muestra respuesta del bot", async ({ page }) => {
        // Interceptar POST /api/chat (ajusta si tu servicio usa otra ruta)
        await page.route("**/api/chat", async (route) => {
            const body = await route.request().postDataJSON().catch(() => ({}));
            const text = (body && body.text) || "";

            // Respuesta estilo Rasa REST
            const rasaMessages = [
                { text: `Recibí: "${text}". ¡Vamos a resolverlo!` },
                {
                    buttons: [
                        { title: "Opción A", payload: "/opcion_a" },
                        { title: "Opción B", payload: "/opcion_b" },
                    ],
                },
            ];

            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(rasaMessages),
            });
        });

        await page.goto(CHAT_PATH);

        // Escribe un mensaje
        const input = page.getByTestId("chat-input");
        const sendBtn = page.getByTestId("chat-send");

        await expect(input).toBeVisible();
        await input.fill("¿Cómo sumo fracciones?");
        await sendBtn.click();

        // Verifica eco/flujo
        await expect(page.getByText("¿Cómo sumo fracciones?")).toBeVisible();
        await expect(page.getByText('Recibí: "¿Cómo sumo fracciones?". ¡Vamos a resolverlo!')).toBeVisible();

        // Screenshot de la conversación
        await page.screenshot({ path: "playwright-report/chat-text-full.png", fullPage: true });
    });
});