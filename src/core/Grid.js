export class Grid {
  static CELL_W = 80;
  static CELL_H = 100;
  static OFFSET_X = 120;
  static OFFSET_Y = 80;

  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    // state: 'empty' | 'plant' | 'water'
    this._states = Array.from({ length: rows }, () => Array(cols).fill('empty'));
  }

  getCellRect(row, col) {
    return {
      x: Grid.OFFSET_X + col * Grid.CELL_W,
      y: Grid.OFFSET_Y + row * Grid.CELL_H,
      w: Grid.CELL_W,
      h: Grid.CELL_H,
    };
  }

  getCellFromPoint(px, py) {
    const col = Math.floor((px - Grid.OFFSET_X) / Grid.CELL_W);
    const row = Math.floor((py - Grid.OFFSET_Y) / Grid.CELL_H);
    if (this.isValidCell(row, col)) {
      return { row, col };
    }
    return null;
  }

  isValidCell(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getState(row, col) {
    if (!this.isValidCell(row, col)) return null;
    return this._states[row][col];
  }

  setState(row, col, state) {
    if (!this.isValidCell(row, col)) return;
    this._states[row][col] = state;
  }

  setWaterRows(rows) {
    for (const row of rows) {
      for (let col = 0; col < this.cols; col++) {
        if (this._states[row][col] === 'empty') {
          this._states[row][col] = 'water';
        }
      }
    }
  }
}
