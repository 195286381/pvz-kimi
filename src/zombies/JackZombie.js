import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';
import { bus } from '../core/EventBus.js';

/**
 * 小丑僵尸（浓雾/屋顶专用）
 * 死亡时3×3范围爆炸(1800伤害)，只伤植物不伤僵尸，不触发连锁爆炸
 */
export class JackZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.jack, row, startX);
    this._exploded = false;
  }

  die() {
    super.die();
    if (!this._exploded) {
      this._exploded = true;
      // 根据 x 坐标换算格子列（OFFSET_X=120, CELL_W=80）
      const col = Math.floor((this.x - 120 + this.width / 2) / 80);
      bus.emit('jack:explode', {
        row: this.row,
        col: Math.max(0, Math.min(8, col)),
        damage: ZOMBIES.jack.deathExplosionDamage || 1800,
        radius: ZOMBIES.jack.deathExplosionRadius || 1,
        plantOnly: true,   // 只伤植物不伤僵尸
      });
    }
  }

  render(renderer) {
    super.render(renderer);
    // 存活时显示 ❓ 警告玩家有爆炸风险
    if (this.isAlive()) {
      renderer.drawEmoji('❓', this.x + this.width * 0.4, this.y - this.height * 0.4, 16);
    }
  }
}
