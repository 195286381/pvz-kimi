// 僵尸静态数据配置（10种）
// speed 单位：格/秒（慢=0.3, 中=0.5, 快=0.7, 极快=1.0）
export const ZOMBIES = {
  basic: {
    id: 'basic',
    name: '普通僵尸',
    emoji: '🧟',
    hp: 270,
    armorHp: 0,
    armorType: null,
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    scenes: 'all',
  },

  flag: {
    id: 'flag',
    name: '旗手僵尸',
    emoji: '🚩',
    hp: 270,
    armorHp: 0,
    armorType: null,
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    flagWave: true,     // 触发大波次标记
    scenes: 'all',
  },

  cone: {
    id: 'cone',
    name: '路锥僵尸',
    emoji: '🪖',
    hp: 270,
    armorHp: 370,
    armorType: 'cone',  // 可被磁力菇吸走
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    scenes: 'all',
  },

  bucket: {
    id: 'bucket',
    name: '铁桶僵尸',
    emoji: '🪣',
    hp: 270,
    armorHp: 1100,
    armorType: 'bucket', // 可被磁力菇吸走
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    scenes: 'all',
  },

  newspaper: {
    id: 'newspaper',
    name: '报纸僵尸',
    emoji: '📰',
    hp: 270,
    armorHp: 170,
    armorType: 'newspaper',
    speed: 0.3,
    speedAfterArmorBreak: 0.8, // 护甲破碎后速度变极快
    damage: 100,
    attackInterval: 1.0,
    scenes: 'all',
  },

  football: {
    id: 'football',
    name: '橄榄球僵尸',
    emoji: '🏈',
    hp: 1580,
    armorHp: 0,
    armorType: null,
    speed: 1.0,         // 极快
    damage: 100,
    attackInterval: 1.0,
    scenes: 'all',
  },

  dolphin: {
    id: 'dolphin',
    name: '海豚骑手',
    emoji: '🐬',
    hp: 270,
    armorHp: 0,
    armorType: null,
    speed: 0.7,         // 快
    damage: 100,
    attackInterval: 1.0,
    // 跳过遇到的第一株植物（不造成伤害），跳过后变为普通速度继续向左
    jumpsFirstPlant: true,
    speedAfterJump: 0.3,
    scenes: ['pool'],
  },

  snorkel: {
    id: 'snorkel',
    name: '潜水僵尸',
    emoji: '🤿',
    hp: 270,
    armorHp: 0,
    armorType: null,
    speed: 0.5,         // 中（潜水阶段无敌）
    surfaceCol: 4,      // 到达col=4时上岸
    speedAfterSurface: 0.3, // 上岸后普通速度
    damage: 100,
    attackInterval: 1.0,
    scenes: ['pool'],
  },

  ladder: {
    id: 'ladder',
    name: '梯子僵尸',
    emoji: '🪜',
    hp: 270,
    armorHp: 200,
    armorType: 'ladder',
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    // 遇到坚果墙时架梯越过（耗时2s），越过后恢复普通速度
    // 梯子留在坚果墙格，后续普通/路锥/铁桶僵尸可直接越过
    // 高坚果免疫（梯子无法架上去）
    placesLadderOnWallnut: true,
    ladderPlaceTime: 2,
    scenes: 'all',
  },

  jack: {
    id: 'jack',
    name: '小丑僵尸',
    emoji: '🎁',
    hp: 270,
    armorHp: 0,
    armorType: null,
    speed: 0.3,
    damage: 100,
    attackInterval: 1.0,
    // 死亡时3×3范围爆炸(1800伤害)，只伤害植物不伤害僵尸（不触发连锁爆炸）
    deathExplosionDamage: 1800,
    deathExplosionRadius: 1,
    explosionHitsPlants: true,
    explosionHitsZombies: false,
    scenes: ['fog', 'roof'],
  },
};

// 僵尸 ID 列表
export const ZOMBIE_IDS = Object.keys(ZOMBIES);
