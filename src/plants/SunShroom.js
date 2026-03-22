import { Plant } from '../entities/Plant.js';
import { PLANTS } from '../data/plants.js';

const CONFIG = PLANTS.sunshroom;
const STAGES = CONFIG.sunStages;  // [{duration:10,sunAmount:25},{duration:10,sunAmount:50},{duration:Infinity,sunAmount:75}]

export class SunShroom extends Plant {
  constructor(row, col) {
    super(CONFIG, row, col);
    this._stage = 0;           // 0=小型, 1=中型, 2=大型
    this._stageTimer = 0;      // 当前阶段计时
    this._sunTimer = 0;
    this._sunInterval = CONFIG.sunInterval;  // 24s
  }

  update(dt, context) {
    super.update(dt);

    // 阶段成长
    if (this._stage < 2) {
      this._stageTimer += dt;
      if (this._stageTimer >= STAGES[this._stage].duration) {
        this._stageTimer -= STAGES[this._stage].duration;
        this._stage++;
      }
    }

    // 产阳光
    this._sunTimer += dt;
    if (this._sunTimer >= this._sunInterval) {
      this._sunTimer = 0;
      const amount = STAGES[this._stage].sunAmount;
      context.sunSystem.spawnPlantSun(this.x, this.y, amount);
    }
  }

  render(renderer) {
    // 三档大小
    const scales = [0.55, 0.7, 0.85];
    const size = Math.min(this.width, this.height) * scales[this._stage];
    renderer.drawEmoji(CONFIG.emoji, this.x, this.y, size);

    // 成长进度（阶段未满时）
    if (this._stage < 2) {
      const progress = this._stageTimer / STAGES[this._stage].duration;
      const barW = this.width;
      const x = this.x - barW / 2;
      const y = this.y + this.height / 2 + 4;
      renderer.drawRect(x, y, barW, 4, '#555');
      renderer.drawRect(x, y, barW * progress, 4, '#ffeb3b');
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
