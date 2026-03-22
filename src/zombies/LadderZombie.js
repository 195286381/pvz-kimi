import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 梯子僵尸
 * 遇到坚果墙时架梯越过（耗时2s），梯子留在格上供后续僵尸使用
 * 高坚果免疫（梯子无法架上去）
 */
export class LadderZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.ladder, row, startX);
    this._placingLadder = false;
    this._ladderTimer = 0;
    this._ladderPlaced = false;
  }

  // 当遇到坚果墙且未架梯时，触发架梯行为（替代正常攻击）
  startEating(plant) {
    if (plant.id === 'wallnut' && !plant.hasLadder && !this._ladderPlaced) {
      // 开始架梯
      this._placingLadder = true;
      this._ladderTimer = ZOMBIES.ladder.ladderPlaceTime || 2.0;
      this._targetPlant = plant;
      // 暂停移动（不调用 super.startEating，避免进入 EATING 攻击状态）
    } else if (plant.id === 'tallnut') {
      // 高坚果免疫，正常攻击
      super.startEating(plant);
    } else if (plant.hasLadder || this._ladderPlaced) {
      // 坚果墙已有梯子，直接越过，不停留
      // 什么都不做，继续移动
    } else {
      super.startEating(plant);
    }
  }

  update(dt) {
    if (this._placingLadder) {
      this._ladderTimer -= dt;
      if (this._ladderTimer <= 0) {
        this._placingLadder = false;
        this._ladderPlaced = true;
        // 在坚果墙格子上标记 hasLadder
        if (this._targetPlant) this._targetPlant.hasLadder = true;
        this._targetPlant = null;
        // 恢复移动（直接继续，不停在坚果墙前）
      }
      return; // 架梯期间不移动
    }
    super.update(dt);
  }

  render(renderer) {
    super.render(renderer);
    // 携带梯子时在身侧显示 🪜
    if (this.armorHp > 0) {
      renderer.drawEmoji('🪜', this.x + this.width * 0.45, this.y, 24);
    }
    // 架梯进度条
    if (this._placingLadder) {
      const total = ZOMBIES.ladder.ladderPlaceTime || 2.0;
      const elapsed = total - this._ladderTimer;
      const progress = Math.min(1, elapsed / total);
      const barW = this.width;
      const x = this.x - barW / 2;
      const y = this.y + this.height / 2 + 4;
      renderer.drawRect(x, y, barW, 5, '#333');
      renderer.drawRect(x, y, barW * progress, 5, '#ffeb3b');
    }
  }
}
