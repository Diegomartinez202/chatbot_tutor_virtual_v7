import { test, expect } from "@playwright/test";
import ok from "../fixtures/bot.response.ok.json";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

test.describe("Chat - Mic (mock grabación + intercept /api/chat/audio)", () => {
    test.beforeEach(async ({ page }) => {
        // Mock muy simple de MediaRecorder + getUserMedia
        await page.addInitScript(() => {
            // @ts-ignore
            navigator.mediaDevices = {
                getUserMedia: async () => ({
                    getTracks: () => [{ stop() { } }],
                }),
            };
            // @ts-ignore
            window.MediaRecorder = class {
                ondataavailable: ((ev: any) => void) | null = null;
                onstop: (() => void) | null = null;
                state = "inactive";
                constructor(_stream: any, _opts?: any) { }
                start() {
                    this.state = "recording";
                    // Entrega un "blob" simulado enseguida
                    setTimeout(() => {
                        const blob = new Blob(["dummy"], { type: "audio/webm" });
                        this.ondataavailable && this.ondataavailable({ data: blob });
                    }, 30);
                }
                stop() {
                    this.state = "inactive";
                    this.onstop && this.onstop();
                }
            };
        });
    });

    test("graba (mock), previsualiza y sube; muestra transcript + respuesta bot", async ({ page }) => {
        await page.route("**/api/chat/audio", async route => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    ok: true,
                    transcript: "mi audio de prueba sobre fracciones",
                    bot: { messages: ok },
                }),
            });
        });

        await page.goto(CHAT_PATH);

        // Click en el botón Mic (aria-label definido en MicButton)
        await page.getByRole("button", { name: "Grabar audio" }).click();

        // Detener grabación (cuando el mock deja el blob listo)
        await page.getByRole("button", { name: "Detener grabación" }).click();

        // Enviar audio
        await page.getByRole("button", { name: "Enviar audio" }).click();

        // Ver transcript añadido como mensaje del usuario
        await expect(page.getByText("mi audio de prueba", { exact: false })).toBeVisible();

        // Ver respuesta del bot (del fixture ok)
        await expect(page.getByText("Te ayudo con fracciones", { exact: false })).toBeVisible();

        await expect(page).toHaveScreenshot("chat-mic.png", { fullPage: true });
    });
});
