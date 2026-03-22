import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.fumeshroom;

export class FumeShroom extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._attackTimer = 0;
    this._fumeAnim = 0;  // 喷雾动画计时
  }

  update(dt, context) {
    super.update(dt);

    if (this._fumeAnim > 0) this._fumeAnim -= dt;

    const targets = context.zombies.filter(z => z.row === this.row && z.isAlive());
    if (targets.length === 0) return;

    this._attackTimer += dt;
    if (this._attackTimer >= CONFIG.attackInterval) {
      this._attackTimer = 0;
      this._fumeAnim = 0.3;
      // 穿透同行所有僵尸，直接造成伤害
      for (const z of targets) {
        z.takeDamage(CONFIG.damage);
      }
    }
  }

  render(renderer) {
    const size = Math.min(this.width, this.height) * 0.8;
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    // 喷雾动画：向右延伸的绿色气流
    if (this._fumeAnim > 0) {
      const alpha = this._fumeAnim / 0.3;
      renderer.setAlpha(alpha * 0.5);
      for (let i = 1; i <= 4; i++) {
        renderer.drawEmoji('💨', this.x + i * 55, this.y, 24 - i * 2);
      }
      renderer.resetAlpha();
    }

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);
  }
}
