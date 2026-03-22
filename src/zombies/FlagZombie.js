import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 旗手僵尸 — 触发大波次的信号，本身无额外战斗能力
 * flagWave: true 标记由 WaveSystem 检测用于触发大波次逻辑
 */
export class FlagZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.flag, row, startX);
  }

  render(renderer) {
    super.render(renderer);
    // 身体左侧额外绘制 🚩 旗帜
    renderer.drawEmoji('🚩', this.x - this.width * 0.5 - 10, this.y - this.height * 0.2, 22);
  }
}
