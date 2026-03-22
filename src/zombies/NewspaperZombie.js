import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 报纸僵尸 — 护甲170HP，报纸破碎后速度翻倍（0.3→0.8格/秒）
 */
export class NewspaperZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.newspaper, row, startX);
    this._angerMode = false;
  }

  _onArmorBroken() {
    // 报纸破碎：速度翻倍，进入愤怒模式
    this._angerMode = true;
    this.pixelSpeed = ZOMBIES.newspaper.speedAfterArmorBreak * 80;
  }

  render(renderer) {
    super.render(renderer);
    // 在身体右侧绘制 📰（报纸）
    if (this.armorHp > 0) {
      renderer.drawEmoji('📰', this.x + this.width * 0.45, this.y, 26);
    }
    // 愤怒状态：红色遮罩提示
    if (this._angerMode && this._hitFlash <= 0) {
      renderer.drawRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
        'rgba(255, 60, 0, 0.15)'
      );
    }
  }
}
