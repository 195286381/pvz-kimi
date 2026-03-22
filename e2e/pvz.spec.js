import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';

// Canvas 内坐标（相对于 canvas 元素左上角）
// 主菜单按钮（Screens.js _addButton 定义）：
//   "开始游戏": (275, 300, 250, 55) → 中心 (400, 327)
//   "关卡选择": (275, 370, 250, 55) → 中心 (400, 397)
const BTN_START   = { x: 400, y: 327 };
const BTN_LEVELS  = { x: 400, y: 397 };

function trackErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

// ─── TC-01: 主菜单渲染 ────────────────────────────────────────────────────
test('TC-01 主菜单正确渲染，无 JS 错误', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'e2e/screenshots/tc01-main-menu.png' });

  const canvas = page.locator('#gameCanvas');
  await expect(canvas).toBeVisible();

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ─── TC-02: 点击"开始游戏"进入游戏场景 ─────────────────────────────────────
test('TC-02 点击"开始游戏"进入白天草坪关卡', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(2500); // 等待 Game 动态加载

  await page.screenshot({ path: 'e2e/screenshots/tc02-gameplay.png' });

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);

  // HUD 顶部区域有内容（游戏已启动）
  const hudPixels = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, 800, 90).data;
    return Array.from(data).filter((v, i) => i % 4 !== 3 && v > 30).length;
  });
  expect(hudPixels, 'HUD 应有渲染内容').toBeGreaterThan(200);
});

// ─── TC-03: 关卡选择界面 ─────────────────────────────────────────────────
test('TC-03 关卡选择界面正确显示', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  await page.locator('#gameCanvas').click({ position: BTN_LEVELS });
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'e2e/screenshots/tc03-level-select.png' });

  // Canvas 内容发生变化（不再是纯绿主菜单背景）
  const pixelSample = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    return Array.from(ctx.getImageData(400, 100, 1, 1).data);
  });
  expect(pixelSample.some(v => v > 10)).toBe(true);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ─── TC-04: 游戏运行 5 秒内无错误 ──────────────────────────────────────────
test('TC-04 游戏运行 5 秒保持稳定（无崩溃）', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'e2e/screenshots/tc04-5sec-stable.png' });

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `游戏运行 5 秒内出现错误:\n${critical.join('\n')}`).toHaveLength(0);
});

// ─── TC-05: 按 ESC 暂停 ───────────────────────────────────────────────────
test('TC-05 按 ESC 键弹出暂停界面', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(2000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'e2e/screenshots/tc05-paused.png' });

  // 暂停后 Canvas 有遮罩内容
  const centerPixel = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    return Array.from(ctx.getImageData(400, 300, 1, 1).data);
  });
  expect(centerPixel.some(v => v > 0)).toBe(true);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical).toHaveLength(0);
});

// ─── TC-06: HUD 植物卡片渲染 ─────────────────────────────────────────────
test('TC-06 游戏内 HUD 植物卡片有内容', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(2000);

  // 植物卡片区域（x: 5-540, y: 5-85）
  const cardPixels = await page.locator('#gameCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(5, 5, 535, 80).data;
    return Array.from(data).filter((v, i) => i % 4 !== 3 && v > 30).length;
  });

  await page.screenshot({ path: 'e2e/screenshots/tc06-hud.png' });
  expect(cardPixels, '植物卡片区域应有渲染内容').toBeGreaterThan(500);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical).toHaveLength(0);
});

// ─── TC-07: 右键取消选择不产生错误 ─────────────────────────────────────────
test('TC-07 右键点击 Canvas 不产生错误', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(1500);

  await page.locator('#gameCanvas').click({ button: 'right', position: { x: 400, y: 300 } });
  await page.waitForTimeout(300);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical).toHaveLength(0);
});

// ─── TC-08: 夜晚场景无错误 ────────────────────────────────────────────────
test('TC-08 关卡11（夜晚场景）加载无错误', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // 进入关卡选择
  await page.locator('#gameCanvas').click({ position: BTN_LEVELS });
  await page.waitForTimeout(800);

  // 第11关按钮：第2行场景(y≈175)，第1个按钮(x≈62)
  await page.locator('#gameCanvas').click({ position: { x: 62, y: 175 } });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'e2e/screenshots/tc08-night-scene.png' });

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `夜晚场景错误: ${critical.join(', ')}`).toHaveLength(0);
});
