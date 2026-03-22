import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.torchwood;

export class Torchwood extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    /**
     * ignitesProjectiles = true
     * CollisionSystem 检测到豌豆子弹经过此格时：
     *   - pea       → fire_pea（damage×2, emoji:'🔥'）
     *   - snow_pea  → pea（火消除冰，damage不变）
     */
    this.ignitesProjectiles = true;
  }

  update(dt, _context) {
    super.update(dt);
    // 本身不攻击，无逻辑
  }

  render(renderer) {
    if (this.isDead()) return;

    const size = Math.min(this.width, this.height) * 0.85;
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    // 火焰光晕
    renderer.setAlpha(0.25);
    renderer.drawCircle(this.x, this.y, 38, '#ff6d00');
    renderer.resetAlpha();

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);
  }
}
