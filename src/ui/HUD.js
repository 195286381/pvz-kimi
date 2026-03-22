import { PlantCard } from './PlantCard.js';
import { PLANTS } from '../data/plants.js';

const HUD_H      = 90;
const CARD_W     = 60;
const CARD_H     = 80;
const CARD_GAP   = 5;
const CARD_STEP  = CARD_W + CARD_GAP;  // 65px per card slot
const CARDS_X    = 5;
const CARDS_Y    = 5;
const MAX_VISIBLE = 8;
const SUN_BOX_X  = CARDS_X + MAX_VISIBLE * CARD_STEP + 20; // 545
const SUN_BOX_W  = 80;

// Plants available per scene (ordered for display)
const SCENE_PLANTS = {
  day:   ['sunflower','peashooter','wallnut','cherrybomb','potatomine','snowpea','repeater','chomper','fumeshroom','tallnut','magneshroom','torchwood','doomshroom'],
  night: ['sunflower','peashooter','wallnut','cherrybomb','potatomine','snowpea','repeater','chomper','puffshroom','sunshroom','fumeshroom','tallnut','magneshroom','torchwood','doomshroom'],
  pool:  ['sunflower','peashooter','wallnut','cherrybomb','potatomine','snowpea','repeater','chomper','fumeshroom','lilypad','tallnut','magneshroom','torchwood','doomshroom'],
  fog:   ['sunflower','peashooter','wallnut','cherrybomb','potatomine','snowpea','repeater','chomper','fumeshroom','tallnut','magneshroom','torchwood','doomshroom'],
  roof:  ['sunflower','peashooter','wallnut','cherrybomb','potatomine','snowpea','repeater','chomper','fumeshroom','tallnut','magneshroom','torchwood','doomshroom','flowerpot'],
};

// Plants that cost 0 at night
const NIGHT_FREE = new Set(['puffshroom', 'doomshroom']);

export class HUD {
  constructor(sceneType = 'day') {
    this.sceneType = sceneType;
    this.cards = [];
    this._selectedCard   = null;
    this._sunAmount      = 50;
    this._sunFlash       = 0;
    this._mouseX         = 0;
    this._mouseY         = 0;
    this._previewPlant   = null;
    this.height          = HUD_H;
    this._scrollOffset   = 0;
    this._maxVisible     = MAX_VISIBLE;
    this._totalCards     = 0;
    this._initCards(sceneType);
  }

  _initCards(sceneType) {
    const plantIds = SCENE_PLANTS[sceneType] || SCENE_PLANTS.day;
    this._totalCards = plantIds.length;

    this.cards = plantIds.map(id => {
      const config = PLANTS[id];
      const card = new PlantCard(id, config);
      card.width  = CARD_W;
      card.height = CARD_H;
      // Override cost for night-free plants
      if (sceneType === 'night' && NIGHT_FREE.has(id)) {
        card.cost = 0;
      }
      return card;
    });
  }

  // Sync x/y of currently-visible cards to their screen positions
  _syncVisiblePositions() {
    const end = Math.min(this._scrollOffset + this._maxVisible, this._totalCards);
    for (let i = this._scrollOffset; i < end; i++) {
      this.cards[i].x = CARDS_X + (i - this._scrollOffset) * CARD_STEP;
      this.cards[i].y = CARDS_Y;
    }
  }

  update(dt, sunAmount) {
    this._sunAmount = sunAmount;
    this._sunFlash  = sunAmount >= 9990 ? this._sunFlash + dt : 0;
    this.cards.forEach(c => c.update(dt));
  }

  render(renderer) {
    const ctx = renderer.ctx;
    const W   = renderer.width;

    // ── HUD background bar ──────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, 0, HUD_H);
    grad.addColorStop(0, 'rgba(15,35,10,0.92)');
    grad.addColorStop(1, 'rgba(8,22,5,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, HUD_H);

    ctx.strokeStyle = 'rgba(90,150,50,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HUD_H);
    ctx.lineTo(W, HUD_H);
    ctx.stroke();

    // ── Plant cards (visible window) ────────────────────────────
    this._syncVisiblePositions();
    const end = Math.min(this._scrollOffset + this._maxVisible, this._totalCards);
    for (let i = this._scrollOffset; i < end; i++) {
      this.cards[i].render(renderer, this._sunAmount);
    }

    // ── Scroll arrows ────────────────────────────────────────────
    if (this._scrollOffset > 0) {
      renderer.drawText('◀', 2, 45, { size: 18, color: '#fff', align: 'left', baseline: 'middle' });
    }
    if (this._scrollOffset + this._maxVisible < this._totalCards) {
      const ax = CARDS_X + this._maxVisible * CARD_STEP + 2;
      renderer.drawText('▶', ax, 45, { size: 18, color: '#fff', align: 'left', baseline: 'middle' });
    }

    // ── Sun box ───────────────────────────────────────────────────
    renderer.drawRoundRect(SUN_BOX_X, CARDS_Y, SUN_BOX_W, CARD_H, 6, 'rgba(255,195,0,0.15)');
    ctx.strokeStyle = 'rgba(255,195,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(SUN_BOX_X, CARDS_Y, SUN_BOX_W, CARD_H, 6);
    ctx.stroke();

    renderer.drawEmoji('☀️', SUN_BOX_X + 20, CARDS_Y + CARD_H * 0.36, 22);

    const isFull   = this._sunAmount >= 9990;
    const sunColor = isFull
      ? `hsl(${45 + 15 * Math.sin(this._sunFlash * 6)}, 100%, 65%)`
      : '#ffffff';
    renderer.drawText(String(this._sunAmount),
      SUN_BOX_X + SUN_BOX_W / 2 + 8, CARDS_Y + CARD_H - 14, {
        size: 17, color: sunColor,
        align: 'center', baseline: 'middle', font: 'bold Arial',
      });

    // ── Mouse-follow preview ──────────────────────────────────────
    if (this._previewPlant && this._mouseY > HUD_H) {
      const config = PLANTS[this._previewPlant];
      renderer.save();
      renderer.setAlpha(0.55);
      renderer.drawEmoji(config.emoji, this._mouseX, this._mouseY, 56);
      renderer.resetAlpha();
      renderer.restore();
    }
  }

  handleClick(mx, my) {
    if (my > HUD_H) return null;

    // Left scroll arrow (first 15px)
    if (mx < 15 && this._scrollOffset > 0) {
      this._scrollOffset--;
      this.cancelSelection();
      return null;
    }

    // Right scroll arrow
    const rightArrowX = CARDS_X + this._maxVisible * CARD_STEP + 2;
    if (mx >= rightArrowX && mx < rightArrowX + 20 &&
        this._scrollOffset + this._maxVisible < this._totalCards) {
      this._scrollOffset++;
      this.cancelSelection();
      return null;
    }

    // Plant card clicks (positions already synced by render; safe to hit-test)
    const end = Math.min(this._scrollOffset + this._maxVisible, this._totalCards);
    for (let i = this._scrollOffset; i < end; i++) {
      const card = this.cards[i];
      if (card.containsPoint(mx, my)) {
        if (!card.isReady(this._sunAmount)) return null;
        if (this._selectedCard === card) {
          this.cancelSelection();
          return null;
        }
        this.cards.forEach(c => (c.selected = false));
        card.selected = true;
        this._selectedCard  = card;
        this._previewPlant  = card.plantId;
        return card;
      }
    }
    return null;
  }

  handleMouseMove(mx, my) {
    this._mouseX = mx;
    this._mouseY = my;
  }

  cancelSelection() {
    this._selectedCard = null;
    this._previewPlant = null;
    this.cards.forEach(c => (c.selected = false));
  }

  confirmPlacement(plantId) {
    const card = this.cards.find(c => c.plantId === plantId);
    if (card) card.startCooldown();
    this.cancelSelection();
  }

  getSelectedPlantId() {
    return this._selectedCard ? this._selectedCard.plantId : null;
  }

  containsPoint(mx, my) {
    return my >= 0 && my <= HUD_H;
  }
}
