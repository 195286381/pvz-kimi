import { Plant } from '../entities/Plant.js';
import { Projectile } from '../entities/Projectile.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.puffshroom;

export class PuffShroom extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._shootTimer = CONFIG.attackInterval;
  }

  update(dt, context) {
    super.update(dt);

    const hasTarget = context.zombies.some(z => z.row === this.row && z.isAlive());
    if (!hasTarget) return;

    this._shootTimer += dt;
    if (this._shootTimer >= CONFIG.attackInterval) {
      this._shootTimer = 0;
      context.addProjectile(new Projectile({
        type: 'spore',
        x: this.x + this.width / 2,
        y: this.y,
        row: this.row,
        damage: CONFIG.damage,  // 15
        speed: 300,
        emoji: '🟤',
      }));
    }
  }
}
