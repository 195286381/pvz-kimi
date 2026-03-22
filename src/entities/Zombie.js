// 僵尸状态
const STATE = { WALKING: 'walking', EATING: 'eating', DYING: 'dying', DEAD: 'dead' };

export class Zombie {
  constructor(config, row, startX) {
    this.id = config.id;
    this.emoji = config.emoji;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.armorHp = config.armorHp || 0;
    this.maxArmorHp = config.armorHp || 0;
    this.armorType = config.armorType || null;
    this.speed = config.speed;             // 格/秒
    this.pixelSpeed = config.speed * 80;   // 像素/秒（CELL_W=80）
    this.damage = config.damage;
    this.attackInterval = config.attackInterval;
    this.row = row;
    this.x = startX;    // 像素 x 坐标
    this.y = 0;         // 由 Game 根据 row 设置
    this.width = 60;
    this.height = 90;
    this.state = STATE.WALKING;
    this._attackTimer = 0;
    this._deathTimer = 0;
    this._targetPlant = null;   // 正在攻击的植物引用
    this._hitFlash = 0;
    this.flagWave = config.flagWave || false;
  }

  update(dt) {
    if (this.state === STATE.WALKING) {
      this.x -= this.pixelSpeed * dt;
    } else if (this.state === STATE.EATING) {
      this._attackTimer += dt;
      if (this._attackTimer >= this.attackInterval) {
        this._attackTimer = 0;
        this._doAttack();
      }
    } else if (this.state === STATE.DYING) {
      this._deathTimer += dt;
      if (this._deathTimer >= 0.5) this.state = STATE.DEAD;
    }
    if (this._hitFlash > 0) this._hitFlash -= dt;
  }

  render(renderer) {
    if (this.state === STATE.DEAD) return;

    const size = Math.min(this.width, this.height) * 0.8;
    renderer.drawEmoji(this.emoji, this.x, this.y, size);

    // 若 _hitFlash > 0 叠加绿色半透明遮罩（僵尸受伤为绿）
    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
        'rgba(0, 255, 0, 0.4)'
      );
    }

    // 血条
    this._renderHealthBar(renderer);

    // 护甲覆盖（armorHp > 0 时叠加护甲 Emoji）
    if (this.armorHp > 0 && this.armorType) {
      renderer.drawEmoji(this.armorType, this.x, this.y - this.height * 0.2, size * 0.7);
    }
  }

  _renderHealthBar(renderer) {
    const barW = this.width;
    const barH = 6;
    const x = this.x - barW / 2;
    const y = this.y - this.height / 2 - 10;
    const ratio = Math.max(0, this.hp / this.maxHp);

    renderer.drawRect(x, y, barW, barH, '#555');
    const color = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ffeb3b' : '#f44336';
    renderer.drawRect(x, y, barW * ratio, barH, color);

    // 护甲条（紧贴血条上方）
    if (this.maxArmorHp > 0) {
      const armorRatio = Math.max(0, this.armorHp / this.maxArmorHp);
      renderer.drawRect(x, y - barH - 2, barW, barH, '#333');
      renderer.drawRect(x, y - barH - 2, barW * armorRatio, barH, '#90a4ae');
    }
  }

  takeDamage(amount, ignoreArmor = false) {
    if (this.armorHp > 0 && !ignoreArmor) {
      this.armorHp -= amount;
      if (this.armorHp <= 0) {
        this.armorHp = 0;
        this._onArmorBroken();
      }
    } else {
      this.hp -= amount;
    }
    this._hitFlash = 0.1;
  }

  _onArmorBroken() {
    // 子类重写（如报纸僵尸破报纸后加速）
  }

  _doAttack() {
    if (this._targetPlant && !this._targetPlant.isDead()) {
      this._targetPlant.takeDamage(this.damage);
    }
  }

  startEating(plant) {
    this.state = STATE.EATING;
    this._targetPlant = plant;
    this._attackTimer = 0;
  }

  stopEating() {
    this.state = STATE.WALKING;
    this._targetPlant = null;
  }

  die() {
    this.state = STATE.DYING;
    this._deathTimer = 0;
  }

  isDead() { return this.state === STATE.DEAD; }
  isAlive() { return this.state !== STATE.DYING && this.state !== STATE.DEAD; }
  getRow() { return this.row; }
}

export { STATE as ZOMBIE_STATE };
