import { test } from '@playwright/test';

test('runtime inspection - 实际游戏运行检查', async ({ page }) => {
  const logs = [];
  page.on('console', msg => { if (msg.type() !== 'log') logs.push(`[${msg.type()}] ${msg.text()}`); });
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('#gameCanvas').click({ position: { x: 400, y: 327 } });
  await page.waitForTimeout(3000);

  // 放植物
  await page.locator('#gameCanvas').click({ position: { x: 35, y: 45 } }); // 向日葵 row0,col0
  await page.locator('#gameCanvas').click({ position: { x: 160, y: 130 } });
  await page.waitForTimeout(300);

  // 等16秒让僵尸入场并攻击
  await page.waitForTimeout(16000);

  console.log('=== Runtime Logs ===');
  logs.forEach(l => console.log(l));

  await page.screenshot({ path: 'e2e/screenshots/runtime_inspect.png' });
});
