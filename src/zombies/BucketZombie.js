import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 铁桶僵尸 — 头顶铁桶护甲（1100HP），高额护甲，可被磁力菇吸走
 * 护甲破碎后与普通僵尸相同
 */
export class BucketZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.bucket, row, startX);
  }

  render(renderer) {
    super.render(renderer);
    // 铁桶护甲存在时在头顶额外绘制 🪣 Emoji
    if (this.armorHp > 0) {
      renderer.drawEmoji('🪣', this.x, this.y - this.height * 0.35, 28);
    }
  }

  _onArmorBroken() {
    // 铁桶脱落，恢复普通僵尸外观
  }
}
