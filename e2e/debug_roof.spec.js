import { test } from '@playwright/test';

test('debug roof colors', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  
  await page.locator('#gameCanvas').click({ position: { x: 400, y: 397 } }); // level select
  await page.waitForTimeout(600);
  await page.locator('#gameCanvas').click({ position: { x: 62, y: 505 } }); // level 41
  await page.waitForTimeout(2000);

  const sample = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const points = [[300,200],[400,300],[200,250],[500,200],[350,350]];
    return points.map(([x,y]) => {
      const d = ctx.getImageData(x,y,1,1).data;
      return { x, y, r: d[0], g: d[1], b: d[2], a: d[3] };
    });
  });
  console.log('ROOF PIXELS:', JSON.stringify(sample));
});
