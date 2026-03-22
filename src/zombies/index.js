// 僵尸注册表 — 统一导出所有10种僵尸类
import { BasicZombie }     from './BasicZombie.js';
import { FlagZombie }      from './FlagZombie.js';
import { ConeZombie }      from './ConeZombie.js';
import { BucketZombie }    from './BucketZombie.js';
import { NewspaperZombie } from './NewspaperZombie.js';
import { FootballZombie }  from './FootballZombie.js';
import { DolphinRider }    from './DolphinRider.js';
import { SnorkelZombie }   from './SnorkelZombie.js';
import { LadderZombie }    from './LadderZombie.js';
import { JackZombie }      from './JackZombie.js';

export {
  BasicZombie, FlagZombie, ConeZombie, BucketZombie, NewspaperZombie,
  FootballZombie, DolphinRider, SnorkelZombie, LadderZombie, JackZombie,
};

/**
 * 僵尸注册表：zombieId → 僵尸类
 * 与 data/zombies.js 的 ZOMBIES 键名对应
 * 与 data/levels.js 波次配置中的 ID 对应
 *
 * 用法（WaveSystem 中）：
 *   const ZombieClass = ZOMBIE_REGISTRY[zombieId];
 *   const zombie = new ZombieClass(row, startX);
 */
export const ZOMBIE_REGISTRY = {
  basic:     BasicZombie,
  flag:      FlagZombie,
  cone:      ConeZombie,
  bucket:    BucketZombie,
  newspaper: NewspaperZombie,
  football:  FootballZombie,
  dolphin:   DolphinRider,
  snorkel:   SnorkelZombie,
  ladder:    LadderZombie,
  jack:      JackZombie,
};
