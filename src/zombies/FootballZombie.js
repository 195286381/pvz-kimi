import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 橄榄球僵尸 — HP=1580，极快速（1.0格/秒），无护甲
 * 完全由数据驱动，无特殊逻辑
 */
export class FootballZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.football, row, startX);
  }

  render(renderer) {
    super.render(renderer);
    // 稍大的 🏈 表示强壮
    renderer.drawEmoji('🏈', this.x + this.width * 0.35, this.y - this.height * 0.3, 26);
  }
}
