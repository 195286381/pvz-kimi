// 植物注册表 — 统一导出所有17种植物类
import { PLANTS } from '../data/plants.js';

import { Sunflower }   from './Sunflower.js';
import { Peashooter }  from './Peashooter.js';
import { WallNut }     from './WallNut.js';
import { CherryBomb }  from './CherryBomb.js';
import { PotatoMine }  from './PotatoMine.js';
import { SnowPea }     from './SnowPea.js';
import { Repeater }    from './Repeater.js';
import { Chomper }     from './Chomper.js';
import { PuffShroom }  from './PuffShroom.js';
import { SunShroom }   from './SunShroom.js';
import { FumeShroom }  from './FumeShroom.js';
import { Lilypad }     from './Lilypad.js';
import { TallNut }     from './TallNut.js';
import { Magneshroom } from './Magneshroom.js';
import { Torchwood }   from './Torchwood.js';
import { DoomShroom }  from './DoomShroom.js';
import { FlowerPot }   from './FlowerPot.js';

export {
  Sunflower, Peashooter, WallNut, CherryBomb, PotatoMine,
  SnowPea, Repeater, Chomper, PuffShroom, SunShroom,
  FumeShroom, Lilypad, TallNut, Magneshroom, Torchwood,
  DoomShroom, FlowerPot,
};

/**
 * 植物注册表：plantId → 植物类
 * 与 data/plants.js 的 PLANTS 键名对应
 *
 * 用法：
 *   const PlantClass = PLANT_REGISTRY[plantId];
 *   const plant = new PlantClass(config, row, col);
 */
export const PLANT_REGISTRY = {
  sunflower:   Sunflower,
  peashooter:  Peashooter,
  wallnut:     WallNut,
  cherrybomb:  CherryBomb,
  potatomine:  PotatoMine,
  snowpea:     SnowPea,
  repeater:    Repeater,
  chomper:     Chomper,
  puffshroom:  PuffShroom,
  sunshroom:   SunShroom,
  fumeshroom:  FumeShroom,
  lilypad:     Lilypad,
  tallnut:     TallNut,
  magneshroom: Magneshroom,
  torchwood:   Torchwood,
  doomshroom:  DoomShroom,
  flowerpot:   FlowerPot,
};

/**
 * 返回指定场景可用的 plantId 列表（根据 data/plants.js 中 scenes 字段过滤）
 *
 * scenes 字段规则：
 *   'all'              → 所有场景可用
 *   ['night']          → 仅夜晚可用
 *   ['pool_water']     → 仅泳池水路可用（lilypad）
 *   ['roof']           → 仅屋顶可用（flowerpot）
 *   ['fog','roof']     → 浓雾或屋顶可用
 *
 * @param {'day'|'night'|'pool'|'fog'|'roof'} sceneType
 * @returns {string[]} 可用的 plantId 数组
 */
export function getAvailablePlants(sceneType) {
  return Object.keys(PLANTS).filter(id => {
    const { scenes } = PLANTS[id];
    if (scenes === 'all') return true;
    if (Array.isArray(scenes)) {
      // 'pool_water' 和 'pool' 同属泳池场景
      return scenes.some(s => {
        if (s === sceneType) return true;
        if (s === 'pool_water' && sceneType === 'pool') return true;
        return false;
      });
    }
    return false;
  });
}
