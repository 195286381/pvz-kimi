/**
 * ParticleSystem — 对象池粒子系统
 *
 * 使用方法：
 *   const particles = new ParticleSystem();
 *
 *   // 每帧更新
 *   particles.update(dt);
 *
 *   // 渲染（直接使用原始 CanvasRenderingContext2D）
 *   particles.render(renderer.ctx);
 *
 * 粒子生成接口：
 *   spawnHit(x, y)               — 子弹命中火花
 *   spawnIceShatter(x, y)        — 冰冻碎裂
 *   spawnExplosion(x, y, color)  — 爆炸（樱桃炸弹/土豆/小丑）
 *   spawnNuke(canvasW, canvasH)  — 全屏核爆（毁灭菇）
 *   spawnSunCollect(x, y)        — 阳光收集闪光
 *   spawnZombieDeath(x, y)       — 僵尸死亡血花
 *   spawnPlantPlace(x, y)        — 植物种植特效
 */

// ─── 单粒子 ───────────────────────────────────────────────────────

class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 1;
    this.color = '#fff';
    this.size = 4;
    this.gravity = 0;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} vx  像素/秒
   * @param {number} vy  像素/秒
   * @param {number} life  存活秒数
   * @param {string} color CSS颜色
   * @param {number} size  初始半径（px）
   * @param {number} [gravity=0]  垂直加速度（px/s²）
   */
  init(x, y, vx, vy, life, color, size, gravity = 0) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.gravity = gravity;
  }

  update(dt) {
    if (!this.active) return;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }

  render(ctx) {
    if (!this.active) return;
    const ratio = Math.max(0, this.life / this.maxLife);
    const r = this.size * ratio;
    if (r < 0.3) return;

    ctx.save();
    ctx.globalAlpha = ratio;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── ParticleSystem ───────────────────────────────────────────────

export class ParticleSystem {
  /**
   * @param {number} [poolSize=300]  对象池大小
   */
  constructor(poolSize = 300) {
    this._pool = Array.from({ length: poolSize }, () => new Particle());
  }

  // ─── 私有：从池中取一个空闲粒子 ────────────────────────────────

  _acquire() {
    for (const p of this._pool) {
      if (!p.active) return p;
    }
    return null; // 池满时丢弃
  }

  // ─── 生成接口 ───────────────────────────────────────────────────

  /**
   * 子弹命中火花（黄/橙色放射）
   * @param {number} x
   * @param {number} y
   * @param {string} [color='#ffdd00']
   */
  spawnHit(x, y, color = '#ffdd00') {
    for (let i = 0; i < 8; i++) {
      const p = this._acquire();
      if (!p) return;
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 50 + Math.random() * 90;
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.2 + Math.random() * 0.15,
        color,
        2 + Math.random() * 3,
      );
    }
  }

  /**
   * 冰冻碎裂（寒冰射手命中）
   * @param {number} x
   * @param {number} y
   */
  spawnIceShatter(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = this._acquire();
      if (!p) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 70;
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.3 + Math.random() * 0.25,
        i % 2 === 0 ? '#a0d8ef' : '#ffffff',
        2 + Math.random() * 3,
      );
    }
  }

  /**
   * 爆炸效果（樱桃炸弹/土豆地雷/小丑僵尸死亡）
   * @param {number} x
   * @param {number} y
   * @param {string} [color='#ff4500']
   */
  spawnExplosion(x, y, color = '#ff4500') {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      const size = 4 + Math.random() * 12;
      const life = 0.4 + Math.random() * 0.5;
      // 每三颗切换颜色，营造多色火焰
      const c = i % 3 === 0 ? '#ffcc00' : i % 3 === 1 ? color : '#ff8800';
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 30,
        life, c, size,
        150, // 重力（粒子向上散开后下落）
      );
    }
  }

  /**
   * 全屏核爆（毁灭菇）— 多点随机爆炸
   * @param {number} canvasW
   * @param {number} canvasH
   */
  spawnNuke(canvasW = 960, canvasH = 680) {
    const points = 10;
    for (let n = 0; n < points; n++) {
      const cx = 80 + Math.random() * (canvasW - 160);
      const cy = 60 + Math.random() * (canvasH - 120);
      const color = n % 2 === 0 ? '#ff4500' : '#ffaa00';
      this.spawnExplosion(cx, cy, color);
    }
  }

  /**
   * 阳光收集闪光（向上飘散的金黄色粒子）
   * @param {number} x
   * @param {number} y
   */
  spawnSunCollect(x, y) {
    for (let i = 0; i < 12; i++) {
      const p = this._acquire();
      if (!p) continue;
      const vx = (Math.random() - 0.5) * 120;
      const vy = -80 - Math.random() * 100;
      p.init(
        x, y,
        vx, vy,
        0.4 + Math.random() * 0.35,
        i % 2 === 0 ? '#ffe000' : '#fff176',
        5 + Math.random() * 6,
        80,
      );
    }
  }

  /**
   * 僵尸死亡（绿/紫血花）
   * @param {number} x
   * @param {number} y
   */
  spawnZombieDeath(x, y) {
    const colors = ['#4caf50', '#8bc34a', '#9c27b0', '#66bb6a'];
    for (let i = 0; i < 14; i++) {
      const p = this._acquire();
      if (!p) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 90;
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 40,
        0.35 + Math.random() * 0.3,
        colors[i % colors.length],
        3 + Math.random() * 5,
        120,
      );
    }
  }

  /**
   * 植物种植特效（绿色向上散开）
   * @param {number} x
   * @param {number} y
   */
  spawnPlantPlace(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = this._acquire();
      if (!p) continue;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
      const speed = 30 + Math.random() * 60;
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.35 + Math.random() * 0.3,
        i % 2 === 0 ? '#66bb6a' : '#a5d6a7',
        3 + Math.random() * 4,
        60,
      );
    }
  }

  /**
   * 阳光掉落光晕（天空阳光出现时）
   * @param {number} x
   * @param {number} y
   */
  spawnSunAppear(x, y) {
    for (let i = 0; i < 6; i++) {
      const p = this._acquire();
      if (!p) continue;
      const angle = (i / 6) * Math.PI * 2;
      p.init(
        x, y,
        Math.cos(angle) * 20,
        Math.sin(angle) * 20,
        0.5,
        '#ffe000',
        6 + Math.random() * 4,
      );
    }
  }

  // ─── 每帧更新 & 渲染 ────────────────────────────────────────────

  update(dt) {
    for (const p of this._pool) {
      if (p.active) p.update(dt);
    }
  }

  /**
   * 渲染所有活跃粒子
   * @param {CanvasRenderingContext2D} ctx  renderer.ctx
   */
  render(ctx) {
    for (const p of this._pool) {
      if (p.active) p.render(ctx);
    }
  }

  // ─── 调试 ───────────────────────────────────────────────────────

  /** 当前活跃粒子数 */
  get activeCount() {
    let n = 0;
    for (const p of this._pool) if (p.active) n++;
    return n;
  }
}
