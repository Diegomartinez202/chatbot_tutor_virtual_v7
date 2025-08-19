import { test, expect } from "@playwright/test";
import ok from "../fixtures/bot.response.ok.json";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

test.describe("Chat - Mic (mock grabación + intercept /api/chat/audio)", () => {
    test.beforeEach(async ({ page }) => {
        // Mock de getUserMedia + MediaRecorder (graba y genera un "blob" dummy)
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
                        const blob = new Blob(["dummy audio"], { type: "audio/webm" });
                        this.ondataavailable && this.ondataavailable({ data: blob });
                    }, 40);
                }
                stop() {
                    this.state = "inactive";
                    this.onstop && this.onstop();
                }
            };
        });
    });

    test("graba (mock), previsualiza y sube; muestra transcript + respuesta bot", async ({ page }) => {
        // Intercepta POST /api/chat/audio y responde con transcript + mensajes del bot (fixture ok)
        await page.route("**/api/chat/audio", async (route) => {
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

        // (Opcional) si tu ChatUI pudiera hacer llamadas de texto en paralelo, evita hits reales:
        await page.route("**/api/chat", (route) => {
            if (route.request().method() === "POST") {
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify([{ text: "Texto interceptado (mock)" }]),
                });
            }
            route.continue();
        });

        await page.goto(CHAT_PATH);

        // 1) Grabar
        const micBtn = page.getByRole("button", { name: "Grabar audio" });
        await expect(micBtn).toBeVisible();
        await micBtn.click();

        // 2) Detener
        const stopBtn = page.getByRole("button", { name: "Detener grabación" });
        await expect(stopBtn).toBeVisible({ timeout: 3000 });
        await stopBtn.click();

        // 3) Enviar audio
        const uploadBtn = page.getByRole("button", { name: "Enviar audio" });
        await expect(uploadBtn).toBeVisible();
        await uploadBtn.click();

        // 4) Ver transcript como mensaje del usuario
        await expect(
            page.getByText("mi audio de prueba sobre fracciones", { exact: false })
        ).toBeVisible();

        // 5) Ver respuesta del bot (fixture ok)
        await expect(
            page.getByText("fracciones", { exact: false }) // ajusta a un texto seguro dentro de tu fixture
        ).toBeVisible();

        // 6) Screenshot
        await expect(page).toHaveScreenshot("chat-mic.png", { fullPage: true });
    });
});