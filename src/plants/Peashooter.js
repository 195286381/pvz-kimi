import { Plant } from '../entities/Plant.js';
import { Projectile } from '../entities/Projectile.js';
import { PLANTS } from '../data/plants.js';

export class Peashooter extends Plant {
  constructor(row, col) {
    super(PLANTS.peashooter, row, col);
    this._shootTimer = 0;
  }

  /**
   * @param {number} dt
   * @param {object|import('../entities/Zombie.js').Zombie[]} context
   *   context 对象：{ zombies, addProjectile, ... }
   *   或兼容旧接口：直接传入 zombiesInRow 数组
   */
  update(dt, context) {
    super.update(dt);
    const zombiesInRow = context?.zombies
      ? context.zombies.filter(z => z.row === this.row && z.isAlive())
      : (Array.isArray(context) ? context : []);

    if (!zombiesInRow || zombiesInRow.length === 0) return null;

    this._shootTimer += dt;
    if (this._shootTimer >= PLANTS.peashooter.attackInterval) {
      this._shootTimer = 0;
      const proj = new Projectile({
        type: 'pea',
        x: this.x + this.width / 2,
        y: this.y,
        row: this.row,
        damage: PLANTS.peashooter.damage,
        speed: 400,
        emoji: '🟢',
      });
      context?.addProjectile?.(proj);
      return null;
    }
    return null;
  }
}
