import { test, expect } from "@playwright/test";

// Mock sencillo de MediaRecorder + getUserMedia inyectado antes de cargar la app
async function injectMediaMocks(page) {
    await page.addInitScript(() => {
        // Mock getUserMedia
        navigator.mediaDevices = navigator.mediaDevices || ({} as any);
        navigator.mediaDevices.getUserMedia = async (_opts?: any) => {
            // devolvemos un objeto con tracks deteníbles (lo usa el stop())
            return {
                getTracks: () => [
                    {
                        stop: () => { },
                        kind: "audio",
                        enabled: true,
                        muted: false,
                        label: "MockAudioTrack",
                    },
                ],
            } as any;
        };

        // Mock MediaRecorder
        class MockMediaRecorder {
            public mimeType: string;
            public ondataavailable: ((e: any) => void) | null = null;
            public onstop: (() => void) | null = null;
            private interval: number | null = null;
            private started = false;

            constructor(_stream: any, opts: any = {}) {
                this.mimeType = opts.mimeType || "audio/webm";
            }
            static isTypeSupported(_type: string) {
                return true;
            }
            start(_timeslice?: number) {
                this.started = true;
                // Emitimos algunos chunks falsos y dejamos que el test haga stop
                let ticks = 0;
                this.interval = window.setInterval(() => {
                    ticks++;
                    if (this.ondataavailable) {
                        const blob = new Blob([`chunk-${ticks}`], { type: "audio/webm" });
                        this.ondataavailable({ data: blob });
                    }
                    if (ticks >= 3) {
                        // suficiente para previsualizar
                        window.clearInterval(this.interval!);
                        this.interval = null;
                    }
                }, 100);
            }
            stop() {
                if (!this.started) return;
                this.started = false;
                if (this.onstop) this.onstop();
            }
        }
        (window as any).MediaRecorder = MockMediaRecorder;
    });
}

test.describe("MicButton - audio → /api/chat/audio", () => {
    test("graba (mock), previsualiza y envía (intercept POST) mostrando transcript + respuesta bot", async ({
        page,
    }) => {
        await injectMediaMocks(page);

        // Interceptar POST /api/chat/audio
        await page.route("**/api/chat/audio", async (route) => {
            const json = {
                ok: true,
                transcript: "hola, necesito ayuda con fracciones (desde test)",
                bot: {
                    messages: [
                        { text: "¡Claro! Empecemos con un ejemplo de fracciones." },
                        { buttons: [{ title: "1/2 + 1/3", payload: "/resolver_12_13" }] },
                    ],
                },
            };
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(json),
            });
        });

        // Abre la pantalla del chat (tu app expone /chat)
        await page.goto("/chat");

        // Debe existir el botón de mic
        const micBtn = page.getByTestId("chat-mic");
        await expect(micBtn).toBeVisible();

        // Start recording
        await micBtn.click();

        // Detener la grabación
        await page.getByRole("button", { name: "Detener grabación" }).click();

        // Enviar el audio
        await page.getByRole("button", { name: "Enviar audio" }).click();

        // Verifica que cae el transcript como mensaje del usuario
        await expect(
            page.getByText("hola, necesito ayuda con fracciones (desde test)")
        ).toBeVisible();

        // Verifica la respuesta del bot renderizada
        await expect(
            page.getByText("¡Claro! Empecemos con un ejemplo de fracciones.")
        ).toBeVisible();

        // Screenshot rápido de la zona del composer
        const composer = page.getByTestId("chat-composer");
        await expect(composer).toBeVisible();
        await composer.screenshot({ path: "playwright-report/composer-after-audio.png" });
    });
});