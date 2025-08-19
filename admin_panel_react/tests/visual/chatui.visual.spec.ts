import { test, expect } from "@playwright/test";

test("ChatUI carga y muestra composer", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByTestId("chat-composer")).toBeVisible();
    await expect(page.getByTestId("chat-input")).toBeVisible();
    await expect(page.getByTestId("chat-send")).toBeVisible();

    await page.screenshot({ path: "playwright-report/chatui-initial.png", fullPage: true });
});