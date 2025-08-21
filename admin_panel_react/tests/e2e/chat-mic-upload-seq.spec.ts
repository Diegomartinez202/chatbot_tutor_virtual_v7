import { test, expect } from "@playwright/test";

const CHAT_PATH = process.env.CHAT_PATH || "/chat";

// Pequeña respuesta de bot inline (evitamos import JSON + assert)
const ok = [
    { text: "¡Claro! Empecemos con un ejemplo de fracciones." },
    { buttons: [{ title: "1/2 + 1/3", payload: "/resolver_12_13" }] }
];

test.describe("Chat – Mic (grabar → parar → subir) con mock secuencial 200→413", () => {
    test.beforeEach(async ({ page }) => {
        // Mock de getUserMedia + MediaRecorder
        await page.addInitScript(() => {
            // @ts-ignore
            navigator.mediaDevices = {
                getUserMedia: async () => ({
                    getTracks: () => [{ stop() { } }]
                })
            };

            // @ts-ignore
            window.MediaRecorder = class {
                ondataavailable = null;
                onstop = null;
                state = "inactive";
                constructor(_stream, _opts) { }
                start() {
                    this.state = "recording";
                    setTimeout(() => {
                        const blob = new Blob(["dummy audio"], { type: "audio/webm" });
                        this.ondataavailable && this.ondataavailable({ data: blob });
                    }, 40);
                }
                stop() {
                    this.state = "inactive";
                    this.onstop && this.onstop();
                }
                static isTypeSupported() {
                    return true;
                }
            };
        });

        // Evitar hits reales de texto al backend
        await page.route("**/api/chat", (route) => {
            if (route.request().method() === "POST") {
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify([{ text: "Texto interceptado (mock)" }])
                });
            }
            route.continue();
        });
    });

    test("1ª subida OK (200) y 2ª subida 413 muestra error", async ({ page }) => {
        // Mock secuencial para /api/chat/audio
        let calls = 0;
        await page.route("**/api/chat/audio", async (route) => {
            calls++;
            if (calls === 1) {
                return route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        ok: true,
                        transcript: "mi audio de prueba sobre fracciones",
                        bot: { messages: ok }
                    })
                });
            }
            return route.fulfill({
                status: 413,
                contentType: "application/json",
                body: JSON.stringify({ detail: "Archivo demasiado grande" })
            });
        });

        // Abre el chat (Harness en /chat)
        await page.goto(`${CHAT_PATH}?persona=aprendiz&lang=es-CO`);

        // ——— Ciclo 1: grabar → parar → subir (OK) ———
        await page.getByRole("button", { name: "Grabar audio" }).click();
        await page.getByRole("button", { name: "Detener grabación" }).click();
        await page.getByRole("button", { name: "Enviar audio" }).click();

        // Ver transcript del usuario
        await expect(
            page.getByText("mi audio de prueba sobre fracciones", { exact: false })
        ).toBeVisible();

        // Ver contenido del bot
        await expect(page.getByText(/fracciones/i)).toBeVisible();

        // ——— Ciclo 2: nuevo audio → 413 ———
        await page.getByRole("button", { name: "Grabar audio" }).click();
        await page.getByRole("button", { name: "Detener grabación" }).click();
        await page.getByRole("button", { name: "Enviar audio" }).click();

        // Debe mostrarse el error (usa aria-labels o data-testid si ya lo agregaste)
        await expect(page.getByText(/Archivo demasiado grande|413|Error/i)).toBeVisible();

        // Screenshot del estado final del chat
        await expect(page).toHaveScreenshot("chat-mic-upload-seq.png", { fullPage: true });
    });
});