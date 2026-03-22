import { test } from '@playwright/test';

test('debug canvas coords', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    return { rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
             canvasW: canvas.width, canvasH: canvas.height };
  });
  console.log('CANVAS_INFO:', JSON.stringify(info));
});
