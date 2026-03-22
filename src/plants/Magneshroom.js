import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.magneshroom;

export class Magneshroom extends Plant {
  /**
   * @param {number} row
   * @param {number} col
   * @param {string} scene  'day'|'night'|'pool'|'fog'|'roof'
   */
  constructor(row, col, scene = 'day') {
    super(CONFIG, row, col);
    this._magnetTimer = 0;
    // 白天需初始冷却3s才能激活
    this._activated = scene !== 'day';
    this._activationTimer = this._activated ? 0 : 3;
    this._pulseAnim = 0;
  }

  update(dt, context) {
    super.update(dt);

    if (this._pulseAnim > 0) this._pulseAnim -= dt;

    // 白天激活倒计时
    if (!this._activated) {
      this._activationTimer -= dt;
      if (this._activationTimer <= 0) this._activated = true;
      return;
    }

    this._magnetTimer += dt;
    if (this._magnetTimer >= CONFIG.magnetInterval) {
      this._magnetTimer = 0;
      this._suck(context.zombies);
    }
  }

  _suck(zombies) {
    const targets = CONFIG.magnetTargets;  // ['cone', 'bucket']
    // 同行中最近（x最大，即最靠右）的金属护甲僵尸
    let nearest = null;
    let nearestX = -Infinity;

    for (const z of zombies) {
      if (!z.isAlive()) continue;
      if (z.row !== this.row) continue;
      if (z.armorHp <= 0) continue;
      if (!targets.includes(z.armorType)) continue;
      if (z.x > nearestX) {
        nearestX = z.x;
        nearest = z;
      }
    }

    if (nearest) {
      this._pulseAnim = 0.4;
      nearest.armorHp = 0;
      nearest._onArmorBroken();
    }
  }

  render(renderer) {
    if (this.isDead()) return;

    const size = Math.min(this.width, this.height) * 0.8;

    if (!this._activated) {
      // 未激活：半透明显示
      renderer.setAlpha(0.5);
      renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);
      renderer.resetAlpha();
      // 激活倒计时
      renderer.drawText(this._activationTimer.toFixed(1) + 's', this.x, this.y - this.height / 2 - 8, {
        size: 12, color: '#90a4ae', align: 'center', baseline: 'middle',
      });
    } else {
      renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);
      // 吸附动画
      if (this._pulseAnim > 0) {
        const alpha = this._pulseAnim / 0.4;
        renderer.setAlpha(alpha * 0.6);
        renderer.drawCircle(this.x, this.y, 40 * (1 - alpha), '#90caf9');
        renderer.resetAlpha();
      }
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
