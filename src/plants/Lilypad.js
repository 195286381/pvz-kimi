import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.lilypad;

export class Lilypad extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this.stackedPlant = null;  // 上层叠放的植物引用（由 Game 设置）
  }

  update(dt, context) {
    super.update(dt);
    // 同步上层植物位置
    if (this.stackedPlant) {
      this.stackedPlant.x = this.x;
      this.stackedPlant.y = this.y;
      this.stackedPlant.update(dt, context);
    }
  }

  render(renderer) {
    if (this.isDead()) return;
    // 先渲染睡莲底座
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, Math.min(this.width, this.height) * 0.8);

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);

    // 再渲染上层植物（覆盖在睡莲之上）
    if (this.stackedPlant) {
      this.stackedPlant.render(renderer);
    }
  }

  /** 是否可叠放其他植物 */
  canStack() { return this.stackedPlant === null; }
}
