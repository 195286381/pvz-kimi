import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';
import { bus } from '../core/EventBus.js';
import { Grid } from '../core/Grid.js';

const CONFIG = PLANTS.potatomine;

export class PotatoMine extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._armTimer = 0;
    this._armed = false;
    this._exploded = false;
  }

  update(dt, context) {
    super.update(dt);
    if (this._exploded) return;

    if (!this._armed) {
      this._armTimer += dt;
      if (this._armTimer >= CONFIG.armDelay) {
        this._armed = true;
        this.hp = CONFIG.armedHp;
        this.maxHp = CONFIG.armedHp;
      }
      return;
    }

    // 武装后：检测同格僵尸踩踏
    const col = this.col;
    const stepped = context.zombies.find(z =>
      z.isAlive() && z.row === this.row &&
      Math.floor((z.x - Grid.OFFSET_X) / Grid.CELL_W) === col
    );
    if (stepped) {
      this._detonate(context);
    }
  }

  _detonate(context) {
    if (this._exploded) return;
    this._exploded = true;
    bus.emit('plant:explosion', {
      row: this.row,
      col: this.col,
      damage: CONFIG.explosionDamage,
      radius: 0,       // 仅同格（radius=0）
    });
    this.hp = 0;
  }

  isArmed() { return this._armed; }

  render(renderer) {
    if (this.isDead()) return;

    const size = Math.min(this.width, this.height) * 0.8;
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    if (!this._armed) {
      // 武装进度条
      const progress = this._armTimer / CONFIG.armDelay;
      const barW = this.width;
      const x = this.x - barW / 2;
      const y = this.y + this.height / 2 + 4;
      renderer.drawRect(x, y, barW, 5, '#555');
      renderer.drawRect(x, y, barW * progress, 5, '#ff9800');
      // 未武装提示
      renderer.drawEmoji('💤', this.x + this.width * 0.4, this.y - this.height * 0.4, 14);
    } else {
      // 武装状态：闪烁红色小圆
      renderer.drawEmoji('⚠️', this.x + this.width * 0.4, this.y - this.height * 0.4, 14);
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
