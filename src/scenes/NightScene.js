import { Scene } from './Scene.js';
import { Grid } from '../core/Grid.js';

// 预计算星星位置（确定性分布）
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const STARS = (() => {
  const rand = seededRandom(101);
  const result = [];
  for (let i = 0; i < 80; i++) {
    result.push({
      x: rand() * 960,
      y: rand() * 200,
      r: 0.5 + rand() * 1.5,
      twinkle: rand() * Math.PI * 2, // 初始相位
    });
  }
  return result;
})();

// 萤火虫（点缀在格子区域）
const FIREFLIES = (() => {
  const rand = seededRandom(202);
  const result = [];
  for (let i = 0; i < 12; i++) {
    result.push({
      x: 120 + rand() * 720,
      y: 80 + rand() * 500,
      phase: rand() * Math.PI * 2,
      speed: 0.8 + rand() * 1.2,
    });
  }
  return result;
})();

export class NightScene extends Scene {
  /**
   * @param {Grid} grid  5行×9列格子
   */
  constructor(grid) {
    super(grid);
    this.sceneType = 'night';
    this._hoveredCell = null;
    this._time = 0; // 累计时间，用于动画
  }

  setHoveredCell(cell) {
    this._hoveredCell = cell;
  }

  update(dt) {
    this._time += dt;
  }

  render(renderer) {
    this._drawBackground(renderer);
    this._drawStars(renderer);
    this._drawMoon(renderer);
    this._drawFireflies(renderer);
    this._drawGrid(renderer);
  }

  // ─── 背景 ────────────────────────────────────────────────────

  _drawBackground(renderer) {
    const ctx = renderer.ctx;
    const W = renderer.width;
    const H = renderer.height;

    // 夜空渐变（深蓝→深紫）
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.75);
    skyGrad.addColorStop(0, '#0a0a2e');
    skyGrad.addColorStop(0.6, '#1a1a4a');
    skyGrad.addColorStop(1, '#2d3a1e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 底部深绿草地（夜间调暗）
    renderer.drawRect(0, H - 40, W, 40, '#1c3a0a');
  }

  _drawStars(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    for (const star of STARS) {
      const twinkle = 0.5 + 0.5 * Math.sin(this._time * 2 + star.twinkle);
      ctx.globalAlpha = 0.4 + 0.6 * twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawMoon(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    // 月亮（右上角）
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.arc(880, 55, 35, 0, Math.PI * 2);
    ctx.fill();
    // 月牙遮挡（缺口）
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0a0a2e';
    ctx.beginPath();
    ctx.arc(870, 50, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawFireflies(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    for (const ff of FIREFLIES) {
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(this._time * ff.speed + ff.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ccff00';
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // 光晕
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = '#ccff66';
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawGrid(renderer) {
    const { rows, cols } = this.grid;
    const ctx = renderer.ctx;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = this.grid.getCellRect(r, c);
        const isEven = (r + c) % 2 === 0;

        // 夜间草地格子（深绿色调）
        const cellColor = isEven
          ? 'rgba(20, 60, 15, 0.65)'
          : 'rgba(30, 75, 20, 0.65)';
        renderer.drawRect(rect.x, rect.y, rect.w, rect.h, cellColor);

        // 悬停高亮
        if (
          this._hoveredCell &&
          this._hoveredCell.row === r &&
          this._hoveredCell.col === c
        ) {
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, 'rgba(200,255,100,0.3)');
        }

        // 格子边框（暗蓝色调）
        ctx.strokeStyle = 'rgba(30, 80, 120, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }
  }
}
