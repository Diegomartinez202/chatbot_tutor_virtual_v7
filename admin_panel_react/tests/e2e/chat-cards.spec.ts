// admin_panel_react/tests/e2e/chat-cards.spec.ts
import { test, expect } from "@playwright/test";
import cards from "../fixtures/bot.response.cards.json";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

test.describe("Chat - Tarjetas (cards)", () => {
    test("renderiza card con botón hacia Zajuna", async ({ page }) => {
        await page.route("**/api/chat", async (route) => {
            if (route.request().method() === "POST") {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(cards),
                });
                return;
            }
            route.continue();
        });

        await page.goto(CHAT_PATH);
        await page.getByTestId("chat-input").fill("Muéstrame un curso de fracciones");
        await page.getByTestId("chat-send").click();

        await expect(page.getByText("Aula Zajuna — Fracciones")).toBeVisible();
        await expect(page.getByRole("button", { name: "Ir al curso" })).toBeVisible();

        await expect(page).toHaveScreenshot("chat-cards.png", { fullPage: true });
    });
});