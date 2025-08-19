export async function injectMediaMocks(page) {
    await page.addInitScript(() => {
        navigator.mediaDevices = navigator.mediaDevices || ({} as any);
        navigator.mediaDevices.getUserMedia = async () => ({
            getTracks: () => [{ stop: () => { } }],
        });

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
            start() {
                this.started = true;
                let ticks = 0;
                this.interval = window.setInterval(() => {
                    ticks++;
                    this.ondataavailable?.({ data: new Blob([`chunk-${ticks}`], { type: "audio/webm" }) });
                    if (ticks >= 3) {
                        window.clearInterval(this.interval!);
                        this.interval = null;
                    }
                }, 100);
            }
            stop() {
                if (!this.started) return;
                this.started = false;
                this.onstop?.();
            }
        }
        (window as any).MediaRecorder = MockMediaRecorder;
    });
}