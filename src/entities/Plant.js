export class Plant {
  constructor(config, row, col) {
    // config 来自 data/plants.js 中的静态数据
    this.id = config.id;
    this.emoji = config.emoji;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.cost = config.cost;
    this.cooldown = config.cooldown;
    this.row = row;
    this.col = col;
    this.x = 0;       // 像素坐标，由 Game 根据 Grid 设置
    this.y = 0;
    this.width = 70;
    this.height = 90;
    this._hitFlash = 0;     // 受伤闪红帧计时器（秒）
    this._shootTimer = 0;   // 射击计时器（子类用）
  }

  update(dt) {
    // 受伤闪烁倒计时
    if (this._hitFlash > 0) this._hitFlash -= dt;
  }

  render(renderer) {
    // 绘制植物 Emoji（居中在格子）
    renderer.drawEmoji(this.emoji, this.x, this.y, Math.min(this.width, this.height) * 0.8);

    // 若 _hitFlash > 0 则叠加红色半透明遮罩
    if (this._hitFlash > 0) {
      renderer.drawRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height,
        'rgba(255, 0, 0, 0.4)'
      );
    }

    // 血条（hp < maxHp 时显示）
    if (this.hp < this.maxHp) {
      this._renderHealthBar(renderer);
    }
  }

  _renderHealthBar(renderer) {
    const barW = this.width;
    const barH = 6;
    const x = this.x - barW / 2;
    const y = this.y - this.height / 2 - 10;
    const ratio = Math.max(0, this.hp / this.maxHp);

    // 背景（灰色）
    renderer.drawRect(x, y, barW, barH, '#555');
    // 前景（绿色→黄色→红色）
    const color = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ffeb3b' : '#f44336';
    renderer.drawRect(x, y, barW * ratio, barH, color);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
  }

  isDead() { return this.hp <= 0; }

  // 子类实现，返回描述攻击目标行的信息
  getRow() { return this.row; }
}
