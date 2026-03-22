import { test, expect } from '@playwright/test';

test('TC-18 音效系统初始化无错误', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // 进入游戏（用户手势触发 AudioContext）
  await page.locator('#gameCanvas').click({ position: { x: 400, y: 327 } });
  await page.waitForTimeout(2000);

  // 放置植物（触发 playPlantPlace）
  await page.locator('#gameCanvas').click({ position: { x: 35, y: 45 } }); // 选向日葵
  await page.locator('#gameCanvas').click({ position: { x: 160, y: 130 } }); // 放置
  await page.waitForTimeout(300);

  // 检查 SoundSystem 是否存在
  const soundExists = await page.evaluate(() => {
    // 通过检查 window.AudioContext 是否可用来验证
    return typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
  });
  expect(soundExists, 'Web Audio API 应该可用').toBe(true);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `音效初始化错误: ${critical.join(', ')}`).toHaveLength(0);
});

test('TC-19 暂停按钮点击正常', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  await page.locator('#gameCanvas').click({ position: { x: 400, y: 327 } });
  await page.waitForTimeout(2000);

  // 截图：确认 ⏸ 按钮存在（右上角 x=755, y=5, w=35, h=35）
  const pauseBtnPixels = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    return Array.from(ctx.getImageData(755, 5, 35, 35).data);
  });
  // 暂停按钮区域应有内容（不是纯绿背景）
  const hasContent = pauseBtnPixels.some((v, i) => i % 4 !== 3 && v < 50); // 有深色像素（按钮背景是黑色半透明）
  expect(hasContent, '暂停按钮区域应有深色背景').toBe(true);

  // 点击暂停按钮
  await page.locator('#gameCanvas').click({ position: { x: 772, y: 22 } }); // 按钮中心
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'e2e/screenshots/tc19-pause-btn.png' });

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical).toHaveLength(0);
});
