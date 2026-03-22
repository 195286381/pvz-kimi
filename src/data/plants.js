// 植物静态数据配置（17种）
export const PLANTS = {
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    emoji: '🌻',
    cost: 50,
    cooldown: 7,
    hp: 300,
    sunInterval: 24,
    sunAmount: 25,
    scenes: 'all',
  },

  peashooter: {
    id: 'peashooter',
    name: '豌豆射手',
    emoji: '🫛',
    cost: 100,
    cooldown: 7,
    hp: 300,
    attackInterval: 1.5,
    damage: 20,
    projectileType: 'pea',
    scenes: 'all',
  },

  wallnut: {
    id: 'wallnut',
    name: '坚果墙',
    emoji: '🥜',
    cost: 50,
    cooldown: 30,
    hp: 2400,
    scenes: 'all',
  },

  cherrybomb: {
    id: 'cherrybomb',
    name: '樱桃炸弹',
    emoji: '🍒',
    cost: 150,
    cooldown: 50,
    hp: 300,
    explosionDamage: 1800,
    explosionRadius: 1, // 3×3 (中心格±1)
    fuseTime: 0,        // 立即爆炸
    scenes: 'all',
  },

  potatomine: {
    id: 'potatomine',
    name: '土豆地雷',
    emoji: '🥔',
    cost: 25,
    cooldown: 30,
    hp: 100,            // 武装前HP
    armedHp: 300,       // 武装后（爆炸触发）
    armDelay: 15,       // 武装延迟（秒）
    explosionDamage: 1800,
    oneShot: true,
    scenes: 'all',
  },

  snowpea: {
    id: 'snowpea',
    name: '寒冰射手',
    emoji: '❄️',
    cost: 175,
    cooldown: 7,
    hp: 300,
    attackInterval: 1.5,
    damage: 20,
    projectileType: 'icePea',
    slowPercent: 0.5,   // 减速50%
    slowDuration: 4,    // 持续4秒
    scenes: 'all',
  },

  repeater: {
    id: 'repeater',
    name: '双重射手',
    emoji: '🌿',
    cost: 200,
    cooldown: 7,
    hp: 300,
    attackInterval: 1.5,
    damage: 20,
    projectileCount: 2,
    projectileType: 'pea',
    scenes: 'all',
  },

  chomper: {
    id: 'chomper',
    name: '食人花',
    emoji: '😈',
    cost: 150,
    cooldown: 30,
    hp: 300,
    // 吞噬同格或右邻格(col+1)的普通/旗手僵尸（秒杀），col=8时无右邻格
    // 对护甲/特殊僵尸无效
    swallowTargets: ['basic', 'flag'],
    swallowRange: 1,    // 可攻击到col+1
    scenes: 'all',
  },

  puffshroom: {
    id: 'puffshroom',
    name: '小喷菇',
    emoji: '🍄',
    cost: 75,           // 白天75，夜晚免费（由场景逻辑处理）
    nightCost: 0,
    cooldown: 7,
    hp: 300,
    attackInterval: 1.5,
    damage: 15,
    projectileType: 'spore',
    scenes: ['night'],  // 仅夜晚场景
  },

  sunshroom: {
    id: 'sunshroom',
    name: '阳光菇',
    emoji: '🌙',
    cost: 25,
    cooldown: 7,
    hp: 300,
    // 3阶段成长：0-10s小型25，10-20s中型50，20s+大型75
    sunStages: [
      { duration: 10, sunAmount: 25 },
      { duration: 10, sunAmount: 50 },
      { duration: Infinity, sunAmount: 75 },
    ],
    sunInterval: 24,
    scenes: ['night'],  // 仅夜晚场景
  },

  fumeshroom: {
    id: 'fumeshroom',
    name: '大喷菇',
    emoji: '💨',
    cost: 75,
    cooldown: 7,
    hp: 300,
    attackInterval: 1.5,
    damage: 20,
    projectileType: 'fume',
    piercesAll: true,   // 穿透同行所有僵尸
    scenes: 'all',
  },

  lilypad: {
    id: 'lilypad',
    name: '睡莲',
    emoji: '🪷',
    cost: 25,
    cooldown: 7,
    hp: 300,
    isBase: true,       // 底座植物，可叠放其他植物
    scenes: ['pool_water'],
  },

  tallnut: {
    id: 'tallnut',
    name: '高坚果',
    emoji: '🌰',
    cost: 125,
    cooldown: 30,
    hp: 8000,
    blockLadder: true,  // 可阻止梯子僵尸架梯
    scenes: 'all',
  },

  magneshroom: {
    id: 'magneshroom',
    name: '磁力菇',
    emoji: '🧲',
    cost: 100,
    cooldown: 30,
    hp: 300,
    magnetInterval: 3,  // 每3s吸走同行最近金属护甲
    magnetTargets: ['cone', 'bucket'], // 可吸走的护甲类型
    scenes: 'all',
  },

  torchwood: {
    id: 'torchwood',
    name: '火炬树桩',
    emoji: '🔥',
    cost: 175,
    cooldown: 30,
    hp: 300,
    // 令同行豌豆变火球，伤害×2
    ignitesProjectiles: ['pea'],
    damageMultiplier: 2,
    scenes: 'all',
  },

  doomshroom: {
    id: 'doomshroom',
    name: '毁灭菇',
    emoji: '💣',
    cost: 150,          // 白天150，夜晚免费（由场景逻辑处理）
    nightCost: 0,
    cooldown: 50,
    hp: 300,
    explosionDamage: 9999,
    explosionAll: true, // 全屏清场
    // 白天需额外75阳光激活（白天总费用=150+75=225阳光）
    dayActivationCost: 75,
    scenes: 'all',
  },

  flowerpot: {
    id: 'flowerpot',
    name: '花盆',
    emoji: '🪴',
    cost: 25,
    cooldown: 5,
    hp: 300,
    isBase: true,       // 底座植物，屋顶场景叠放其他植物
    // 花盆被摧毁时上层植物一并移除
    scenes: ['roof'],
  },
};

// 植物 ID 列表（用于卡片栏顺序）
export const PLANT_IDS = Object.keys(PLANTS);
