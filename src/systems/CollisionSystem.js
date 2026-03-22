import { Grid } from '../core/Grid.js';
import { bus } from '../core/EventBus.js';

/**
 * CollisionSystem — 每帧碰撞检测
 *
 * 负责：
 *   1. 子弹 × 僵尸（同行 AABB，含冰冻/穿透/火球特殊处理）
 *   2. 僵尸 × 植物（僵尸进入植物所在列触发 startEating）
 *   3. 冻结计时器滚动（snowpea 减速倒计时）
 *   4. 僵尸到达左边界 → emit 'game:over'
 *
 * 静态工具：
 *   CollisionSystem.aoeZombies(...)  — 范围爆炸伤害（樱桃炸弹/土豆/小丑）
 *   CollisionSystem.nukeAll(...)     — 全屏清场（毁灭菇）
 */
export class CollisionSystem {
  constructor() {
    this._gameOver = false; // 防止重复触发
  }

  /**
   * 每帧入口
   * @param {number}           dt
   * @param {Projectile[]}     projectiles
   * @param {Zombie[]}         zombies
   * @param {Plant[]}          plants
   * @param {ParticleSystem|null} particles
   */
  update(dt, projectiles, zombies, plants, particles = null) {
    if (this._gameOver) return;

    this._tickFreezeTimers(zombies, dt);
    this._checkProjectileZombie(projectiles, zombies, plants, particles);
    this._checkZombiePlant(zombies, plants);
    this._checkZombieLeftEdge(zombies);
  }

  /** 重置（关卡重试时调用） */
  reset() {
    this._gameOver = false;
  }

  // ═══════════════════════════════════════════════════════════
  //  1. 冻结计时器
  // ═══════════════════════════════════════════════════════════

  _tickFreezeTimers(zombies, dt) {
    for (const z of zombies) {
      if (!z._frozen) continue;
      z._freezeTimer -= dt;
      if (z._freezeTimer <= 0) {
        z.pixelSpeed = z._frozenOrigSpeed;
        z._frozen = false;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  2. 子弹 × 僵尸
  // ═══════════════════════════════════════════════════════════

  _checkProjectileZombie(projectiles, zombies, plants, particles) {
    for (const proj of projectiles) {
      if (!proj.active) continue;

      // Torchwood 点火：子弹经过同行 Torchwood 时转换类型
      if (proj.type === 'pea' || proj.type === 'snow_pea') {
        const torch = plants.find(p =>
          p.ignitesProjectiles &&
          p.row === proj.row &&
          !p.isDead() &&
          proj.x > p.x && proj.x < p.x + p.width + proj.speed * 0.05
        );
        if (torch) {
          if (proj.type === 'snow_pea') {
            // 冰豌豆遇火炬 → 普通豌豆（消除冰效果）
            proj.type = 'pea';
            proj.freezeDuration = 0;
            proj.emoji = '🟢';
          } else {
            // 普通豌豆 → 火球，伤害×2
            proj.type = 'fire_pea';
            proj.damage *= 2;
            proj.emoji = '🔥';
          }
        }
      }

      // 同行存活僵尸（按 x 从右到左排序，先命中最近的）
      const targets = zombies
        .filter(z => z.isAlive() && z.row === proj.row)
        .sort((a, b) => b.x - a.x);

      if (proj.type === 'fume') {
        // 大喷菇/小喷菇孢子：穿透同行全部僵尸
        for (const z of targets) {
          this._hitZombie(proj, z, plants, particles);
        }
        proj.deactivate();
        continue;
      }

      // 普通子弹：命中第一个重叠僵尸后失活
      for (const z of targets) {
        if (this._overlapsX(proj, z)) {
          this._hitZombie(proj, z, plants, particles);
          proj.deactivate();
          break;
        }
      }
    }
  }

  /** AABB x 轴重叠检测 */
  _overlapsX(proj, zombie) {
    return Math.abs(proj.x - zombie.x) < (proj.width / 2 + zombie.width / 2);
  }

  _hitZombie(proj, zombie, plants, particles) {
    zombie.takeDamage(proj.damage);

    // 粒子效果
    if (particles) {
      if (proj.type === 'icePea' || proj.freezeDuration > 0) {
        particles.spawnIceShatter(proj.x, proj.y);
      } else {
        particles.spawnHit(proj.x, proj.y);
      }
    }

    // 冰冻减速（snowpea）
    if (proj.freezeDuration > 0) {
      if (!zombie._frozen) zombie._frozenOrigSpeed = zombie.pixelSpeed;
      zombie._frozen = true;
      zombie._freezeTimer = proj.freezeDuration;
      zombie.pixelSpeed = zombie._frozenOrigSpeed * 0.5;
    }

    // 检查死亡
    if (zombie.hp <= 0 && zombie.isAlive()) {
      this._killZombie(zombie, plants, particles);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  3. 僵尸 × 植物
  // ═══════════════════════════════════════════════════════════

  _checkZombiePlant(zombies, plants) {
    for (const zombie of zombies) {
      if (!zombie.isAlive()) continue;

      // 正在进食：检查目标植物是否已死
      if (zombie.state === 'eating') {
        if (!zombie._targetPlant || zombie._targetPlant.isDead()) {
          zombie.stopEating();
        }
        continue;
      }

      if (zombie.state !== 'walking') continue;

      // 根据像素 x 确定僵尸当前列
      const col = Math.floor((zombie.x - Grid.OFFSET_X) / Grid.CELL_W);
      if (col < 0 || col >= 9) continue;

      // 找同行同列的存活植物（优先非底座）
      const target = this._findPlantTarget(zombie.row, col, plants);
      if (target) {
        zombie.startEating(target);
      }
    }
  }

  /**
   * 找可被攻击的植物。
   * 叠放情况（睡莲/花盆底座）：优先攻击上层植物，上层死后攻击底座。
   */
  _findPlantTarget(row, col, plants) {
    const candidates = plants.filter(p => p.row === row && p.col === col && !p.isDead());
    if (candidates.length === 0) return null;

    // 非底座植物优先
    const nonBase = candidates.find(p => !p.isBase);
    return nonBase || candidates[0];
  }

  // ═══════════════════════════════════════════════════════════
  //  4. 僵尸到达左边界
  // ═══════════════════════════════════════════════════════════

  _checkZombieLeftEdge(zombies) {
    for (const zombie of zombies) {
      if (!zombie.isAlive()) continue;
      // 僵尸中心越过格子左边界足够距离
      if (zombie.x < Grid.OFFSET_X - 40) {
        this._gameOver = true;
        bus.emit('game:over', { reason: 'zombie_reached_house' });
        return;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  5. 僵尸死亡处理
  // ═══════════════════════════════════════════════════════════

  _killZombie(zombie, plants, particles) {
    // 小丑僵尸死亡：3×3 爆炸只伤植物
    if (zombie.id === 'jack') {
      this._jackExplosion(zombie, plants, particles);
    }
    if (particles) particles.spawnZombieDeath(zombie.x, zombie.y);
    zombie.die();
    bus.emit('zombie:died', { zombie });
  }

  _jackExplosion(zombie, plants, particles) {
    const col = Math.round((zombie.x - Grid.OFFSET_X) / Grid.CELL_W);
    for (const p of plants) {
      if (Math.abs(p.row - zombie.row) <= 1 && Math.abs(p.col - col) <= 1) {
        p.takeDamage(1800);
      }
    }
    if (particles) particles.spawnExplosion(zombie.x, zombie.y, '#ff6600');
  }

  // ═══════════════════════════════════════════════════════════
  //  静态工具 — 供植物技能直接调用
  // ═══════════════════════════════════════════════════════════

  /**
   * 范围爆炸（樱桃炸弹/土豆地雷/小丑僵尸）
   * @param {number}   centerCol  爆炸中心格列索引
   * @param {number}   centerRow  爆炸中心格行索引
   * @param {number}   radius     格半径（1 = 3×3）
   * @param {number}   damage
   * @param {Zombie[]} zombies
   * @param {ParticleSystem|null} particles
   */
  static aoeZombies(centerCol, centerRow, radius, damage, zombies, particles = null) {
    const px = Grid.OFFSET_X + centerCol * Grid.CELL_W + Grid.CELL_W / 2;
    const py = Grid.OFFSET_Y + centerRow * Grid.CELL_H + Grid.CELL_H / 2;

    for (const z of zombies) {
      if (!z.isAlive()) continue;
      const zCol = Math.round((z.x - Grid.OFFSET_X) / Grid.CELL_W);
      if (Math.abs(z.row - centerRow) <= radius && Math.abs(zCol - centerCol) <= radius) {
        z.takeDamage(damage, true); // ignoreArmor=true（爆炸穿甲）
        if (z.hp <= 0 && z.isAlive()) {
          z.die();
          bus.emit('zombie:died', { zombie: z });
        }
      }
    }

    if (particles) particles.spawnExplosion(px, py, '#ff4500');
  }

  /**
   * 全屏清场（毁灭菇）
   * @param {number}   damage
   * @param {Zombie[]} zombies
   * @param {ParticleSystem|null} particles
   * @param {number}   canvasW
   * @param {number}   canvasH
   */
  static nukeAll(damage, zombies, particles = null, canvasW = 960, canvasH = 680) {
    for (const z of zombies) {
      if (!z.isAlive()) continue;
      z.takeDamage(damage, true);
      if (z.hp <= 0 && z.isAlive()) {
        z.die();
        bus.emit('zombie:died', { zombie: z });
      }
    }
    if (particles) particles.spawnNuke(canvasW, canvasH);
  }
}
