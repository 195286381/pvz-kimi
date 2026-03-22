export class Scene {
  constructor(grid) {
    this.grid = grid;
  }

  update(dt) {}

  render(renderer) {}

  getCellType(row, col) {
    const state = this.grid.getState(row, col);
    if (state === 'water') return 'water';
    return 'land';
  }
}
