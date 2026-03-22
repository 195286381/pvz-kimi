export class GameLoop {
  constructor(updateFn, renderFn) {
    this._update = updateFn;
    this._render = renderFn;
    this._running = false;
    this._lastTime = 0;
    this._rafId = null;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(timestamp) {
    if (!this._running) return;

    const rawDelta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    // cap delta at 50ms to avoid spiral of death after tab switch
    const dt = Math.min(rawDelta, 50) / 1000;

    this._update(dt);
    this._render();

    this._rafId = requestAnimationFrame(this._tick);
  }
}
