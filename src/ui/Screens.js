import { bus } from '../core/EventBus.js';

// 界面状态枚举
export const SCREEN = {
  MAIN_MENU:    'main_menu',
  LEVEL_SELECT: 'level_select',
  PLAYING:      'playing',
  PAUSED:       'paused',
  WIN:          'win',
  LOSE:         'lose',
};

export class Screens {
  constructor(renderer, onStartGame) {
    this.renderer = renderer;
    this.onStartGame = onStartGame;  // 回调：(levelId) => void
    this.state = SCREEN.MAIN_MENU;
    this._selectedScene = 0;   // 0-4: 白天/夜晚/泳池/浓雾/屋顶
    this._buttons = [];        // 当前界面按钮 [{x,y,w,h,label,action}]
    this._animTimer = 0;       // 动画计时器
  }

  setState(state) {
    this.state = state;
    this._animTimer = 0;
  }

  update(dt) {
    this._animTimer += dt;
  }

  render() {
    switch (this.state) {
      case SCREEN.MAIN_MENU:    this._renderMainMenu();    break;
      case SCREEN.LEVEL_SELECT: this._renderLevelSelect(); break;
      case SCREEN.PAUSED:       this._renderPaused();      break;
      case SCREEN.WIN:          this._renderWin();         break;
      case SCREEN.LOSE:         this._renderLose();        break;
    }
  }

  handleClick(mx, my) {
    for (const btn of this._buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        btn.action();
        return true;
      }
    }
    return false;
  }

  // ---- 主菜单 ----
  _renderMainMenu() {
    const r = this.renderer;
    this._buttons = [];

    // 背景（绿色渐变）
    r.drawRect(0, 0, 800, 600, '#2D7A2D');

    // 标题
    r.drawText('🌿 植物大战僵尸 🧟', 400, 180, {
      size: 42, color: '#FFD700', align: 'center', baseline: 'middle',
    });
    r.drawText('Plant vs Zombies', 400, 230, {
      size: 18, color: '#90EE90', align: 'center', baseline: 'middle',
    });

    // 开始游戏按钮（直接进第1关）
    this._addButton(275, 300, 250, 55, '🎮 开始游戏', '#228B22', '#FFD700', () => {
      this.onStartGame(1);
    });

    // 关卡选择按钮
    this._addButton(275, 370, 250, 55, '📋 关卡选择', '#1a5c1a', '#90EE90', () => {
      this.setState(SCREEN.LEVEL_SELECT);
    });

    // 装饰植物
    r.drawEmoji('🌻', 100, 400, 60);
    r.drawEmoji('🫛', 680, 350, 55);
    r.drawEmoji('🥜', 120, 500, 50);
  }

  // ---- 关卡选择 ----
  _renderLevelSelect() {
    const r = this.renderer;
    this._buttons = [];

    r.drawRect(0, 0, 800, 600, '#1a3d1a');
    r.drawText('选择关卡', 400, 45, {
      size: 28, color: '#FFD700', align: 'center', baseline: 'middle',
    });

    const scenes = [
      { name: '🌞 白天草坪', color: '#4CAF50', levels: [1,  10] },
      { name: '🌙 夜晚草坪', color: '#303F9F', levels: [11, 20] },
      { name: '🏊 泳池',     color: '#0288D1', levels: [21, 30] },
      { name: '🌫️ 浓雾',    color: '#607D8B', levels: [31, 40] },
      { name: '🏠 屋顶',    color: '#795548', levels: [41, 50] },
    ];

    scenes.forEach((scene, si) => {
      const sy = 80 + si * 95;
      r.drawRoundRect(20, sy, 760, 85, 8, scene.color + '88');
      r.drawText(scene.name, 30, sy + 28, {
        size: 16, color: '#fff', baseline: 'top',
      });

      // 10个关卡按钮
      for (let i = 0; i < 10; i++) {
        const levelId = scene.levels[0] + i;
        const bx = 30 + i * 72, by = sy + 45, bw = 65, bh = 28;
        this._addButton(bx, by, bw, bh, `第${levelId}关`, scene.color, '#fff', () => {
          this.onStartGame(levelId);
        });
      }
    });

    // 返回按钮
    this._addButton(20, 555, 100, 35, '← 返回', '#555', '#fff', () => {
      this.setState(SCREEN.MAIN_MENU);
    });
  }

  // ---- 暂停菜单 ----
  _renderPaused() {
    const r = this.renderer;
    this._buttons = [];

    // 半透明遮罩
    r.setAlpha(0.6);
    r.drawRect(0, 0, 800, 600, '#000');
    r.resetAlpha();

    r.drawRoundRect(250, 180, 300, 240, 12, '#2D4A2D');
    r.drawText('⏸ 暂停', 400, 215, {
      size: 26, color: '#FFD700', align: 'center', baseline: 'middle',
    });

    this._addButton(275, 255, 250, 45, '▶ 继续', '#4CAF50', '#fff', () => {
      bus.emit('game:resume');
      this.setState(SCREEN.PLAYING);
    });
    this._addButton(275, 315, 250, 45, '🔄 重试', '#FF9800', '#fff', () => {
      bus.emit('game:restart');
    });
    this._addButton(275, 375, 250, 45, '🏠 主菜单', '#f44336', '#fff', () => {
      bus.emit('game:quit');
      this.setState(SCREEN.MAIN_MENU);
    });
  }

  // ---- 胜利界面 ----
  _renderWin() {
    const r = this.renderer;
    this._buttons = [];

    r.setAlpha(0.7);
    r.drawRect(0, 0, 800, 600, '#0a2a0a');
    r.resetAlpha();

    // 胜利文字（跳动动画）
    const bounce = Math.sin(this._animTimer * 3) * 8;
    r.drawText('🎉 胜利！', 400, 200 + bounce, {
      size: 52, color: '#FFD700', align: 'center', baseline: 'middle',
    });
    r.drawText('所有僵尸已消灭！', 400, 270, {
      size: 20, color: '#90EE90', align: 'center', baseline: 'middle',
    });

    // 庆祝 Emoji 散落
    const emojis = ['🌻', '🫛', '🥜', '🍒', '🎊', '⭐', '✨'];
    emojis.forEach((e, i) => {
      const x = 100 + ((this._animTimer * 60 + i * 100) % 650);
      const y = 320 + Math.sin(this._animTimer * 2 + i) * 40;
      r.drawEmoji(e, x, y, 30);
    });

    this._addButton(200, 460, 180, 50, '下一关 →', '#4CAF50', '#fff', () => {
      bus.emit('game:nextLevel');
    });
    this._addButton(420, 460, 180, 50, '🏠 主菜单', '#607D8B', '#fff', () => {
      bus.emit('game:quit');
      this.setState(SCREEN.MAIN_MENU);
    });
  }

  // ---- 失败界面 ----
  _renderLose() {
    const r = this.renderer;
    this._buttons = [];

    r.setAlpha(0.75);
    r.drawRect(0, 0, 800, 600, '#1a0000');
    r.resetAlpha();

    // 晃动动画（入场1s内抖动，之后稳定）
    const shake = Math.sin(this._animTimer * 8) * (Math.max(0, 1 - this._animTimer) * 5);
    r.drawText('💀 游戏结束', 400 + shake, 200, {
      size: 46, color: '#FF4444', align: 'center', baseline: 'middle',
    });
    r.drawText('僵尸到达了你的家！', 400, 265, {
      size: 20, color: '#FF9999', align: 'center', baseline: 'middle',
    });

    r.drawEmoji('🧟', 160, 340, 70);
    r.drawEmoji('🧟', 600, 330, 65);
    r.drawEmoji('💀', 380, 320, 55);

    this._addButton(200, 440, 180, 50, '🔄 重试', '#FF5722', '#fff', () => {
      bus.emit('game:restart');
    });
    this._addButton(420, 440, 180, 50, '🏠 主菜单', '#607D8B', '#fff', () => {
      bus.emit('game:quit');
      this.setState(SCREEN.MAIN_MENU);
    });
  }

  // ---- 辅助：绘制按钮并登记点击区域 ----
  _addButton(x, y, w, h, label, bgColor, textColor, action) {
    // 先登记（render 时按钮已绘制）
    this._buttons.push({ x, y, w, h, action });
    this.renderer.drawRoundRect(x, y, w, h, 6, bgColor);
    this.renderer.drawText(label, x + w / 2, y + h / 2, {
      size: 14, color: textColor, align: 'center', baseline: 'middle',
    });
  }
}
