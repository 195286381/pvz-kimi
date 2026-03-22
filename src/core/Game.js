import { bus } from './EventBus.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { Grid } from './Grid.js';
import { createSceneAndGrid } from '../scenes/factory.js';
import { SunSystem } from '../systems/SunSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';
import { SCREEN } from '../ui/Screens.js';
// plant classes needed for dispatch logic
import { Sunflower } from '../plants/Sunflower.js';
import { CherryBomb } from '../plants/CherryBomb.js';
// registries
import { PLANT_REGISTRY } from '../plants/index.js';
import { ZOMBIE_REGISTRY } from '../zombies/index.js';
import { PLANTS } from '../data/plants.js';
import { LEVELS } from '../data/levels.js';

export class Game {
  constructor(levelId = 1, screens = null) {
    this.levelId = levelId;
    this.screens = screens;

    const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    this._sceneType = level.scene || 'day';

    const canvas = document.getElementById('gameCanvas');
    this._canvas = canvas;
    this.renderer = new Renderer(canvas);

    const { scene, grid } = createSceneAndGrid(this._sceneType);
    this.grid = grid;
    this.scene = scene;

    this.sunSystem = new SunSystem(this._sceneType);
    this.waveSystem = new WaveSystem(levelId);
    this.collisionSystem = new CollisionSystem();
    this.particles = new ParticleSystem();
    this.hud = new HUD(this._sceneType);

    this.plants = [];
    this.zombies = [];
    this.projectiles = [];

    this._gameState = 'playing'; // 'playing' | 'paused' | 'ending' | 'done'
    this._hoveredCell = null;
    this._mouseX = 0;
    this._mouseY = 0;
    this._endTimer = 0;

    // Store handlers so they can be removed in destroy()
    this._busHandlers = [];
    this._boundClick = this._handleClick.bind(this);
    this._boundMove = this._handleMove.bind(this);
    this._boundLeave = this._handleLeave.bind(this);
    this._boundContext = this._handleContext.bind(this);
    this._boundKey = this._handleKey.bind(this);

    this._setupEvents();
    this._setupInput(canvas);

    this.loop = new GameLoop(dt => this.update(dt), () => this.render());
    this.loop.start();
    this.waveSystem.start();
  }

  // ── cleanup ──────────────────────────────────────────────────────────────────

  destroy() {
    this.loop.stop();
    for (const { event, fn } of this._busHandlers) bus.off(event, fn);
    this._busHandlers = [];
    const c = this._canvas;
    c.removeEventListener('click', this._boundClick);
    c.removeEventListener('mousemove', this._boundMove);
    c.removeEventListener('mouseleave', this._boundLeave);
    c.removeEventListener('contextmenu', this._boundContext);
    document.removeEventListener('keydown', this._boundKey);
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  _on(event, fn) {
    bus.on(event, fn);
    this._busHandlers.push({ event, fn });
  }

  // ── event wiring ─────────────────────────────────────────────────────────────

  _setupEvents() {
    this._on('zombie:died', () => {
      this.waveSystem.onZombieKilled();
    });

    this._on('game:over', () => {
      if (this._gameState !== 'playing') return;
      this._gameState = 'done';
      this.loop.stop();
      bus.emit('game:lose');
    });

    this._on('wave:complete', () => {
      if (this._gameState !== 'playing') return;
      this._gameState = 'ending'; // will emit game:win after 2s delay
      this._endTimer = 2;
    });

    this._on('game:resume', () => {
      if (this._gameState !== 'paused') return;
      this._gameState = 'playing';
      this.loop.start();
    });

    // PotatoMine area explosion
    this._on('plant:explosion', ({ row, col, damage, radius }) => {
      CollisionSystem.aoeZombies(col, row, radius, damage, this.zombies, this.particles);
    });

    // DoomShroom full-screen nuke
    this._on('plant:doomExplosion', ({ damage }) => {
      CollisionSystem.nukeAll(damage, this.zombies, this.particles, 800, 600);
    });

    // FlowerPot destroyed: remove all plants at that cell (pot + stacked plant)
    this._on('plant:flowerpotDestroyed', ({ row, col }) => {
      this.plants = this.plants.filter(p => !(p.row === row && p.col === col));
      this.grid.setState(row, col, 'empty');
    });
  }

  // ── input ─────────────────────────────────────────────────────────────────────

  _setupInput(canvas) {
    canvas.addEventListener('click', this._boundClick);
    canvas.addEventListener('mousemove', this._boundMove);
    canvas.addEventListener('mouseleave', this._boundLeave);
    canvas.addEventListener('contextmenu', this._boundContext);
    document.addEventListener('keydown', this._boundKey);
  }

  _handleClick(e) {
    if (this._gameState !== 'playing') return;
    const rect = this._canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // 1. HUD area
    if (this.hud.containsPoint(mx, my)) {
      this.hud.handleClick(mx, my);
      return;
    }

    // 2. Sun collection
    if (this.sunSystem.tryCollect(mx, my)) {
      this.particles.spawnSunCollect(mx, my);
      return;
    }

    // 2b. DoomShroom 白天激活：点击处于等待激活状态的毁灭菇
    if (this._hoveredCell) {
      const { row, col } = this._hoveredCell;
      const doom = this.plants.find(
        p => p.id === 'doomshroom' && p.row === row && p.col === col && p._waitingForActivation
      );
      if (doom) {
        doom.activate(this.sunSystem);
        return;
      }
    }

    // 3. Plant placement
    const selectedId = this.hud.getSelectedPlantId();
    if (selectedId && this._hoveredCell) {
      this._tryPlacePlant(selectedId, this._hoveredCell.row, this._hoveredCell.col);
    }
  }

  _handleMove(e) {
    const rect = this._canvas.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._hoveredCell = this.grid.getCellFromPoint(this._mouseX, this._mouseY);
    this.hud.handleMouseMove(this._mouseX, this._mouseY);
    this.scene.setHoveredCell(this._hoveredCell);
  }

  _handleLeave() {
    this._hoveredCell = null;
    this.scene.setHoveredCell(null);
  }

  _handleContext(e) {
    e.preventDefault();
    this.hud.cancelSelection();
  }

  _handleKey(e) {
    if (e.key === 'Escape') {
      if (this._gameState === 'playing') {
        this._gameState = 'paused';
        this.loop.stop();
        this.screens?.setState(SCREEN.PAUSED);
      }
    }
  }

  // ── plant / zombie factories ──────────────────────────────────────────────────

  _tryPlacePlant(plantId, row, col) {
    const config = PLANTS[plantId];
    if (!config) return;
    if (!this.sunSystem.canAfford(config.cost)) return;
    if (!this.grid.isValidCell(row, col)) return;

    const cellState = this.grid.getState(row, col);

    // Lilypad goes on water; all others go on empty land cells
    if (plantId === 'lilypad') {
      if (cellState !== 'water') return;
    } else if (cellState !== 'empty') {
      return;
    }

    const PlantClass = PLANT_REGISTRY[plantId];
    if (!PlantClass) return;

    // Pass sceneType as 3rd arg — DoomShroom/Magneshroom use it; others ignore it
    const plant = new PlantClass(row, col, this._sceneType);
    const rect = this.grid.getCellRect(row, col);
    plant.x = rect.x + rect.w / 2;
    plant.y = rect.y + rect.h / 2;

    this.plants.push(plant);
    this.grid.setState(row, col, 'plant');
    this.sunSystem.spend(config.cost);
    this.hud.confirmPlacement(plantId);
    this.particles.spawnPlantPlace(plant.x, plant.y);
  }

  _spawnZombie(zombieId, row) {
    const ZombieClass = ZOMBIE_REGISTRY[zombieId];
    if (!ZombieClass) return;

    const startX = Grid.OFFSET_X + 9 * Grid.CELL_W + 80;
    const zombie = new ZombieClass(row, startX);
    const rect = this.grid.getCellRect(row, 0);
    zombie.y = rect.y + rect.h / 2;
    this.zombies.push(zombie);
    this.waveSystem.onZombieSpawned();
  }

  // ── update ────────────────────────────────────────────────────────────────────

  update(dt) {
    // 'ending': run particles + countdown, then emit win
    if (this._gameState === 'ending') {
      this._endTimer -= dt;
      this.particles.update(dt);
      if (this._endTimer <= 0) {
        this._gameState = 'done';
        this.loop.stop();
        bus.emit('game:win');
      }
      return;
    }

    if (this._gameState !== 'playing') return;

    // 1. Wave system → spawn commands
    const spawnCmds = this.waveSystem.update(dt);
    for (const cmd of spawnCmds) this._spawnZombie(cmd.zombieId, cmd.row);

    // 2. Sun system
    this.sunSystem.update(dt, this.grid);

    // 3. Plants
    this._updatePlants(dt);

    // 4. Zombies
    for (const z of this.zombies) z.update(dt);

    // 5. Projectiles
    for (const p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter(p => p.active);

    // 6. Collision
    this.collisionSystem.update(dt, this.projectiles, this.zombies, this.plants, this.particles);

    // 7. Remove fully dead zombies (after dying animation)
    this.zombies = this.zombies.filter(z => !z.isDead());

    // 8. Particles
    this.particles.update(dt);

    // 9. HUD
    this.hud.update(dt, this.sunSystem.amount);
  }

  _updatePlants(dt) {
    // Shared context for all context-pattern plants
    const context = {
      zombies: this.zombies,
      plants: this.plants,
      particles: this.particles,
      addProjectile: (p) => this.projectiles.push(p),
      sunSystem: this.sunSystem,
    };

    const toRemove = [];

    for (const plant of this.plants) {
      if (plant instanceof Sunflower) {
        // Sunflower needs sunSystem directly to call spawnSunAt
        plant.update(dt, this.sunSystem);

      } else if (plant instanceof CherryBomb) {
        // CherryBomb returns explosion event object
        const result = plant.update(dt);
        if (result && result.type === 'explosion') {
          CollisionSystem.aoeZombies(
            result.col, result.row, result.radius, result.damage,
            this.zombies, this.particles
          );
        }

      } else {
        // All other plants use the context pattern:
        // Peashooter, SnowPea, Repeater, Chomper, FumeShroom, PotatoMine, PuffShroom,
        // SunShroom, Magneshroom, Torchwood, DoomShroom, TallNut, Lilypad, FlowerPot
        plant.update(dt, context);
      }

      if (plant.isDead()) toRemove.push(plant);
    }

    for (const p of toRemove) this.grid.setState(p.row, p.col, 'empty');
    this.plants = this.plants.filter(p => !p.isDead());
  }

  // ── render ────────────────────────────────────────────────────────────────────

  render() {
    this.renderer.clear();

    // 1. Scene background + grid
    this.scene.render(this.renderer);

    // 2. Placement preview
    this._renderPlacementPreview();

    // 3. Plants
    for (const plant of this.plants) plant.render(this.renderer);

    // 4. Projectiles
    for (const proj of this.projectiles) proj.render(this.renderer);

    // 5. Zombies (including dying-animation bodies)
    for (const zombie of this.zombies) zombie.render(this.renderer);

    // 6. Fog layer (FogScene overlays fog after zombies)
    if (this.scene.renderFog) {
      this.scene.renderFog(this.renderer);
    }

    // 7. Sun balls
    this.sunSystem.render(this.renderer);

    // 8. Particles
    this.particles.render(this.renderer.ctx);

    // 9. HUD
    this.hud.render(this.renderer);

    // 10. Wave progress bar
    this._renderWaveProgress();
  }

  _renderPlacementPreview() {
    const plantId = this.hud.getSelectedPlantId();
    if (!plantId || !this._hoveredCell) return;
    const { row, col } = this._hoveredCell;
    const config = PLANTS[plantId];
    const rect = this.grid.getCellRect(row, col);
    const cellState = this.grid.getState(row, col);
    const canPlace = plantId === 'lilypad'
      ? cellState === 'water'
      : cellState === 'empty';

    this.renderer.drawRect(rect.x, rect.y, rect.w, rect.h,
      canPlace ? 'rgba(100,220,50,0.28)' : 'rgba(220,50,50,0.28)');
    this.renderer.save();
    this.renderer.setAlpha(canPlace ? 0.65 : 0.25);
    this.renderer.drawEmoji(config.emoji, rect.x + rect.w / 2, rect.y + rect.h / 2, 52);
    this.renderer.resetAlpha();
    this.renderer.restore();
  }

  _renderWaveProgress() {
    const progress = this.waveSystem.getProgress();
    const x = 700, y = 5, w = 90, h = 14;
    this.renderer.drawRect(x, y, w, h, 'rgba(0,0,0,0.5)');
    this.renderer.drawRect(x, y, w * progress, h, '#FFD700');
    const wave = Math.max(1, Math.min(this.waveSystem.currentWave + 1, this.waveSystem.totalWaves));
    this.renderer.drawText(
      `波次 ${wave}/${this.waveSystem.totalWaves}`,
      x + w / 2, y + h / 2,
      { size: 10, color: '#fff', align: 'center', baseline: 'middle' }
    );
  }
}
