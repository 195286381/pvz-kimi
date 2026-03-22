import { Plant } from '../entities/Plant.js';
import { Projectile } from '../entities/Projectile.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.repeater;
const SECOND_PEA_DELAY = 0.1;  // 两颗豌豆间隔0.1s

export class Repeater extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._shootTimer = CONFIG.attackInterval; // 立即可射
    this._secondPeaTimer = -1;  // -1表示无待发第二颗
  }

  update(dt, context) {
    super.update(dt);

    const hasTarget = context.zombies.some(z => z.row === this.row && z.isAlive());

    // 第二颗豌豆延迟发射
    if (this._secondPeaTimer >= 0) {
      this._secondPeaTimer -= dt;
      if (this._secondPeaTimer <= 0) {
        this._secondPeaTimer = -1;
        context.addProjectile(this._makePea());
      }
    }

    if (!hasTarget) return;

    this._shootTimer += dt;
    if (this._shootTimer >= CONFIG.attackInterval) {
      this._shootTimer = 0;
      context.addProjectile(this._makePea());
      this._secondPeaTimer = SECOND_PEA_DELAY;  // 0.1s后发第二颗
    }
  }

  _makePea() {
    return new Projectile({
      type: 'pea',
      x: this.x + this.width / 2,
      y: this.y,
      row: this.row,
      damage: CONFIG.damage,
      speed: 400,
      emoji: '🟢',
    });
  }
}
