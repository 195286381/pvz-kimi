import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';
import { bus } from '../core/EventBus.js';

const CONFIG = PLANTS.flowerpot;

export class FlowerPot extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this.stackedPlant = null;  // 上层叠放的植物引用（由 Game 设置）
    this._destroyed = false;
  }

  update(dt, context) {
    super.update(dt);

    if (this.isDead() && !this._destroyed) {
      this._destroyed = true;
      bus.emit('plant:flowerpotDestroyed', { row: this.row, col: this.col });
      return;
    }

    // 同步上层植物位置并更新
    if (this.stackedPlant) {
      this.stackedPlant.x = this.x;
      this.stackedPlant.y = this.y;
      this.stackedPlant.update(dt, context);
    }
  }

  render(renderer) {
    if (this.isDead()) return;

    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, Math.min(this.width, this.height) * 0.8);

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);

    // 再渲染上层植物
    if (this.stackedPlant) {
      this.stackedPlant.render(renderer);
    }
  }

  /** 是否可叠放其他植物 */
  canStack() { return this.stackedPlant === null; }
}
