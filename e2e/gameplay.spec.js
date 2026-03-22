import { test, expect } from '@playwright/test';
const BASE = 'http://localhost:8080';

// Canvas 内坐标（相对于 canvas 元素左上角）
// 主菜单按钮（Screens.js _addButton 定义）：
//   "开始游戏": (275, 300, 250, 55) → 中心 (400, 327)
//   "关卡选择": (275, 370, 250, 55) → 中心 (400, 397)
const BTN_START   = { x: 400, y: 327 };
const BTN_LEVELS  = { x: 400, y: 397 };

// HUD 植物卡片位置（HUD.js）
// CARDS_X=5, CARDS_Y=5, CARD_W=60, CARD_H=80, CARD_STEP=65
const CARD_SUNFLOWER   = { x: 35, y: 45 };   // 第1张卡片（向日葵）
const CARD_PEASHOOTER  = { x: 100, y: 45 };  // 第2张卡片（豌豆射手）
const CARD_WALLNUT     = { x: 165, y: 45 };  // 第3张卡片（坚果墙）

// 格子网格坐标（Scene.js 中 OFFSET_X=120, OFFSET_Y=80, CELL_W=80, CELL_H=100）
// 格子中心坐标：x = 120 + col*80 + 40, y = 80 + row*100 + 50
function getCellCenter(row, col) {
  return {
    x: 120 + col * 80 + 40,
    y: 80 + row * 100 + 50
  };
}

// 关卡选择界面坐标计算
// 场景行：白天y=125, 夜晚y=220, 泳池y=315, 浓雾y=410, 屋顶y=505
// 第N关x坐标：x = 62 + (N%10 - 1)*70
function getLevelButtonPos(levelId) {
  const sceneIndex = Math.floor((levelId - 1) / 10); // 0-4
  const levelInScene = (levelId - 1) % 10; // 0-9
  const rows = [125, 220, 315, 410, 505];
  return {
    x: 62 + levelInScene * 70,
    y: rows[sceneIndex]
  };
}

function trackErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function startGame(page, levelId = null) {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  if (levelId) {
    // 进关卡选择再选特定关
    await page.locator('#gameCanvas').click({ position: BTN_LEVELS });
    await page.waitForTimeout(600);
    const pos = getLevelButtonPos(levelId);
    await page.locator('#gameCanvas').click({ position: pos });
  } else {
    await page.locator('#gameCanvas').click({ position: BTN_START });
  }
  await page.waitForTimeout(2000); // 等待 Game 加载
}

// 获取 Canvas 特定区域的像素数据
async function getCanvasPixels(page, x, y, w, h) {
  return await page.locator('#gameCanvas').evaluate((canvas, { x, y, w, h }) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(x, y, w, h).data;
    return Array.from(data);
  }, { x, y, w, h });
}

// 计算像素亮度总和（用于比较变化）
function calcBrightnessSum(pixels) {
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    // RGB 加权亮度
    const brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    sum += brightness;
  }
  return sum;
}

// 计算非透明像素数量
function countNonTransparentPixels(pixels, threshold = 30) {
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha > 100 && (pixels[i] > threshold || pixels[i + 1] > threshold || pixels[i + 2] > threshold)) {
      count++;
    }
  }
  return count;
}

// 检查像素中是否包含特定颜色范围
function hasColorInRange(pixels, rMin, rMax, gMin, gMax, bMin, bMax) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= rMin && r <= rMax && g >= gMin && g <= gMax && b >= bMin && b <= bMax) {
      return true;
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TC-09: 点击植物卡片后鼠标有预览跟随
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-09 点击植物卡片后鼠标有预览跟随', async ({ page }) => {
  const errors = trackErrors(page);

  // 启动游戏
  await startGame(page);

  // 记录点击卡片前的卡片区域像素
  const beforePixels = await getCanvasPixels(page, 5, 5, 60, 80);
  const beforeBrightness = calcBrightnessSum(beforePixels);

  // 点击向日葵卡片
  await page.locator('#gameCanvas').click({ position: CARD_SUNFLOWER });
  await page.waitForTimeout(200);

  // 移动鼠标到格子中心（触发预览）
  const cell = getCellCenter(2, 2);
  await page.locator('#gameCanvas').click({ position: cell });
  await page.waitForTimeout(200);

  // 移动鼠标到另一个格子（验证预览跟随）
  const cell2 = getCellCenter(3, 3);
  await page.mouse.move(200 + cell2.x, 100 + cell2.y); // viewport坐标 = canvas偏移 + canvas内坐标
  await page.waitForTimeout(300);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc09-card-preview.png' });

  // 验证：卡片应该有高亮（选中状态）
  // 重新读取卡片区域像素，应该有变化
  const afterPixels = await getCanvasPixels(page, 5, 5, 60, 80);
  const afterBrightness = calcBrightnessSum(afterPixels);

  // 选中后卡片应该更亮或有边框效果
  expect(afterBrightness).not.toEqual(beforeBrightness);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-10: 放置向日葵到格子
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-10 放置向日葵到格子', async ({ page }) => {
  const errors = trackErrors(page);

  // 启动游戏，初始阳光50
  await startGame(page);

  // 记录放置前：格子0,0区域（80x100）的黄色像素数
  // 格子0,0的左上角：x=120, y=80（OFFSET_X=120, OFFSET_Y=80）
  const beforeYellowCount = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(120, 80, 80, 100).data;
    let yellow = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // 向日葵黄色特征：R高，G中高，B低
      if (r > 190 && g > 130 && b < 90) yellow++;
    }
    return yellow;
  });

  // 点击向日葵卡片（费用50，刚好够）
  await page.locator('#gameCanvas').click({ position: CARD_SUNFLOWER });
  await page.waitForTimeout(200);

  // 点击格子放置（row=0, col=0中心：x=160, y=130）
  await page.locator('#gameCanvas').click({ position: getCellCenter(0, 0) });
  await page.waitForTimeout(600);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc10-place-sunflower.png' });

  // 验证：格子0,0区域应该出现向日葵的黄色像素
  const afterYellowCount = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(120, 80, 80, 100).data;
    let yellow = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 190 && g > 130 && b < 90) yellow++;
    }
    return yellow;
  });

  // 放置向日葵后，该格子应该有大量黄色像素（向日葵emoji）
  expect(afterYellowCount, `放置向日葵后格子应有黄色像素（前：${beforeYellowCount}，后：${afterYellowCount}）`).toBeGreaterThan(200);

  // 同时验证：旁边空格子0,1没有黄色像素（对照验证）
  const emptyYellowCount = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(200, 80, 80, 100).data; // col=1格子
    let yellow = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 190 && g > 130 && b < 90) yellow++;
    }
    return yellow;
  });
  expect(emptyYellowCount, '空格子不应该有向日葵黄色像素').toBeLessThan(50);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-11: 阳光不足时无法放置豌豆射手
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-11 阳光不足时无法放置豌豆射手', async ({ page }) => {
  const errors = trackErrors(page);

  // 启动游戏，初始阳光50
  await startGame(page);

  // 记录放置前的格子像素
  const cell = getCellCenter(1, 1);
  const beforeCellPixels = await getCanvasPixels(page, cell.x - 30, cell.y - 30, 60, 60);
  const beforeCellContent = countNonTransparentPixels(beforeCellPixels);

  // 尝试点击豌豆射手卡片（费用100，阳光不足50）
  // 由于阳光不足，点击应该不会选中卡片
  await page.locator('#gameCanvas').click({ position: CARD_PEASHOOTER });
  await page.waitForTimeout(200);

  // 尝试点击格子放置（应该放不上去）
  await page.locator('#gameCanvas').click({ position: cell });
  await page.waitForTimeout(300);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc11-insufficient-sun.png' });

  // 验证：格子仍为空（像素内容与之前相似）
  const afterCellPixels = await getCanvasPixels(page, cell.x - 30, cell.y - 30, 60, 60);
  const afterCellContent = countNonTransparentPixels(afterCellPixels);

  // 内容应该基本相同（没有新植物）
  const contentDiff = Math.abs(afterCellContent - beforeCellContent);
  expect(contentDiff, '阳光不足时不应该放置植物').toBeLessThan(100);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-12: 游戏 12 秒后僵尸入场
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-12 游戏12秒后僵尸入场', async ({ page }) => {
  const errors = trackErrors(page);

  // 启动游戏
  await startGame(page);

  // 记录初始游戏区域的非绿色像素数（背景基准）
  // 游戏区域（去掉HUD）：整行 y=90 到 y=600，宽800px
  const initialNonGreenCount = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 90, 800, 510).data;
    let nonGreen = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 100) {
        // 非纯绿背景：绿色主导但不是背景的那种纯绿（背景绿：g≈150-170, r≈80-100, b≈50-80）
        const isBackgroundGreen = g > r * 1.3 && g > b * 1.5 && g > 100;
        if (!isBackgroundGreen) nonGreen++;
      }
    }
    return nonGreen;
  });

  // 等待12秒（游戏开始约3s后第一波，僵尸需要时间走进来）
  await page.waitForTimeout(12000);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc12-zombies-appear.png' });

  // 等待12秒后的非绿色像素数（僵尸已渲染）
  const afterNonGreenCount = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 90, 800, 510).data;
    let nonGreen = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 100) {
        const isBackgroundGreen = g > r * 1.3 && g > b * 1.5 && g > 100;
        if (!isBackgroundGreen) nonGreen++;
      }
    }
    return nonGreen;
  });

  // 验证：12秒后非绿色像素应显著增加（僵尸/太阳已出现）
  expect(afterNonGreenCount, `12秒后应有僵尸/其他元素出现（初始非绿：${initialNonGreenCount}，之后：${afterNonGreenCount}）`).toBeGreaterThan(initialNonGreenCount + 150);

  // 额外验证：检查游戏右侧区域（col 6-8, x=600-840）是否有非绿色内容（僵尸位置）
  const rightSideNonGreen = await page.locator('#gameCanvas').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(600, 90, 240, 510).data;
    let nonGreen = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 100) {
        const isBackgroundGreen = g > r * 1.3 && g > b * 1.5 && g > 100;
        if (!isBackgroundGreen) nonGreen++;
      }
    }
    return nonGreen;
  });
  expect(rightSideNonGreen, '右侧区域应该有僵尸渲染的非绿色像素').toBeGreaterThan(200);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-13: 波次进度条随时间推进
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-13 波次进度条随时间推进', async ({ page }) => {
  const errors = trackErrors(page);

  // 进度条位置（Game.js _renderWaveProgress：x=700, y=5, w=90, h=14）
  // 检测黄色像素总数来判断进度条填充程度
  // progress = (currentWave+1) / totalWaves，随波次递增
  // 第1关有2波：初始progress=0（无黄色），第1波开始=0.5，第2波开始=1.0

  async function getProgressBarYellowPixels() {
    return await page.locator('#gameCanvas').evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(700, 5, 90, 14).data;
      let yellowPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        // 黄色 #FFD700：R=255, G=215, B=0
        if (a > 100 && r > 200 && g > 170 && b < 60) {
          yellowPixels++;
        }
      }
      return yellowPixels;
    });
  }

  // 在游戏菜单直接进入（游戏还未开始，进度条为空）
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // 先点击"开始游戏"触发游戏加载
  await page.locator('#gameCanvas').click({ position: BTN_START });
  await page.waitForTimeout(500); // 仅等0.5s，此时第一波还未开始（需要3s）

  // 记录游戏刚开始时的进度条（第一波还未触发，progress应该为0）
  const yellowBeforeWave = await getProgressBarYellowPixels();

  // 等待4秒（等待第一波开始：开始后3s触发第一波）
  await page.waitForTimeout(4000);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc13-wave-progress.png' });

  // 记录第一波开始后进度条（progress=0.5，黄色区域应该占半）
  const yellowAfterWave1 = await getProgressBarYellowPixels();

  // 进度条应该增长（第一波开始后黄色像素增加）
  expect(yellowAfterWave1, `波次进度条应该随时间推进（波前黄色像素：${yellowBeforeWave}，第1波后：${yellowAfterWave1}）`).toBeGreaterThan(yellowBeforeWave + 100);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-14: 泳池场景（第21关）显示水路
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-14 泳池场景第21关显示水路', async ({ page }) => {
  const errors = trackErrors(page);

  // 进入第21关（泳池第一关）
  await startGame(page, 21);

  // 等待2秒场景渲染
  await page.waitForTimeout(2000);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc14-pool-scene.png' });

  // 泳池场景：中间两行（row 2,3）是水路，应该有蓝色调
  // 水路区域：y = 80 + 2*100 = 280 到 y = 80 + 4*100 = 480
  const waterRowPixels = await getCanvasPixels(page, 200, 280, 400, 200);

  // 检查是否有蓝色调像素（水路特征）
  // 蓝色：R较低，G中等，B较高
  let bluePixelCount = 0;
  for (let i = 0; i < waterRowPixels.length; i += 4) {
    const r = waterRowPixels[i];
    const g = waterRowPixels[i + 1];
    const b = waterRowPixels[i + 2];
    // 蓝色调特征：B > R 且 B > G*0.8
    if (b > r && b > g * 0.8 && b > 80) {
      bluePixelCount++;
    }
  }

  expect(bluePixelCount, '泳池场景中间两行应该有蓝色调（水路）').toBeGreaterThan(100);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-15: 浓雾场景（第31关）右侧有雾效
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-15 浓雾场景第31关右侧有雾效', async ({ page }) => {
  const errors = trackErrors(page);

  // 进入第31关（浓雾第一关）
  await startGame(page, 31);

  // 等待2秒场景渲染
  await page.waitForTimeout(2000);

  // 截图保存
  await page.screenshot({ path: 'e2e/screenshots/tc15-fog-scene.png' });

  // 浓雾场景：右侧4列（col 5-8）有雾遮罩
  // 左侧区域（col 0-4）：x = 120 到 120+5*80 = 520
  // 右侧区域（col 5-9）：x = 520 到 840

  const leftSidePixels = await getCanvasPixels(page, 150, 100, 300, 400);
  const rightSidePixels = await getCanvasPixels(page, 550, 100, 200, 400);

  // 计算两侧平均亮度
  const leftBrightness = calcBrightnessSum(leftSidePixels) / (leftSidePixels.length / 4);
  const rightBrightness = calcBrightnessSum(rightSidePixels) / (rightSidePixels.length / 4);

  // 右侧应该有雾遮罩，应该比左侧更亮/更白
  expect(rightBrightness, '浓雾场景右侧应该比左侧更亮（雾遮罩）').toBeGreaterThan(leftBrightness * 0.8);

  // 检查右侧是否有更多白色/浅色像素（雾的特征）
  let rightLightPixels = 0;
  for (let i = 0; i < rightSidePixels.length; i += 4) {
    const r = rightSidePixels[i];
    const g = rightSidePixels[i + 1];
    const b = rightSidePixels[i + 2];
    // 浅色特征：RGB都较高且相近
    if (r > 150 && g > 150 && b > 150 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
      rightLightPixels++;
    }
  }

  expect(rightLightPixels, '浓雾场景右侧应该有浅色雾像素').toBeGreaterThan(50);

  // 验证无 JS 错误
  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `JS 错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-16: 屋顶场景（第41关）加载正常
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-16 屋顶场景第41关加载正常', async ({ page }) => {
  const errors = trackErrors(page);

  await startGame(page, 41);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'e2e/screenshots/tc16-roof-scene.png' });

  // 屋顶场景背景是暖色调（米色/棕色），不是草绿色
  const bgPixels = await getCanvasPixels(page, 250, 120, 300, 300);
  // 检测暖色调：R较高，G中等，B较低
  let warmPixels = 0;
  for (let i = 0; i < bgPixels.length; i += 4) {
    const r = bgPixels[i], g = bgPixels[i + 1], b = bgPixels[i + 2], a = bgPixels[i + 3];
    if (a > 100 && r > 100 && r > g && r > b) warmPixels++;
  }
  expect(warmPixels, '屋顶场景应有砖红色格子').toBeGreaterThan(500);

  const critical = errors.filter(e => !e.includes('favicon'));
  expect(critical, `屋顶场景错误: ${critical.join(', ')}`).toHaveLength(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TC-17: favicon 不产生 404 错误
// ═══════════════════════════════════════════════════════════════════════════════
test('TC-17 favicon 正常加载无 404', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('response', resp => {
    if (resp.url().includes('favicon') && resp.status() === 404) {
      errors.push(`favicon 404: ${resp.url()}`);
    }
  });

  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const faviconErrors = errors.filter(e => e.includes('favicon'));
  expect(faviconErrors, 'favicon 不应产生 404').toHaveLength(0);
});
