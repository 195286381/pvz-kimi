import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';
import { bus } from '../core/EventBus.js';

const CONFIG = PLANTS.doomshroom;

export class DoomShroom extends Plant {
  /**
   * @param {number} row
   * @param {number} col
   * @param {string} scene  'day'|'night'|...
   */
  constructor(row, col, scene = 'day') {
    super(CONFIG, row, col);
    this._scene = scene;
    this._exploded = false;
    this._explodeAnim = 0;

    if (scene !== 'day') {
      // 夜晚：立即激活，延迟0.5s爆炸（动画时间）
      this._waitingForActivation = false;
      this._autoActivateTimer = 0.5;
    } else {
      // 白天：等待玩家额外点击支付75阳光
      this._waitingForActivation = true;
      this._autoActivateTimer = -1;
    }
  }

  update(dt, context) {
    super.update(dt);
    if (this._exploded) {
      this._explodeAnim -= dt;
      if (this._explodeAnim <= 0) this.hp = 0;
      return;
    }

    if (!this._waitingForActivation && this._autoActivateTimer >= 0) {
      this._autoActivateTimer -= dt;
      if (this._autoActivateTimer <= 0) {
        this._detonate(context);
      }
    }
  }

  /**
   * 白天：玩家点击后由 Game 调用，消耗75阳光触发全屏伤害
   * @param {object} sunSystem
   */
  activate(sunSystem) {
    if (!this._waitingForActivation) return;
    if (!sunSystem.spend(CONFIG.dayActivationCost)) return;  // 阳光不足
    this._waitingForActivation = false;
    this._detonate(null);
  }

  _detonate(_context) {
    if (this._exploded) return;
    this._exploded = true;
    this._explodeAnim = 1.0;
    bus.emit('plant:doomExplosion', {
      damage: CONFIG.explosionDamage,  // 9999
    });
  }

  render(renderer) {
    if (this.isDead()) return;

    const size = Math.min(this.width, this.height) * 0.85;

    if (this._exploded) {
      // 全屏爆炸动画
      const progress = 1 - this._explodeAnim;
      const r = 400 * progress;
      renderer.setAlpha(Math.max(0, this._explodeAnim));
      renderer.drawCircle(this.x, this.y, r, '#4a148c');
      renderer.resetAlpha();
      renderer.setAlpha(Math.max(0, this._explodeAnim * 0.7));
      renderer.drawCircle(this.x, this.y, r * 0.6, '#7b1fa2');
      renderer.resetAlpha();
      if (progress < 0.5) renderer.drawEmoji('💥', this.x, this.y, 60 + r * 0.2);
      return;
    }

    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    if (this._waitingForActivation) {
      // 白天等待激活：闪烁提示
      renderer.drawEmoji('💰', this.x + this.width * 0.4, this.y - this.height * 0.4, 16);
      renderer.drawText('75☀', this.x, this.y - this.height / 2 - 10, {
        size: 12, color: '#ffeb3b', align: 'center', baseline: 'middle',
      });
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
