import { Scene } from './Scene.js';
import { Grid } from '../core/Grid.js';

// 雾气粒子（预计算位置，用于动画）
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// 右侧浓雾覆盖列（col 5-8，共4列）
export const FOG_START_COL = 5;

// 雾气层定义（不同深度的漂移层）
const FOG_LAYERS = (() => {
  const rand = seededRandom(404);
  const result = [];
  for (let i = 0; i < 18; i++) {
    result.push({
      // 初始 x 相对于雾区起始像素的偏移
      xOffset: rand() * 600,
      y: 60 + rand() * 560,
      w: 120 + rand() * 200,
      h: 60 + rand() * 100,
      speed: 6 + rand() * 14,   // 漂移速度 px/s
      alpha: 0.08 + rand() * 0.14,
    });
  }
  return result;
})();

export class FogScene extends Scene {
  /**
   * @param {Grid} grid  5行×9列格子
   */
  constructor(grid) {
    super(grid);
    this.sceneType = 'fog';
    this._hoveredCell = null;
    this._time = 0;
    // 雾气层漂移累计偏移
    this._fogOffsets = FOG_LAYERS.map(l => l.xOffset);
  }

  setHoveredCell(cell) {
    this._hoveredCell = cell;
  }

  update(dt) {
    this._time += dt;
    // 雾气向左漂移（循环）
    for (let i = 0; i < FOG_LAYERS.length; i++) {
      this._fogOffsets[i] -= FOG_LAYERS[i].speed * dt;
      if (this._fogOffsets[i] < -FOG_LAYERS[i].w) {
        this._fogOffsets[i] = 600; // 从右侧重新进入
      }
    }
  }

  render(renderer) {
    this._drawBackground(renderer);
    this._drawGrid(renderer);
    // 注意：雾层不在这里渲染
    // Game 需在所有实体渲染完后、HUD 之前调用 scene.renderFog(renderer)
  }

  /**
   * 浓雾视觉遮罩 — 由 Game.render() 在实体层之后、HUD 之前调用
   * col 5-8 区域从左到右渐增不透明度（0.15 → 0.82）
   */
  renderFog(renderer) {
    this._drawFogOverlay(renderer);
  }

  // ─── 背景 ────────────────────────────────────────────────────

  _drawBackground(renderer) {
    const ctx = renderer.ctx;
    const W = renderer.width;
    const H = renderer.height;

    // 天空（偏灰，阴天感）
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGrad.addColorStop(0, '#7a9eb5');
    skyGrad.addColorStop(0.5, '#8fb8c8');
    skyGrad.addColorStop(1, '#7a9a55');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 底部草地（阴暗色调）
    renderer.drawRect(0, H - 40, W, 40, '#3a5a1a');

    // 远处树木剪影
    this._drawTreeSilhouettes(renderer);
  }

  _drawTreeSilhouettes(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#1a2a10';
    const trees = [
      { x: 50, h: 120 },
      { x: 80, h: 100 },
      { x: 920, h: 115 },
      { x: 945, h: 95 },
    ];
    for (const t of trees) {
      // 树干
      ctx.fillRect(t.x - 5, renderer.height - 40 - t.h * 0.35, 10, t.h * 0.35);
      // 树冠（三角）
      ctx.beginPath();
      ctx.moveTo(t.x, renderer.height - 40 - t.h);
      ctx.lineTo(t.x - 28, renderer.height - 40 - t.h * 0.3);
      ctx.lineTo(t.x + 28, renderer.height - 40 - t.h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── 格子 ────────────────────────────────────────────────────

  _drawGrid(renderer) {
    const { rows, cols } = this.grid;
    const ctx = renderer.ctx;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = this.grid.getCellRect(r, c);
        const isEven = (r + c) % 2 === 0;
        const isFogCol = c >= FOG_START_COL;

        // 雾区格子略暗（雾中）
        let cellColor;
        if (isFogCol) {
          cellColor = isEven
            ? 'rgba(60, 110, 30, 0.45)'
            : 'rgba(75, 130, 40, 0.45)';
        } else {
          cellColor = isEven
            ? 'rgba(80, 155, 40, 0.55)'
            : 'rgba(100, 175, 50, 0.55)';
        }
        renderer.drawRect(rect.x, rect.y, rect.w, rect.h, cellColor);

        // 悬停高亮（雾区不显示悬停，玩家看不见）
        if (
          this._hoveredCell &&
          this._hoveredCell.row === r &&
          this._hoveredCell.col === c &&
          !isFogCol
        ) {
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, 'rgba(255,255,100,0.4)');
        }

        // 格子边框
        ctx.strokeStyle = 'rgba(50, 100, 25, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }
  }

  // ─── 浓雾视觉遮罩（col 5-8） ─────────────────────────────────

  _drawFogOverlay(renderer) {
    const ctx = renderer.ctx;

    // 雾区边界 x
    const fogX = Grid.OFFSET_X + FOG_START_COL * Grid.CELL_W;
    const fogW = (this.grid.cols - FOG_START_COL) * Grid.CELL_W;
    const fogY = Grid.OFFSET_Y;
    const fogH = this.grid.rows * Grid.CELL_H;

    ctx.save();
    // 裁剪到雾区
    ctx.beginPath();
    ctx.rect(fogX, fogY, fogW, fogH);
    ctx.clip();

    // 基底雾色（半透明白灰叠加）
    const fogBaseGrad = ctx.createLinearGradient(fogX, 0, fogX + fogW, 0);
    fogBaseGrad.addColorStop(0, 'rgba(220, 230, 220, 0.35)');
    fogBaseGrad.addColorStop(0.5, 'rgba(235, 240, 235, 0.60)');
    fogBaseGrad.addColorStop(1, 'rgba(245, 248, 245, 0.80)');
    ctx.fillStyle = fogBaseGrad;
    ctx.fillRect(fogX, fogY, fogW, fogH);

    // 动态雾气层（漂移椭圆）
    for (let i = 0; i < FOG_LAYERS.length; i++) {
      const layer = FOG_LAYERS[i];
      const lx = fogX + this._fogOffsets[i];
      ctx.globalAlpha = layer.alpha;
      ctx.fillStyle = '#e8f0e8';
      ctx.beginPath();
      ctx.ellipse(lx + layer.w / 2, layer.y, layer.w / 2, layer.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 雾区左侧渐变边缘（过渡自然）
    ctx.globalAlpha = 1;
    const edgeGrad = ctx.createLinearGradient(fogX, 0, fogX + 60, 0);
    edgeGrad.addColorStop(0, 'rgba(220, 230, 210, 0)');
    edgeGrad.addColorStop(1, 'rgba(220, 230, 210, 0.4)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(fogX, fogY, 60, fogH);

    ctx.restore();

    // 雾区左边界装饰线（告知玩家雾开始位置）
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 200, 170, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(fogX, fogY);
    ctx.lineTo(fogX, fogY + fogH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}
