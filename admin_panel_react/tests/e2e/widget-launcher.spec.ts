import { test, expect } from '@playwright/test';

test('launcher inyecta botón y abre panel', async ({ page, baseURL }) => {
    const embedSrc = `${baseURL}/chat-embed.html?src=${encodeURIComponent('/chat?embed=1')}`;

    await page.setContent(`
    <!doctype html><html><body>
      <script src="${baseURL}/chat-widget.js"
        data-chat-url="${embedSrc}"
        data-avatar="${baseURL}/bot-avatar.png"
        data-badge="auto"
        data-allowed-origins="${baseURL}">
      </script>
    </body></html>
  `);

    const button = page.locator('button[aria-label="Abrir chat"]');
    await expect(button).toBeVisible();

    await button.click();

    // Panel con iframe title="Chat" (por default del launcher)
    const iframe = page.locator('iframe[title="Chat"]');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /chat-embed\.html\?/);
});