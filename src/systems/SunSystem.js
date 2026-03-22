import { bus } from '../core/EventBus.js';

// ── internal sun entity ───────────────────────────────────────────────────────

class Sun {
  constructor(x, y, targetY, amount = 25) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.amount = amount;
    this.collected = false;
    this.opacity = 1;
    this.floatOffset = 0;         // vertical oscillation
    this._floatDir = 1;
    this._fallSpeed = 50 + Math.random() * 30; // px/s
    this._lifeTimer = 0;
    this._maxLife = 10;           // auto-vanish after 10s
    this._fadeTimer = 0;
    this._fading = false;
    this.radius = 28;
  }

  update(dt) {
    if (this.collected) {
      // fade out after collect
      this.opacity = Math.max(0, this.opacity - dt * 5);
      return;
    }

    // fall toward target
    if (this.y < this.targetY) {
      this.y = Math.min(this.targetY, this.y + this._fallSpeed * dt);
    }

    // float animation once landed
    if (this.y >= this.targetY) {
      this.floatOffset += this._floatDir * 18 * dt;
      if (this.floatOffset > 4) this._floatDir = -1;
      if (this.floatOffset < -4) this._floatDir = 1;
    }

    // auto-vanish countdown
    this._lifeTimer += dt;
    if (this._lifeTimer > this._maxLife - 1.5) {
      // blink in final 1.5s
      this.opacity = 0.4 + 0.6 * Math.abs(Math.sin(this._lifeTimer * 6));
    }
    if (this._lifeTimer >= this._maxLife) {
      this.collected = true; // mark expired (no sun given)
      this._expired = true;
    }
  }

  render(renderer) {
    if (this.opacity <= 0) return;
    renderer.save();
    renderer.setAlpha(this.opacity);

    const drawY = this.y + this.floatOffset;

    // glow
    renderer.setAlpha(this.opacity * 0.3);
    renderer.drawCircle(this.x, drawY, this.radius + 8, '#FFD700');
    renderer.setAlpha(this.opacity);

    renderer.drawCircle(this.x, drawY, this.radius, '#FFC200');
    renderer.drawEmoji('☀️', this.x, drawY, this.radius * 1.7);

    // cost label
    renderer.drawText(`${this.amount}`, this.x, drawY + this.radius + 10, {
      size: 11,
      color: '#fff',
      align: 'center',
      baseline: 'top',
    });

    renderer.resetAlpha();
    renderer.restore();
  }

  hitTest(mx, my) {
    const dx = mx - this.x;
    const dy = my - (this.y + this.floatOffset);
    return dx * dx + dy * dy <= (this.radius + 8) ** 2;
  }
}

// ── SunSystem ─────────────────────────────────────────────────────────────────

export class SunSystem {
  constructor(scene) {
    this.scene = scene;   // 'day' | 'night' | etc.
    this.amount = 50;
    this.MAX = 9990;
    this._suns = [];
    this._skyTimer = 0;
    this._skyInterval = this._nextSkyInterval();
  }

  _nextSkyInterval() {
    return 8 + Math.random() * 4; // 8–12 s
  }

  update(dt, grid) {
    // sky sun only in day scene
    if (this.scene === 'day') {
      this._skyTimer += dt;
      if (this._skyTimer >= this._skyInterval) {
        this._skyTimer = 0;
        this._skyInterval = this._nextSkyInterval();
        this._spawnSkySun(grid);
      }
    }

    for (const sun of this._suns) sun.update(dt);

    // remove fully faded suns
    this._suns = this._suns.filter(s => s.opacity > 0);
  }

  _spawnSkySun(grid) {
    const col = Math.floor(Math.random() * 9);
    const x = grid ? grid.getCellRect(0, col).x + grid.constructor.CELL_W / 2
                   : 120 + col * 80 + 40;
    const row = Math.floor(Math.random() * 5);
    const targetY = grid ? grid.getCellRect(row, col).y + 30
                         : 80 + row * 100 + 30;
    this._suns.push(new Sun(x, -30, targetY, 25));
  }

  render(renderer) {
    for (const sun of this._suns) sun.render(renderer);
  }

  tryCollect(mx, my) {
    for (const sun of this._suns) {
      if (!sun.collected && !sun._expired && sun.hitTest(mx, my)) {
        sun.collected = true;
        this.addSun(sun.amount);
        bus.emit('sun:collected', { amount: sun.amount });
        return true;
      }
    }
    return false;
  }

  addSun(amount) {
    if (this.amount < this.MAX) {
      this.amount = Math.min(this.MAX, this.amount + amount);
      bus.emit('sun:changed', this.amount);
    }
  }

  spend(amount) {
    if (this.amount < amount) return false;
    this.amount -= amount;
    bus.emit('sun:changed', this.amount);
    return true;
  }

  canAfford(cost) {
    return this.amount >= cost;
  }

  spawnSunAt(x, y, amount) {
    const targetY = y + 25;
    this._suns.push(new Sun(x, y - 10, targetY, amount));
  }

  // Alias used by SunShroom
  spawnPlantSun(x, y, amount) {
    this.spawnSunAt(x, y, amount);
  }
}
