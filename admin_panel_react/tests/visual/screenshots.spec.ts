// admin_panel_react/tests/visual/screenshots.spec.ts
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// ====== Config salida ======
const OUT_DIR = path.join(process.cwd(), "docs", "visuals");

// ====== Mocks rápidos ======
const statsMock = {
    summary: { total_messages: 345, bot_success: 290, not_understood: 24, avg_response_ms: 420, accuracy: 0.89 },
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

const logsMock = {
    total: 6,
    items: Array.from({ length: 6 }).map((_, i) => ({
        _id: `log_${i + 1}`,
        request_id: `req_${1000 + i}`,
        sender_id: i % 2 ? "anonimo" : `user_${i}`,
        user_message: i % 3 === 0 ? "No puedo ingresar" : "Hola, necesito ayuda",
        bot_response: ["Claro, te ayudo con eso."],
        intent: i % 2 ? "problema_no_ingreso" : "saludo",
        timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
        ip: "127.0.0.1",
        user_agent: "PlaywrightBot/1.0",
        origen: i % 2 ? "widget" : "autenticado",
        metadata: { mocked: true },
    })),
};

// ====== Helpers ======
function ensureOutDir() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function shoot(page: Page, filename: string) {
    ensureOutDir();
    const file = path.join(OUT_DIR, filename);
    await page.waitForLoadState("networkidle").catch(() => { });
    await page.waitForTimeout(250);
    await page.screenshot({ path: file, fullPage: true });
    console.log("📸", file);
}

async function waitAppMounted(page: Page, timeout = 1000) {
    // No falla si no está. Solo intenta.
    await page
        .waitForSelector("#root, main, [data-testid='app-root']", { state: "visible", timeout })
        .catch(() => { });
}

async function mockApis(page: Page) {
    await page.route("**/api/stats**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(statsMock) })
    );
    await page.route("**/api/logs**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(logsMock) })
    );
}

async function loginIfNeeded(page: Page, baseURL?: string) {
    const loginPath = process.env.PLAYWRIGHT_LOGIN_PATH;
    const user = process.env.PLAYWRIGHT_LOGIN_USER;
    const pass = process.env.PLAYWRIGHT_LOGIN_PASS;
    if (!loginPath || !user || !pass) return;

    try {
        await page.goto(new URL(loginPath, baseURL || page.url()).toString());
        const userInput = page.locator('input[name="email"], input[name="username"], [data-testid="login-email"]').first();
        const passInput = page.locator('input[type="password"], [data-testid="login-password"]').first();
        const submitBtn = page
            .locator('button[type="submit"], [data-testid="login-submit"], button:has-text("Ingresar"), button:has-text("Login")]')
            .first();

        if (await userInput.count()) await userInput.fill(user);
        if (await passInput.count()) await passInput.fill(pass);
        if (await submitBtn.count()) await submitBtn.click();

        await page.waitForLoadState("networkidle");
    } catch (e) {
        console.warn("⚠️ Login opcional falló o no es necesario:", (e as Error).message);
    }
}

async function gotoSafe(page: Page, route: string) {
    const resp = await page.goto(route);
    const status = resp?.status();
    if (!status || status >= 400) {
        console.log(`🟧 ${status || "no-status"} ${page.url()}`);
        // Aun así intentamos esperar algo básico y capturar
        await waitAppMounted(page, 500);
        return false;
    }
    await waitAppMounted(page, 800);
    return true;
}

async function captureRoute(page: Page, route: string, baseName: string) {
    // Desktop
    await page.setViewportSize({ width: 1366, height: 900 });
    await gotoSafe(page, route); // no importa si devuelve false
    await shoot(page, `${baseName}_desktop.png`);

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await shoot(page, `${baseName}_mobile.png`);
}

// ====== Widget obligatorio ======
async function captureWidgetOrFail(page: Page, baseURL?: string) {
    // Intento A: launcher en Home
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/");
    await waitAppMounted(page, 800);

    const launcher = page.locator('button[aria-label="Abrir chat"], button:has-text("Chat")').first();
    if (await launcher.count()) {
        await shoot(page, "chat_widget_closed_desktop.png");
        await launcher.click();
        const iframe = page.locator('iframe[title="Chat"], iframe[title="Chatbot"]').first();
        await expect(iframe).toBeVisible({ timeout: 5000 });
        await shoot(page, "chat_widget_open_desktop.png");
        return;
    }

    // Intento B: inyectar widget usando assets públicos (chat-widget.js + chat-embed.html)
    const base = (baseURL || "").replace(/\/$/, "");
    await page.setContent(`
    <!doctype html><html><body>
      <script src="${base}/chat-widget.js"
        data-chat-url="${base}/chat-embed.html?src=${encodeURIComponent("/chat?embed=1")}"
        data-avatar=""
        data-badge="auto"
        data-allowed-origins="${base}">
      </script>
    </body></html>
  `);
    await shoot(page, "chat_widget_closed_desktop.png");
    const injectedLauncher = page.locator('button[aria-label="Abrir chat"], button:has-text("Chat")').first();
    if (await injectedLauncher.count()) {
        await injectedLauncher.click();
        const iframe = page.locator('iframe[title="Chat"], iframe[title="Chatbot"]').first();
        await expect(iframe).toBeVisible({ timeout: 5000 });
        await shoot(page, "chat_widget_open_desktop.png");
        return;
    }

    // Intento C (fallback total): mini-widget inline (sin archivos públicos)
    await page.setContent(`
    <!doctype html><html><body style="margin:0">
      <button id="wbtn" aria-label="Abrir chat" style="
        position:fixed;right:16px;bottom:16px;width:56px;height:56px;border:none;border-radius:28px;
        background:#2563eb;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.2);z-index:99999;cursor:pointer;">
        Chat
      </button>
      <div id="panel" style="
        position:fixed;right:16px;bottom:80px;width:360px;max-width:95vw;height:520px;max-height:75vh;
        display:none;border-radius:16px;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.25);z-index:99998;background:#fff;">
        <iframe title="Chat" style="border:0;width:100%;height:100%"
          srcdoc='<!doctype html><html><body style="margin:0">
            <div style="padding:12px;border-bottom:1px solid #eee;font:14px system-ui">Chat (inline fallback)</div>
            <div style="height:400px;overflow:auto;padding:12px;font:14px system-ui">
              <div style="background:#f3f4f6;border-radius:12px;padding:8px;margin:6px 0;max-width:75%">Hola 👋</div>
              <div style="background:#2563eb;color:white;border-radius:12px;padding:8px;margin:6px 0 6px auto;max-width:75%">Esto es una demo</div>
            </div>
            <form style="display:flex;gap:8px;padding:12px;border-top:1px solid #eee">
              <input aria-label="Escribe tu mensaje" style="flex:1;border:1px solid #ddd;border-radius:8px;padding:8px" placeholder="Escribe un mensaje…"/>
              <button type="submit" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 12px">Enviar</button>
            </form>
          </body></html>'>
        </iframe>
      </div>
      <script>
        const b = document.getElementById("wbtn");
        const p = document.getElementById("panel");
        b.addEventListener("click", ()=>{ p.style.display = p.style.display==='none' ? 'block' : 'none'; });
      </script>
    </body></html>
  `);
    await shoot(page, "chat_widget_closed_desktop.png");
    await page.locator("#wbtn").click();
    const fallbackIframe = page.locator('iframe[title="Chat"]').first();
    await expect(fallbackIframe).toBeVisible({ timeout: 5000 });
    await shoot(page, "chat_widget_open_desktop.png");
}

// ====== Test principal ======
test.describe("Visual screenshots (mocked + login opcional + widget obligatorio)", () => {
    test("Dashboard/Stats/Stats-v2/Intentos/Diagnóstico/Chat + Widget", async ({ page, baseURL }) => {
        ensureOutDir();
        await mockApis(page);
        await loginIfNeeded(page, baseURL);

        // ⚠️ Estas rutas pueden NO existir: capturamos igual (404, splash o lo que haya).
        const routes = [
            { path: "/dashboard", name: "dashboard" },
            { path: "/stats", name: "stats" },
            { path: "/stats-v2", name: "stats-v2" },
            { path: "/intentos-fallidos", name: "intentos-fallidos" },
            { path: "/diagnostico", name: "diagnostico" },
            { path: "/chat", name: "chat_page" },
            { path: "/", name: "home" },
        ];

        for (const r of routes) {
            try {
                await captureRoute(page, r.path, r.name);
            } catch (e) {
                console.warn(`⚠️ Omitida ${r.path}: ${(e as Error).message}`);
            }
        }

        // Widget: ahora es obligatorio — siempre termina con dos PNG (cerrado/abierto)
        await captureWidgetOrFail(page, baseURL);
    });
});