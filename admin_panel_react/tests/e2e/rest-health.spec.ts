import { test, expect } from '@playwright/test';

test('backend /api/chat/health responde 2xx', async ({ request, baseURL }) => {
    const base = process.env.CHAT_BASE || `${baseURL}/api/chat`;
    const url = `${base.replace(/\/$/, '')}/health`;
    const res = await request.get(url);
    expect(res.ok()).toBeTruthy();
});