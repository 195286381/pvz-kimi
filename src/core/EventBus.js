export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(fn);
  }

  off(event, fn) {
    if (!this._listeners.has(event)) return;
    const fns = this._listeners.get(event).filter(f => f !== fn);
    this._listeners.set(event, fns);
  }

  emit(event, data) {
    if (!this._listeners.has(event)) return;
    for (const fn of this._listeners.get(event)) {
      fn(data);
    }
  }
}

export const bus = new EventBus();
