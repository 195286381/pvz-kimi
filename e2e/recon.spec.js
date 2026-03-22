import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';

test('侦察：截图主菜单', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'e2e/screenshots/01-main-menu.png', fullPage: true });
  console.log('Console errors:', errors);
  expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
});
