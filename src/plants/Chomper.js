import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';
import { Grid } from '../core/Grid.js';

const CONFIG = PLANTS.chomper;
const BITE_INTERVAL = 30;  // 每30s攻击一次

export class Chomper extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._biteTimer = BITE_INTERVAL;  // 立即可咬
    this._chomping = false;
    this._chompAnim = 0;
  }

  update(dt, context) {
    super.update(dt);

    if (this._chompAnim > 0) this._chompAnim -= dt;

    this._biteTimer += dt;
    if (this._biteTimer >= BITE_INTERVAL) {
      const victim = this.tryChomp(context.zombies);
      if (victim) {
        this._biteTimer = 0;
        this._chompAnim = 0.4;
        victim.hp = 0;
        victim.die();
      }
    }
  }

  /**
   * 查找可吞噬目标：同格(col)或右邻格(col+1)的普通/旗手僵尸
   * @param {Zombie[]} zombies
   * @returns {Zombie|null}
   */
  tryChomp(zombies) {
    const maxCol = this.col === 8 ? this.col : this.col + 1;
    const validIds = CONFIG.swallowTargets;  // ['basic', 'flag']

    // 优先同格，再右邻格；同格内选最靠左（x最小）的
    let target = null;
    let bestX = Infinity;

    for (const z of zombies) {
      if (!z.isAlive()) continue;
      if (z.armorHp > 0) continue;  // 护甲僵尸免疫
      if (!validIds.includes(z.id)) continue;
      if (z.row !== this.row) continue;

      const zCol = Math.floor((z.x - Grid.OFFSET_X) / Grid.CELL_W);
      if (zCol < this.col || zCol > maxCol) continue;

      if (z.x < bestX) {
        bestX = z.x;
        target = z;
      }
    }
    return target;
  }

  render(renderer) {
    const size = Math.min(this.width, this.height) * (this._chompAnim > 0 ? 1.1 : 0.8);
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    // 冷却进度（右上角）
    const progress = Math.min(1, this._biteTimer / BITE_INTERVAL);
    if (progress < 1) {
      const barW = this.width;
      const x = this.x - barW / 2;
      const y = this.y - this.height / 2 - 10;
      renderer.drawRect(x, y, barW, 5, '#555');
      renderer.drawRect(x, y, barW * progress, 5, '#e91e63');
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
