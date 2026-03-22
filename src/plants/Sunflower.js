import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

export class Sunflower extends Plant {
  constructor(row, col) {
    super(PLANTS.sunflower, row, col);
    this._sunTimer = 0;
    this._animFrame = 0;
    this._animTimer = 0;
  }

  /** @param {import('../systems/SunSystem.js').SunSystem} sunSystem */
  update(dt, sunSystem) {
    super.update(dt);

    this._sunTimer += dt;
    if (this._sunTimer >= PLANTS.sunflower.sunInterval) {
      this._sunTimer = 0;
      sunSystem.spawnSunAt(this.x + this.width / 2, this.y, 25);
    }

    // idle sway animation
    this._animTimer += dt;
    if (this._animTimer > 0.3) {
      this._animTimer = 0;
      this._animFrame = (this._animFrame + 1) % 3;
    }
  }

  render(renderer) {
    // slight tilt based on animation frame
    const offsets = [-2, 0, 2];
    const tilt = offsets[this._animFrame];
    renderer.save();
    renderer.ctx.translate(this.x, this.y);
    renderer.ctx.rotate((tilt * Math.PI) / 180);
    renderer.drawEmoji(this.emoji, 0, 0, Math.min(this.width, this.height) * 0.82);
    renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderer.restore();

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);
  }
}
