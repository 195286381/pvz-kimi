import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';
import { Grid } from '../core/Grid.js';

/**
 * 潜水僵尸（泳池专用）
 * 潜水阶段无敌向左移动，到达 col=4 时上岸，之后普通移动攻击植物
 */
export class SnorkelZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.snorkel, row, startX);
    this._underwater = true;
    // surfaceX = OFFSET_X + surfaceCol * CELL_W
    this._surfaceX = Grid.OFFSET_X + (ZOMBIES.snorkel.surfaceCol ?? 4) * Grid.CELL_W;
  }

  // 潜水状态免疫所有攻击
  takeDamage(amount, ignoreArmor = false) {
    if (this._underwater) return;  // 潜水无敌
    super.takeDamage(amount, ignoreArmor);
  }

  update(dt) {
    if (this._underwater) {
      // 向左移动，到达上岸位置后浮出水面
      this.x -= this.pixelSpeed * dt;
      if (this.x <= this._surfaceX) {
        this._underwater = false;
        // 上岸后切换为普通速度
        const surfaceSpeed = ZOMBIES.snorkel.speedAfterSurface || 0.3;
        this.pixelSpeed = surfaceSpeed * 80;
      }
      return;
    }
    super.update(dt);
  }

  render(renderer) {
    if (this._underwater) {
      // 只显示 🤿 潜水镜，略高于水面线表示潜水
      renderer.setAlpha(0.7);
      renderer.drawEmoji('🤿', this.x + this.width / 2, this.y + 10, 30);
      renderer.resetAlpha();
      return;
    }
    super.render(renderer);
  }
}
