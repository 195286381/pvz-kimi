import { Scene } from './Scene.js';
import { Grid } from '../core/Grid.js';

// 预计算涟漪初始相位（装饰用）
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// 水面涟漪位置（水路行视觉点缀）
const RIPPLES = (() => {
  const rand = seededRandom(303);
  const result = [];
  for (let i = 0; i < 16; i++) {
    result.push({
      x: 120 + rand() * 720,
      phase: rand() * Math.PI * 2,
      speed: 1.0 + rand() * 1.5,
    });
  }
  return result;
})();

/** 泳池场景水路行（0-indexed，视觉第3、4行）*/
export const POOL_WATER_ROWS = [2, 3];

export class PoolScene extends Scene {
  /**
   * @param {Grid} grid  6行×9列格子（泳池场景专用）
   */
  constructor(grid) {
    super(grid);
    this.sceneType = 'pool';
    this._hoveredCell = null;
    this._time = 0;

    // 将第2、3行标记为水路（影响植物放置规则）
    grid.setWaterRows(POOL_WATER_ROWS);
  }

  setHoveredCell(cell) {
    this._hoveredCell = cell;
  }

  update(dt) {
    this._time += dt;
  }

  render(renderer) {
    this._drawBackground(renderer);
    this._drawGrid(renderer);
    this._drawWaterSurface(renderer);
  }

  // ─── 背景 ────────────────────────────────────────────────────

  _drawBackground(renderer) {
    const ctx = renderer.ctx;
    const W = renderer.width;
    const H = renderer.height;

    // 天空（浅蓝）
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    skyGrad.addColorStop(0, '#6ec6f5');
    skyGrad.addColorStop(1, '#b3e5fc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 底部草地
    renderer.drawRect(0, H - 40, W, 40, '#3a7d1e');

    // 远处云朵
    this._drawClouds(renderer);
  }

  _drawClouds(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffffff';
    const clouds = [
      { x: 200, y: 30, rx: 45, ry: 18 },
      { x: 550, y: 20, rx: 55, ry: 20 },
      { x: 800, y: 35, rx: 40, ry: 15 },
    ];
    for (const cl of clouds) {
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.rx, cl.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cl.x - 20, cl.y + 8, cl.rx * 0.7, cl.ry * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cl.x + 20, cl.y + 5, cl.rx * 0.65, cl.ry * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── 格子 ────────────────────────────────────────────────────

  _drawGrid(renderer) {
    const { rows, cols } = this.grid;
    const ctx = renderer.ctx;

    for (let r = 0; r < rows; r++) {
      const isWaterRow = POOL_WATER_ROWS.includes(r);

      for (let c = 0; c < cols; c++) {
        const rect = this.grid.getCellRect(r, c);
        const isEven = (r + c) % 2 === 0;

        if (isWaterRow) {
          // 水路格：蓝色
          const waterColor = isEven
            ? 'rgba(30, 120, 200, 0.60)'
            : 'rgba(20, 100, 180, 0.60)';
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, waterColor);
        } else {
          // 陆地格：草绿
          const landColor = isEven
            ? 'rgba(80, 160, 40, 0.55)'
            : 'rgba(100, 180, 50, 0.55)';
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, landColor);
        }

        // 悬停高亮
        if (
          this._hoveredCell &&
          this._hoveredCell.row === r &&
          this._hoveredCell.col === c
        ) {
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, 'rgba(255,255,100,0.35)');
        }

        // 格子边框
        ctx.strokeStyle = isWaterRow
          ? 'rgba(10, 80, 160, 0.5)'
          : 'rgba(60, 120, 30, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }
  }

  // ─── 水面波纹（水路行叠加） ───────────────────────────────────

  _drawWaterSurface(renderer) {
    const ctx = renderer.ctx;
    ctx.save();

    // 绘制水路行顶部的水面高光线（波纹动画）
    for (const waterRow of POOL_WATER_ROWS) {
      const rect = this.grid.getCellRect(waterRow, 0);
      const y0 = rect.y;
      const rowH = rect.h;
      const rowW = Grid.CELL_W * this.grid.cols;
      const x0 = rect.x;

      // 水面半透明蓝色叠加
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#00bfff';
      ctx.fillRect(x0, y0, rowW, rowH);

      // 波纹高光线
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#80d8ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < RIPPLES.length; i++) {
        const rip = RIPPLES[i];
        if (rip.x < x0 || rip.x > x0 + rowW) continue;
        const waveY = y0 + rowH * 0.35 + 3 * Math.sin(this._time * rip.speed + rip.phase);
        ctx.moveTo(rip.x - 12, waveY);
        ctx.quadraticCurveTo(rip.x, waveY - 4, rip.x + 12, waveY);
      }
      ctx.stroke();

      // 水路标识文字（左侧提示）
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#b3e5fc';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌊', x0 - 6, y0 + rowH / 2);
    }

    ctx.restore();
  }
}
