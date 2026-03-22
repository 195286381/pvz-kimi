import { test } from '@playwright/test';

test('debug TC-12', async ({ page }) => {
  const errors = [];
  page.on('console', msg => errors.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(`[ERR] ${err.message}`));
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.locator('#gameCanvas').click({ position: { x: 400, y: 327 } });
  await page.waitForTimeout(12000);
  
  console.log('ERRORS:', JSON.stringify(errors));
  await page.screenshot({ path: 'e2e/screenshots/debug_tc12.png' });
});
