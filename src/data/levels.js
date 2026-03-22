// 50关完整配置
// scene: 'day'|'night'|'pool'|'fog'|'roof'
// 每关最后一波为旗手波（isFlagWave:true），旗手僵尸加入阵列
export const LEVELS = [
  // ══════════════════════════════════════════════════════
  // 关卡 1-10：白天草坪
  // 关卡 1-3：2波，仅 basic + flag
  // 关卡 4-5：2波，引入 cone
  // 关卡 6-10：4波，引入 bucket、newspaper
  // ══════════════════════════════════════════════════════
  {
    id: 1,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'basic', 'basic'], isFlagWave: false },
      { zombies: ['basic', 'flag', 'basic', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 2,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'basic', 'basic', 'basic'], isFlagWave: false },
      { zombies: ['basic', 'flag', 'basic', 'basic', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 3,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'basic', 'basic', 'basic', 'basic'], isFlagWave: false },
      { zombies: ['basic', 'flag', 'basic', 'basic', 'basic', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 4,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'cone', 'basic', 'basic'], isFlagWave: false },
      { zombies: ['cone', 'flag', 'basic', 'cone', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 5,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'cone', 'basic', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['cone', 'flag', 'cone', 'basic', 'basic', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 6,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['cone', 'basic', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['basic', 'cone', 'cone', 'basic', 'basic'], isFlagWave: false },
      { zombies: ['cone', 'flag', 'basic', 'cone', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 7,
    scene: 'day',
    waves: [
      { zombies: ['basic', 'cone', 'basic', 'cone'], isFlagWave: false },
      { zombies: ['newspaper', 'basic', 'cone'], isFlagWave: false },
      { zombies: ['cone', 'bucket', 'basic'], isFlagWave: false },
      { zombies: ['bucket', 'flag', 'cone', 'newspaper', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 8,
    scene: 'day',
    waves: [
      { zombies: ['cone', 'basic', 'newspaper'], isFlagWave: false },
      { zombies: ['bucket', 'basic', 'cone'], isFlagWave: false },
      { zombies: ['newspaper', 'cone', 'basic', 'bucket'], isFlagWave: false },
      { zombies: ['bucket', 'flag', 'newspaper', 'cone', 'basic', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 9,
    scene: 'day',
    waves: [
      { zombies: ['newspaper', 'cone', 'basic', 'cone'], isFlagWave: false },
      { zombies: ['bucket', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['cone', 'basic', 'bucket', 'newspaper'], isFlagWave: false },
      { zombies: ['bucket', 'flag', 'bucket', 'cone', 'newspaper', 'basic'], isFlagWave: true },
    ],
  },
  {
    id: 10,
    scene: 'day',
    waves: [
      { zombies: ['cone', 'bucket', 'newspaper'], isFlagWave: false },
      { zombies: ['bucket', 'newspaper', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'bucket', 'cone', 'bucket'], isFlagWave: false },
      { zombies: ['bucket', 'flag', 'bucket', 'newspaper', 'cone', 'bucket', 'cone'], isFlagWave: true },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 关卡 11-20：夜晚草坪
  // 无天空阳光，需靠向日葵/阳光菇
  // 小喷菇和毁灭菇在夜晚免费
  // 引入 newspaper、football
  // ══════════════════════════════════════════════════════
  {
    id: 11,
    scene: 'night',
    waves: [
      { zombies: ['basic', 'newspaper', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'basic', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'basic', 'newspaper'], isFlagWave: false },
      { zombies: ['newspaper', 'flag', 'football', 'basic', 'newspaper'], isFlagWave: true },
    ],
  },
  {
    id: 12,
    scene: 'night',
    waves: [
      { zombies: ['cone', 'newspaper', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['football', 'flag', 'newspaper', 'cone', 'football'], isFlagWave: true },
    ],
  },
  {
    id: 13,
    scene: 'night',
    waves: [
      { zombies: ['newspaper', 'cone', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'newspaper', 'basic'], isFlagWave: false },
      { zombies: ['bucket', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'bucket', 'newspaper', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 14,
    scene: 'night',
    waves: [
      { zombies: ['newspaper', 'bucket', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['football', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['bucket', 'football', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'bucket', 'newspaper'], isFlagWave: true },
    ],
  },
  {
    id: 15,
    scene: 'night',
    waves: [
      { zombies: ['basic', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['football', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'bucket', 'cone', 'newspaper'], isFlagWave: true },
    ],
  },
  {
    id: 16,
    scene: 'night',
    waves: [
      { zombies: ['cone', 'newspaper', 'basic', 'cone'], isFlagWave: false },
      { zombies: ['football', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['bucket', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'newspaper', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'bucket', 'newspaper', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 17,
    scene: 'night',
    waves: [
      { zombies: ['newspaper', 'cone', 'bucket', 'basic'], isFlagWave: false },
      { zombies: ['football', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['bucket', 'football', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'football', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'bucket', 'newspaper', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 18,
    scene: 'night',
    waves: [
      { zombies: ['newspaper', 'cone', 'football'], isFlagWave: false },
      { zombies: ['bucket', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['newspaper', 'football', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'football', 'bucket', 'newspaper'], isFlagWave: true },
    ],
  },
  {
    id: 19,
    scene: 'night',
    waves: [
      { zombies: ['cone', 'newspaper', 'football'], isFlagWave: false },
      { zombies: ['bucket', 'cone', 'football'], isFlagWave: false },
      { zombies: ['football', 'newspaper', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'bucket', 'football', 'newspaper', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 20,
    scene: 'night',
    waves: [
      { zombies: ['newspaper', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'newspaper', 'cone', 'football'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'football', 'bucket', 'football', 'bucket'], isFlagWave: true },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 关卡 21-30：泳池
  // 6行格子，row 2/3 为水路（需先种睡莲）
  // 引入 dolphin（海豚骑手）、snorkel（潜水僵尸）
  // ══════════════════════════════════════════════════════
  {
    id: 21,
    scene: 'pool',
    waves: [
      { zombies: ['basic', 'dolphin', 'basic'], isFlagWave: false },
      { zombies: ['snorkel', 'basic', 'dolphin'], isFlagWave: false },
      { zombies: ['dolphin', 'snorkel', 'basic'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'snorkel', 'basic', 'dolphin'], isFlagWave: true },
    ],
  },
  {
    id: 22,
    scene: 'pool',
    waves: [
      { zombies: ['cone', 'dolphin', 'basic'], isFlagWave: false },
      { zombies: ['snorkel', 'cone', 'dolphin'], isFlagWave: false },
      { zombies: ['dolphin', 'snorkel', 'cone'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'snorkel', 'cone', 'dolphin'], isFlagWave: true },
    ],
  },
  {
    id: 23,
    scene: 'pool',
    waves: [
      { zombies: ['dolphin', 'cone', 'snorkel'], isFlagWave: false },
      { zombies: ['snorkel', 'dolphin', 'cone'], isFlagWave: false },
      { zombies: ['newspaper', 'dolphin', 'snorkel'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'snorkel', 'newspaper', 'dolphin'], isFlagWave: true },
    ],
  },
  {
    id: 24,
    scene: 'pool',
    waves: [
      { zombies: ['snorkel', 'cone', 'dolphin', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'dolphin', 'snorkel'], isFlagWave: false },
      { zombies: ['dolphin', 'snorkel', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'snorkel', 'dolphin', 'newspaper', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 25,
    scene: 'pool',
    waves: [
      { zombies: ['dolphin', 'snorkel', 'cone'], isFlagWave: false },
      { zombies: ['bucket', 'dolphin', 'snorkel'], isFlagWave: false },
      { zombies: ['snorkel', 'bucket', 'dolphin'], isFlagWave: false },
      { zombies: ['dolphin', 'snorkel', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'snorkel', 'bucket', 'dolphin', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 26,
    scene: 'pool',
    waves: [
      { zombies: ['snorkel', 'cone', 'dolphin', 'newspaper'], isFlagWave: false },
      { zombies: ['bucket', 'snorkel', 'dolphin'], isFlagWave: false },
      { zombies: ['dolphin', 'bucket', 'snorkel'], isFlagWave: false },
      { zombies: ['snorkel', 'dolphin', 'bucket', 'newspaper'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'dolphin', 'snorkel', 'bucket', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 27,
    scene: 'pool',
    waves: [
      { zombies: ['dolphin', 'snorkel', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'dolphin', 'snorkel'], isFlagWave: false },
      { zombies: ['snorkel', 'football', 'dolphin'], isFlagWave: false },
      { zombies: ['dolphin', 'football', 'snorkel', 'bucket'], isFlagWave: false },
      { zombies: ['dolphin', 'flag', 'football', 'snorkel', 'dolphin', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 28,
    scene: 'pool',
    waves: [
      { zombies: ['snorkel', 'football', 'dolphin'], isFlagWave: false },
      { zombies: ['football', 'snorkel', 'bucket'], isFlagWave: false },
      { zombies: ['dolphin', 'football', 'snorkel'], isFlagWave: false },
      { zombies: ['football', 'dolphin', 'bucket', 'snorkel'], isFlagWave: false },
      { zombies: ['football', 'flag', 'dolphin', 'snorkel', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 29,
    scene: 'pool',
    waves: [
      { zombies: ['dolphin', 'football', 'snorkel', 'cone'], isFlagWave: false },
      { zombies: ['football', 'snorkel', 'dolphin'], isFlagWave: false },
      { zombies: ['snorkel', 'football', 'bucket', 'dolphin'], isFlagWave: false },
      { zombies: ['football', 'dolphin', 'football', 'snorkel'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'snorkel', 'dolphin', 'football'], isFlagWave: true },
    ],
  },
  {
    id: 30,
    scene: 'pool',
    waves: [
      { zombies: ['dolphin', 'snorkel', 'football'], isFlagWave: false },
      { zombies: ['football', 'dolphin', 'bucket'], isFlagWave: false },
      { zombies: ['snorkel', 'football', 'dolphin', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'football', 'snorkel', 'dolphin'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'dolphin', 'snorkel', 'football', 'bucket'], isFlagWave: true },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 关卡 31-40：浓雾
  // 右侧5列视野遮罩
  // 引入 jack（小丑僵尸）
  // ══════════════════════════════════════════════════════
  {
    id: 31,
    scene: 'fog',
    waves: [
      { zombies: ['basic', 'jack', 'basic'], isFlagWave: false },
      { zombies: ['cone', 'jack', 'basic'], isFlagWave: false },
      { zombies: ['jack', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'flag', 'jack', 'cone', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 32,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['newspaper', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'newspaper'], isFlagWave: false },
      { zombies: ['cone', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'flag', 'jack', 'bucket', 'cone', 'newspaper'], isFlagWave: true },
    ],
  },
  {
    id: 33,
    scene: 'fog',
    waves: [
      { zombies: ['cone', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['newspaper', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'newspaper', 'cone', 'jack'], isFlagWave: false },
      { zombies: ['jack', 'flag', 'jack', 'bucket', 'jack', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 34,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'newspaper', 'cone', 'basic'], isFlagWave: false },
      { zombies: ['football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'newspaper', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'bucket', 'jack'], isFlagWave: true },
    ],
  },
  {
    id: 35,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['newspaper', 'jack', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'jack', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 36,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'cone', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'bucket', 'jack', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 37,
    scene: 'fog',
    waves: [
      { zombies: ['newspaper', 'jack', 'football'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 38,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'cone', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 39,
    scene: 'fog',
    waves: [
      { zombies: ['football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket', 'jack'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'jack', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 40,
    scene: 'fog',
    waves: [
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'jack'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },

  // ══════════════════════════════════════════════════════
  // 关卡 41-50：屋顶
  // 斜面，普通植物需花盆才能种植
  // 引入 football + jack 混合
  // 末关（50关）混入所有类型
  // ══════════════════════════════════════════════════════
  {
    id: 41,
    scene: 'roof',
    waves: [
      { zombies: ['basic', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'cone', 'jack'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 42,
    scene: 'roof',
    waves: [
      { zombies: ['cone', 'football', 'jack'], isFlagWave: false },
      { zombies: ['jack', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'bucket', 'cone'], isFlagWave: true },
    ],
  },
  {
    id: 43,
    scene: 'roof',
    waves: [
      { zombies: ['football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'bucket', 'jack'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 44,
    scene: 'roof',
    waves: [
      { zombies: ['football', 'bucket', 'jack'], isFlagWave: false },
      { zombies: ['jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 45,
    scene: 'roof',
    waves: [
      { zombies: ['jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'jack'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'bucket', 'jack'], isFlagWave: true },
    ],
  },
  {
    id: 46,
    scene: 'roof',
    waves: [
      { zombies: ['football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['jack', 'football', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket', 'jack'], isFlagWave: false },
      { zombies: ['football', 'football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'jack', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 47,
    scene: 'roof',
    waves: [
      { zombies: ['jack', 'football', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'flag', 'jack', 'football', 'football', 'jack', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 48,
    scene: 'roof',
    waves: [
      { zombies: ['football', 'jack', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football'], isFlagWave: false },
      { zombies: ['football', 'jack', 'bucket', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['football', 'football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'jack', 'football', 'bucket'], isFlagWave: true },
    ],
  },
  {
    id: 49,
    scene: 'roof',
    waves: [
      { zombies: ['jack', 'football', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'cone'], isFlagWave: false },
      { zombies: ['jack', 'football', 'jack', 'bucket'], isFlagWave: false },
      { zombies: ['football', 'football', 'jack', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'football', 'football', 'bucket', 'jack'], isFlagWave: false },
      { zombies: ['football', 'flag', 'football', 'jack', 'football', 'football', 'bucket', 'jack'], isFlagWave: true },
    ],
  },
  {
    id: 50,
    scene: 'roof',
    // 终关：混入所有类型僵尸（ladder 作为全场景僵尸出现）
    waves: [
      { zombies: ['basic', 'cone', 'bucket', 'football'], isFlagWave: false },
      { zombies: ['newspaper', 'jack', 'football', 'cone', 'ladder'], isFlagWave: false },
      { zombies: ['bucket', 'football', 'jack', 'cone', 'newspaper'], isFlagWave: false },
      { zombies: ['jack', 'football', 'bucket', 'ladder', 'football', 'jack'], isFlagWave: false },
      { zombies: ['football', 'jack', 'football', 'bucket', 'jack', 'cone', 'newspaper'], isFlagWave: false },
      {
        zombies: ['football', 'flag', 'football', 'jack', 'football', 'jack', 'football', 'bucket', 'newspaper', 'cone', 'ladder'],
        isFlagWave: true,
      },
    ],
  },
];
