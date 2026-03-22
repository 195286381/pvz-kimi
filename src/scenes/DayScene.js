import { Scene } from './Scene.js';
import { Grid } from '../core/Grid.js';

// seeded pseudo-random for deterministic decoration placement
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// pre-compute decoration positions once
const DECORATION_COUNT = 30;
const decorations = (() => {
  const rand = seededRandom(42);
  const result = [];
  for (let i = 0; i < DECORATION_COUNT; i++) {
    result.push({
      x: rand() * 780 + 10,
      y: rand() * 560 + 20,
      size: rand() * 10 + 10,
    });
  }
  return result;
})();

export class DayScene extends Scene {
  constructor(grid) {
    super(grid);
    this._hoveredCell = null;
  }

  setHoveredCell(cell) {
    this._hoveredCell = cell;
  }

  update(dt) {}

  render(renderer) {
    this._drawBackground(renderer);
    this._drawDecorations(renderer);
    this._drawGrid(renderer);
  }

  _drawBackground(renderer) {
    const ctx = renderer.ctx;
    const W = renderer.width;
    const H = renderer.height;

    // sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.75);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#98D65C');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // bottom grass strip
    renderer.drawRect(0, H - 40, W, 40, '#4a7c25');
  }

  _drawDecorations(renderer) {
    renderer.save();
    renderer.setAlpha(0.35);
    for (const d of decorations) {
      renderer.drawEmoji('🌿', d.x, d.y, d.size);
    }
    renderer.restore();
  }

  _drawGrid(renderer) {
    const { rows, cols } = this.grid;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = this.grid.getCellRect(r, c);
        const isEven = (r + c) % 2 === 0;

        // alternating cell color
        const cellColor = isEven ? 'rgba(80,160,40,0.55)' : 'rgba(100,180,50,0.55)';
        renderer.drawRect(rect.x, rect.y, rect.w, rect.h, cellColor);

        // hover highlight
        if (
          this._hoveredCell &&
          this._hoveredCell.row === r &&
          this._hoveredCell.col === c
        ) {
          renderer.drawRect(rect.x, rect.y, rect.w, rect.h, 'rgba(255,255,100,0.4)');
        }

        // cell border
        const ctx = renderer.ctx;
        ctx.strokeStyle = 'rgba(60,120,30,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }
  }
}
