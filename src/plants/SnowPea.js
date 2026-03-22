import { Plant } from '../entities/Plant.js';
import { Projectile } from '../entities/Projectile.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.snowpea;

export class SnowPea extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._shootTimer = CONFIG.attackInterval; // 立即可射
  }

  update(dt, context) {
    super.update(dt);

    const hasTarget = context.zombies.some(z => z.row === this.row && z.isAlive());
    if (!hasTarget) return;

    this._shootTimer += dt;
    if (this._shootTimer >= CONFIG.attackInterval) {
      this._shootTimer = 0;
      context.addProjectile(new Projectile({
        type: 'snow_pea',
        x: this.x + this.width / 2,
        y: this.y,
        row: this.row,
        damage: CONFIG.damage,
        speed: 400,
        emoji: '🔵',
        freezeDuration: CONFIG.slowDuration,  // 4s
      }));
    }
  }
}
