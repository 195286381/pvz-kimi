/**
 * SoundSystem — 使用 Web Audio API 合成游戏音效
 * 无需外部音频文件，全部程序生成
 */
export class SoundSystem {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._masterGain = null;
    this._init();
  }

  _init() {
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 0.3;
      this._masterGain.connect(this._ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not available');
    }
  }

  _resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  // 生成一个简短的音效
  _playTone(freq, duration, type = 'sine', volume = 0.5, fadeOut = true) {
    if (!this._ctx || this._muted) return;
    this._resume();

    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;

    const now = this._ctx.currentTime;
    osc.start(now);

    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }
    osc.stop(now + duration);
  }

  // 放置植物音效（清脆高音）
  playPlantPlace() {
    this._playTone(880, 0.1, 'sine', 0.4);
    setTimeout(() => this._playTone(1100, 0.1, 'sine', 0.3), 80);
  }

  // 收集阳光音效（上升音调）
  playSunCollect() {
    this._playTone(660, 0.08, 'sine', 0.35);
    setTimeout(() => this._playTone(880, 0.12, 'sine', 0.3), 60);
  }

  // 豌豆射出音效（短促低音）
  playShoot() {
    this._playTone(220, 0.06, 'square', 0.2);
  }

  // 僵尸死亡音效（下降噪声）
  playZombieDie() {
    if (!this._ctx || this._muted) return;
    this._resume();

    const bufferSize = this._ctx.sampleRate * 0.2;
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this._ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this._ctx.createGain();
    gain.gain.value = 0.3;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);
    source.start();
  }

  // 爆炸音效（低频冲击）
  playExplosion() {
    if (!this._ctx || this._muted) return;
    this._resume();

    // 低频轰鸣
    this._playTone(60, 0.3, 'sawtooth', 0.6);
    this._playTone(80, 0.25, 'square', 0.4);

    // 噪声冲击
    const bufferSize = this._ctx.sampleRate * 0.15;
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this._ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(this._masterGain);
    source.start();
  }

  // 游戏胜利音效
  playWin() {
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.3, 'sine', 0.5), i * 150);
    });
  }

  // 游戏失败音效
  playLose() {
    const notes = [392, 349, 294, 262]; // G F D C (降调)
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.35, 'sawtooth', 0.4), i * 200);
    });
  }

  // 波次开始警报
  playWaveStart() {
    this._playTone(440, 0.15, 'square', 0.3);
    setTimeout(() => this._playTone(330, 0.2, 'square', 0.3), 150);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._masterGain) {
      this._masterGain.gain.value = this._muted ? 0 : 0.3;
    }
    return this._muted;
  }

  get muted() { return this._muted; }
}
