import { test, expect } from "@playwright/test";
import ok from "../fixtures/bot.response.ok.json";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

test.describe("Chat - Texto (REST)", () => {
    test("envía texto y muestra respuesta del bot", async ({ page }) => {
        await page.route("**/api/chat", async route => {
            if (route.request().method() === "POST") {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(ok),
                });
                return;
            }
            route.continue();
        });

        await page.goto(CHAT_PATH);
        await page.getByTestId("chat-input").fill("Necesito ayuda con fracciones");
        await page.getByTestId("chat-send").click();

        // Verifica que aparezca texto del bot
        await expect(page.getByText("Te ayudo con fracciones", { exact: false })).toBeVisible();

        // Screenshot de la conversación
        await expect(page).toHaveScreenshot("chat-text.png", { fullPage: true });
    });
});
