export class PlantCard {
  constructor(plantId, config) {
    this.plantId = plantId;
    this.emoji = config.emoji;
    this.cost = config.cost;
    this.cooldown = config.cooldown;
    this._cooldownRemaining = 0;
    this.selected = false;
    // layout set by HUD
    this.x = 0;
    this.y = 0;
    this.width = 60;
    this.height = 80;
  }

  update(dt) {
    if (this._cooldownRemaining > 0) {
      this._cooldownRemaining = Math.max(0, this._cooldownRemaining - dt);
    }
  }

  render(renderer, sunAmount) {
    const ctx = renderer.ctx;
    const { x, y, width: w, height: h } = this;
    const affordable = sunAmount >= this.cost;
    const ready = this.isReady(sunAmount);

    // background
    let bg = ready ? '#4a7a2e' : '#2e3a28';
    if (this.selected) bg = '#7ab83a';
    renderer.drawRoundRect(x, y, w, h, 6, bg);

    // border
    ctx.strokeStyle = this.selected ? '#ffffff' : (ready ? '#6dbb44' : '#404040');
    ctx.lineWidth = this.selected ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.stroke();

    // emoji
    renderer.drawEmoji(this.emoji, x + w / 2, y + h * 0.38, 28);

    // cost
    renderer.drawText(`☀${this.cost}`, x + w / 2, y + h - 13, {
      size: 11,
      color: affordable ? '#FFD700' : '#888',
      align: 'center',
      baseline: 'middle',
    });

    // cooldown overlay — grows down from top
    if (this._cooldownRemaining > 0) {
      const ratio = this._cooldownRemaining / this.cooldown;
      renderer.save();
      renderer.setAlpha(0.68);
      renderer.drawRect(x, y, w, h * ratio, '#111');
      renderer.resetAlpha();
      renderer.restore();

      renderer.drawText(Math.ceil(this._cooldownRemaining) + 's', x + w / 2, y + h * 0.5, {
        size: 13,
        color: '#eee',
        align: 'center',
        baseline: 'middle',
      });
    }

    // selected: highlight pulse ring
    if (this.selected) {
      ctx.strokeStyle = `rgba(255,255,0,${0.5 + 0.5 * Math.sin(Date.now() / 150)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 7);
      ctx.stroke();
    }
  }

  startCooldown() {
    this._cooldownRemaining = this.cooldown;
  }

  isReady(sunAmount) {
    return this._cooldownRemaining <= 0 && sunAmount >= this.cost;
  }

  containsPoint(mx, my) {
    return mx >= this.x && mx <= this.x + this.width &&
           my >= this.y && my <= this.y + this.height;
  }
}
