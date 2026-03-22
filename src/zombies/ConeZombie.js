import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 路锥僵尸 — 头顶路锥护甲（370HP），可被磁力菇吸走
 * 护甲破碎后外观恢复普通僵尸，移速不变
 */
export class ConeZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.cone, row, startX);
  }

  render(renderer) {
    super.render(renderer);
    // 护甲存在时在头顶额外绘制路锥 Emoji（偏上居中）
    if (this.armorHp > 0) {
      renderer.drawEmoji('🪖', this.x, this.y - this.height * 0.35, 28);
    }
  }

  _onArmorBroken() {
    // 路锥脱落，变为普通僵尸外观（无额外行为变化）
    // armorHp 已由基类置0，无需额外操作
  }
}
