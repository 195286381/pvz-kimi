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
   * @param {import('../entities/Zombie.js').Zombie[]} zombiesInRow
   * @returns {Projectile|null}
   */
  update(dt, zombiesInRow) {
    super.update(dt);
    if (!zombiesInRow || zombiesInRow.length === 0) return null;

    this._shootTimer += dt;
    if (this._shootTimer >= PLANTS.peashooter.attackInterval) {
      this._shootTimer = 0;
      return new Projectile({
        type: 'pea',
        x: this.x + this.width / 2,
        y: this.y,
        row: this.row,
        damage: PLANTS.peashooter.damage,
        speed: 400,
        emoji: '🟢',
      });
    }
    return null;
  }
}
