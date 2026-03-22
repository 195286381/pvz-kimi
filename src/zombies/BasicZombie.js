import { Zombie } from '../entities/Zombie.js';
import { ZOMBIES } from '../data/zombies.js';

/**
 * 普通僵尸 — 无特殊能力，最基础的敌人
 */
export class BasicZombie extends Zombie {
  constructor(row, startX) {
    super(ZOMBIES.basic, row, startX);
  }
}
