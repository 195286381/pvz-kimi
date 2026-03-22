import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const FUSE_TIME = 1.5;
const EXPLODE_ANIM = 0.55;

export class CherryBomb extends Plant {
  constructor(row, col) {
    super(PLANTS.cherrybomb, row, col);
    this._fuseTimer = 0;
    this._fuseTime = FUSE_TIME;
    this._exploded = false;
    this._explodeTimer = 0;
    this.hp = 1; // cannot be targeted; set to 0 after explosion
  }

  /**
   * @param {number} dt
   * @param {object} [_context] - unused, accepted for uniform call signature
   * @returns {{ type:'explosion', row:number, col:number, damage:number, radius:number }|null}
   */
  update(dt, _context) {
    super.update(dt);

    if (this._exploded) {
      this._explodeTimer += dt;
      if (this._explodeTimer >= EXPLODE_ANIM) {
        this.hp = 0; // signals removal
      }
      return null;
    }

    this._fuseTimer += dt;
    if (this._fuseTimer >= this._fuseTime) {
      this._exploded = true;
      return {
        type: 'explosion',
        row: this.row,
        col: this.col,
        damage: PLANTS.cherrybomb.explosionDamage,
        radius: PLANTS.cherrybomb.explosionRadius,
      };
    }
    return null;
  }

  render(renderer) {
    if (this.hp <= 0 && this._explodeTimer >= EXPLODE_ANIM) return;

    if (this._exploded) {
      this._renderExplosion(renderer);
      return;
    }

    // fusing: draw emoji
    renderer.drawEmoji(PLANTS.cherrybomb.emoji, this.x, this.y,
      Math.min(this.width, this.height) * 0.82);

    // countdown label
    const remaining = this._fuseTime - this._fuseTimer;
    const urgent = remaining < 0.6;
    renderer.drawText(remaining.toFixed(1), this.x, this.y - this.height / 2 - 10, {
      size: 13,
      color: urgent ? '#ff4444' : '#ffffff',
      align: 'center',
      baseline: 'middle',
      font: 'bold Arial',
    });

    // red glow pulse as fuse nears end
    if (urgent) {
      const alpha = 0.35 * (1 - remaining / 0.6);
      renderer.save();
      renderer.setAlpha(alpha);
      renderer.drawCircle(this.x, this.y, 55, '#ff3300');
      renderer.resetAlpha();
      renderer.restore();
    }
  }

  _renderExplosion(renderer) {
    const p = Math.min(1, this._explodeTimer / EXPLODE_ANIM);
    const maxR = 110;

    renderer.save();
    renderer.setAlpha((1 - p) * 0.85);
    renderer.drawCircle(this.x, this.y, maxR * p, '#FF5500');
    renderer.setAlpha((1 - p) * 0.7);
    renderer.drawCircle(this.x, this.y, maxR * p * 0.6, '#FFDD00');
    renderer.resetAlpha();
    renderer.restore();

    if (p < 0.55) {
      renderer.drawEmoji('💥', this.x, this.y, 48 + 36 * p);
    }
  }
}
