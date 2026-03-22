import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

export class WallNut extends Plant {
  constructor(row, col) {
    super(PLANTS.wallnut, row, col);
    this.hasLadder = false; // set by LadderZombie
  }

  update(dt, _arg) {
    super.update(dt);
    return null;
  }

  render(renderer) {
    const ratio = this.hp / this.maxHp;

    // choose emoji based on damage level
    let emoji;
    if (ratio > 0.66) {
      emoji = '🥜';
    } else if (ratio > 0.33) {
      emoji = '🟤'; // cracked
    } else {
      emoji = '🪨'; // heavily damaged
    }

    renderer.drawEmoji(emoji, this.x, this.y, Math.min(this.width, this.height) * 0.82);

    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2, this.y - this.height / 2,
        this.width, this.height, 'rgba(255,0,0,0.4)'
      );
    }
    if (this.hp < this.maxHp) this._renderHealthBar(renderer);
  }
}
