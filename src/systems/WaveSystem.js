import { bus } from '../core/EventBus.js';
import { LEVELS } from '../data/levels.js';

// 场景行数映射
const SCENE_ROWS = { day: 5, night: 5, fog: 5, roof: 5, pool: 6 };

export class WaveSystem {
  constructor(levelId) {
    this.levelId = levelId;
    const level = LEVELS.find(l => l.id === levelId);
    this.waves = level.waves;
    this.scene = level.scene;
    this.currentWave = -1;       // 还未开始（0-indexed 当前波次）
    this.totalWaves = this.waves.length;
    this._state = 'waiting';     // 'waiting' | 'spawning' | 'fighting' | 'complete'
    this._spawnQueue = [];       // 待生成僵尸列表 [{zombieId, row, timer}]
    this._spawnTimer = 0;        // 下次生成倒计时
    this._waitTimer = 0;         // waiting 状态计时
    this._waitDelay = 5;         // 波次间等待秒数
    this._forceTimer = 0;        // fighting 超时计时
    this.activeZombies = 0;      // 场上僵尸数（外部维护）
    this._started = false;
  }

  start() {
    this._started = true;
    this._waitTimer = 3;         // 关卡开始3s后第一波
    this._state = 'waiting';
  }

  /**
   * 每帧更新，返回本帧需要生成的僵尸指令数组
   * @param {number} dt
   * @returns {{zombieId: string, row: number}[]}
   */
  update(dt) {
    if (!this._started) return [];

    const toSpawn = [];

    // ── waiting ──────────────────────────────────────────────
    if (this._state === 'waiting') {
      this._waitTimer -= dt;
      if (this._waitTimer <= 0) {
        this._beginNextWave();
      }
      return toSpawn;
    }

    // ── spawning ─────────────────────────────────────────────
    if (this._state === 'spawning') {
      this._spawnTimer -= dt;
      while (this._spawnTimer <= 0 && this._spawnQueue.length > 0) {
        const entry = this._spawnQueue.shift();
        toSpawn.push({ zombieId: entry.zombieId, row: entry.row });
        // 设置下一只间隔
        const isFlagWave = this.waves[this.currentWave]?.isFlagWave;
        const minI = isFlagWave ? 0.1 : 0.3;
        const maxI = isFlagWave ? 0.3 : 0.8;
        this._spawnTimer += minI + Math.random() * (maxI - minI);
      }
      if (this._spawnQueue.length === 0) {
        this._state = 'fighting';
        this._forceTimer = 0;
      }
      return toSpawn;
    }

    // ── fighting ─────────────────────────────────────────────
    if (this._state === 'fighting') {
      this._forceTimer += dt;
      const cleared = this.activeZombies === 0;
      const timedOut = this._forceTimer >= 20;
      if (cleared || timedOut) {
        bus.emit('wave:cleared', { waveIdx: this.currentWave, timedOut });
        if (this.currentWave >= this.totalWaves - 1) {
          this._state = 'complete';
          bus.emit('wave:complete', {});
        } else {
          this._state = 'waiting';
          this._waitTimer = this._waitDelay;
        }
      }
      return toSpawn;
    }

    return toSpawn;
  }

  onZombieKilled() { this.activeZombies = Math.max(0, this.activeZombies - 1); }
  onZombieSpawned() { this.activeZombies++; }

  /** 波次进度 0-1（用于进度条） */
  getProgress() {
    if (this.totalWaves === 0) return 1;
    return Math.max(0, this.currentWave) / this.totalWaves;
  }

  isFlagWave() {
    return this.waves[this.currentWave]?.isFlagWave || false;
  }

  isComplete() { return this._state === 'complete'; }

  // ─── 私有 ────────────────────────────────────────────────────

  _beginNextWave() {
    this.currentWave++;
    if (this.currentWave >= this.totalWaves) {
      this._state = 'complete';
      bus.emit('wave:complete', {});
      return;
    }

    const wave = this.waves[this.currentWave];
    const rows = SCENE_ROWS[this.scene] || 5;
    this._spawnQueue = this._buildQueue(wave, rows);
    this._spawnTimer = 0;
    this._state = 'spawning';

    bus.emit('wave:start', {
      waveIdx: this.currentWave,
      isFlagWave: !!wave.isFlagWave,
      totalWaves: this.totalWaves,
    });
  }

  /**
   * 根据波次配置构建生成队列
   * 旗手波：每行一只旗手先行，再加配置中其余僵尸（随机行）
   */
  _buildQueue(wave, rows) {
    const queue = [];

    if (wave.isFlagWave) {
      // 旗手先行，每行一只（确保每行都有旗手）
      for (let r = 0; r < rows; r++) {
        queue.push({ zombieId: 'flag', row: r });
      }
    }

    // 其余僵尸（过滤掉旗手，旗手已上面处理）
    for (const zombieId of wave.zombies) {
      if (zombieId === 'flag') continue;
      queue.push({ zombieId, row: Math.floor(Math.random() * rows) });
    }

    return queue;
  }
}
