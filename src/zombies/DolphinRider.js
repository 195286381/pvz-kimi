import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 海豚骑手（泳池专用）
 * 遇到第一株植物时跳过（不造成伤害），跳过后变为普通速度继续攻击后续植物
 */
export class DolphinRider extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.dolphin, row, startX);
    this._hasJumped = false;   // 是否已跳过第一株植物
    this._jumping = false;     // 跳跃动画中
    this._jumpTimer = 0;
  }

  // 重写 startEating：若未跳过则触发跳跃，否则正常攻击
  startEating(plant) {
    if (!this._hasJumped) {
      // 跳过植物：不攻击，直接越过
      this._hasJumped = true;
      this._jumping = true;
      this._jumpTimer = 0.4;   // 跳跃动画0.4s
      // 不调用 super.startEating，继续向左移动
    } else {
      super.startEating(plant);
    }
  }

  update(dt) {
    if (this._jumping) {
      this._jumpTimer -= dt;
      // 跳跃期间继续向左移动（不被植物阻挡）
      this.x -= this.pixelSpeed * dt;
      if (this._jumpTimer <= 0) {
        this._jumping = false;
        // 跳过后速度恢复普通（0.3格/秒）
        this.pixelSpeed = 0.3 * 80;
      }
      return;
    }
    super.update(dt);
  }

  render(renderer) {
    // 跳跃动画：y偏移弧线
    let yOffset = 0;
    if (this._jumping) {
      const progress = 1 - this._jumpTimer / 0.4;
      yOffset = -Math.sin(progress * Math.PI) * 30;
    }
    const savedY = this.y;
    this.y += yOffset;
    super.render(renderer);
    this.y = savedY;

    // 海豚图标（跳跃前显示）
    if (!this._hasJumped) {
      renderer.drawEmoji('🐬', this.x, this.y + this.height * 0.4, 24);
    }
  }
}
