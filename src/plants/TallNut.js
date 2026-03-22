import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.tallnut;

export class TallNut extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this.immuneToLadder = true;  // LadderZombie 无法架梯
  }

  update(dt, _context) {
    super.update(dt);
  }

  render(renderer) {
    if (this.isDead()) return;

    const ratio = this.hp / this.maxHp;
    // 三档外观（更高大）
    let emoji = CONFIG.emoji;
    if (ratio <= 0.25) emoji = '🪨';       // 严重损坏
    else if (ratio <= 0.5) emoji = '🌰';   // 轻度损坏（同图标，可扩展）

    // 高坚果更高大
    const size = Math.min(this.width, this.height) * 0.95;
    renderer.drawEmoji(emoji, this.x, this.y, size);

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);
  }
}
