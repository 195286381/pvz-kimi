export class Projectile {
  constructor({ type, x, y, row, damage, speed = 400, emoji = '🟢', freezeDuration = 0 }) {
    this.type = type;     // 'pea' | 'snow_pea' | 'fire_pea' | 'spore' | 'fume'
    this.x = x;
    this.y = y;
    this.row = row;
    this.damage = damage;
    this.speed = speed;   // 像素/秒，fume类型为0（即时全行）
    this.emoji = emoji;
    this.freezeDuration = freezeDuration;  // 寒冰豌豆减速持续秒数
    this.width = 20;
    this.height = 20;
    this.active = true;   // false 表示待移除
  }

  update(dt) {
    if (!this.active) return;
    this.x += this.speed * dt;
    // 超出屏幕右边界（或左边界）则 deactivate
    if (this.x > 900 || this.x < -50) this.active = false;
  }

  render(renderer) {
    if (!this.active) return;
    renderer.drawEmoji(this.emoji, this.x, this.y, 20);
  }

  deactivate() { this.active = false; }
}
