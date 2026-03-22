import { Scene } from './Scene.js';
import { Grid } from '../core/Grid.js';

/**
 * RoofScene — 屋顶场景
 *
 * 特殊规则：
 *   - 普通植物需先放花盆（flowerpot）才能种植
 *   - 花盆被摧毁时上层植物一并移除
 *   - 僵尸从屋顶右侧投石车空降（由 WaveSystem 处理入场坐标偏移）
 *   - sceneType = 'roof'（供植物/系统逻辑读取）
 */
export class RoofScene extends Scene {
  /**
   * @param {Grid} grid  5行×9列格子
   */
  constructor(grid) {
    super(grid);
    this.sceneType = 'roof';
    this.isRoof = true;   // Game 据此要求花盆才能种植普通植物
    this._hoveredCell = null;
    this._time = 0;
  }

  setHoveredCell(cell) {
    this._hoveredCell = cell;
  }

  update(dt) {
    this._time += dt;
  }

  render(renderer) {
    this._drawBackground(renderer);
    this._drawRoofTiles(renderer);
    this._drawGrid(renderer);
    this._drawChimney(renderer);
  }

  // ─── 背景（天空） ─────────────────────────────────────────────

  _drawBackground(renderer) {
    const ctx = renderer.ctx;
    const W = renderer.width;
    const H = renderer.height;

    // 天空（下午/黄昏暖色）
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyGrad.addColorStop(0, '#f9a825');
    skyGrad.addColorStop(0.4, '#ffcc80');
    skyGrad.addColorStop(1, '#c8a060');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 太阳
    this._drawSun(renderer);

    // 远处房屋剪影
    this._drawHouseSilhouettes(renderer);
  }

  _drawSun(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    // 光晕
    const glowGrad = ctx.createRadialGradient(120, 55, 5, 120, 55, 55);
    glowGrad.addColorStop(0, 'rgba(255, 240, 100, 0.5)');
    glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(120, 55, 55, 0, Math.PI * 2);
    ctx.fill();
    // 太阳本体
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.arc(120, 55, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawHouseSilhouettes(renderer) {
    const ctx = renderer.ctx;
    const H = renderer.height;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#3e2a10';

    // 左侧远处房屋
    const houses = [
      { x: 30, w: 60, h: 80, roofH: 30 },
      { x: 870, w: 70, h: 90, roofH: 35 },
    ];
    for (const h of houses) {
      const baseY = H - 40 - h.h;
      ctx.fillRect(h.x, baseY, h.w, h.h);
      ctx.beginPath();
      ctx.moveTo(h.x - 5, baseY);
      ctx.lineTo(h.x + h.w / 2, baseY - h.roofH);
      ctx.lineTo(h.x + h.w + 5, baseY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── 屋顶瓦片（格子背景） ─────────────────────────────────────

  _drawRoofTiles(renderer) {
    const ctx = renderer.ctx;
    const tileW = 40;
    const tileH = 22;

    // 屋顶区域
    const roofX = Grid.OFFSET_X;
    const roofY = Grid.OFFSET_Y - 10;
    const roofW = Grid.CELL_W * this.grid.cols;
    const roofH = Grid.CELL_H * this.grid.rows + 20;

    ctx.save();
    ctx.beginPath();
    ctx.rect(roofX, roofY, roofW, roofH);
    ctx.clip();

    // 瓦片底色
    const roofGrad = ctx.createLinearGradient(0, roofY, 0, roofY + roofH);
    roofGrad.addColorStop(0, '#b5651d');
    roofGrad.addColorStop(0.5, '#a0522d');
    roofGrad.addColorStop(1, '#8b4513');
    ctx.fillStyle = roofGrad;
    ctx.fillRect(roofX, roofY, roofW, roofH);

    // 瓦片纹路
    ctx.strokeStyle = 'rgba(60, 30, 0, 0.35)';
    ctx.lineWidth = 1;
    const cols = Math.ceil(roofW / tileW) + 2;
    const rows = Math.ceil(roofH / tileH) + 2;

    for (let row = 0; row < rows; row++) {
      const xShift = (row % 2) * (tileW / 2); // 错位排列
      for (let col = -1; col < cols; col++) {
        const tx = roofX + col * tileW + xShift;
        const ty = roofY + row * tileH;
        // 弧形瓦片轮廓
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + tileW, ty);
        ctx.quadraticCurveTo(tx + tileW, ty + tileH, tx + tileW / 2, ty + tileH);
        ctx.quadraticCurveTo(tx, ty + tileH, tx, ty);
        ctx.stroke();
        // 瓦片高光
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(tx + tileW / 2, ty + tileH * 0.35, tileW * 0.3, tileH * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  // ─── 格子覆盖（透明叠加） ─────────────────────────────────────

  _drawGrid(renderer) {
    const { rows, cols } = this.grid;
    const ctx = renderer.ctx;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = this.grid.getCellRect(r, c);
        const isEven = (r + c) % 2 === 0;

        // 半透明叠加（让瓦片底纹透出）
        const cellColor = isEven
          ? 'rgba(160, 80, 20, 0.28)'
          : 'rgba(130, 65, 15, 0.28)';
        renderer.drawRect(rect.x, rect.y, rect.w, rect.h, cellColor);

        // 悬停高亮
        if (
          this._hoveredCell &&
          this._hoveredCell.row === r &&
          this._hoveredCell.col === c
        ) {
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, 'rgba(255,220,80,0.45)');
        }

        // 格子边框
        ctx.strokeStyle = 'rgba(80, 40, 10, 0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    // 花盆提示（空格子右下角显示小花盆图标）
    this._drawFlowerpotHints(renderer);
  }

  /**
   * 空格子右下角绘制半透明花盆图标（提示玩家需要花盆）
   * 仅在格子为空时显示
   */
  _drawFlowerpotHints(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.globalAlpha = 0.18;
    const { rows, cols } = this.grid;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const state = this.grid.getState(r, c);
        if (state === 'empty') {
          const rect = this.grid.getCellRect(r, c);
          ctx.font = '14px Arial';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText('🪴', rect.x + rect.w - 4, rect.y + rect.h - 4);
        }
      }
    }
    ctx.restore();
  }

  // ─── 烟囱装饰 ─────────────────────────────────────────────────

  _drawChimney(renderer) {
    const ctx = renderer.ctx;
    ctx.save();

    const cx = 930;
    const cy = Grid.OFFSET_Y + 20;
    const cw = 28;
    const ch = 70;

    // 烟囱本体
    ctx.fillStyle = '#6d3c1f';
    ctx.fillRect(cx, cy, cw, ch);
    // 烟囱顶帽
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(cx - 5, cy, cw + 10, 10);
    // 砖缝
    ctx.strokeStyle = 'rgba(40, 20, 5, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + i * 14);
      ctx.lineTo(cx + cw, cy + i * 14);
      ctx.stroke();
    }

    // 烟雾（简单圆圈向上漂）
    const smokeFrames = [0, 0.4, 0.8];
    for (const offset of smokeFrames) {
      const t = ((this._time * 0.3 + offset) % 1);
      const sy = cy - t * 50;
      const sr = 6 + t * 12;
      const alpha = 0.35 * (1 - t);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.arc(cx + cw / 2 + Math.sin(t * Math.PI * 2) * 5, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
