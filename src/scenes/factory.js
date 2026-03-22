// 场景工厂 — 根据场景类型创建对应 Scene 实例
// Game.js 通过 import { createScene } from './scenes/factory.js' 创建场景

import { DayScene }   from './DayScene.js';
import { NightScene } from './NightScene.js';
import { PoolScene }  from './PoolScene.js';
import { FogScene }   from './FogScene.js';
import { RoofScene }  from './RoofScene.js';
import { Grid }       from '../core/Grid.js';

// 重新导出各场景类（方便按需直接 import）
export { DayScene, NightScene, PoolScene, FogScene, RoofScene };

/**
 * 场景配置：场景类型 → { SceneClass, rows, cols }
 * pool 场景 6行，其余 5行；所有场景 9列
 */
const SCENE_CONFIG = {
  day:   { SceneClass: DayScene,   rows: 5, cols: 9 },
  night: { SceneClass: NightScene, rows: 5, cols: 9 },
  pool:  { SceneClass: PoolScene,  rows: 6, cols: 9 },
  fog:   { SceneClass: FogScene,   rows: 5, cols: 9 },
  roof:  { SceneClass: RoofScene,  rows: 5, cols: 9 },
};

/**
 * 创建场景实例，同时返回对应的 Grid
 *
 * @param {'day'|'night'|'pool'|'fog'|'roof'} sceneType
 * @returns {{ scene: Scene, grid: Grid }}
 *
 * 用法：
 *   const { scene, grid } = createSceneAndGrid('pool');
 *   game.scene = scene;
 *   game.grid  = grid;
 */
export function createSceneAndGrid(sceneType) {
  const config = SCENE_CONFIG[sceneType];
  if (!config) {
    throw new Error(`未知场景类型: "${sceneType}"。有效值: ${Object.keys(SCENE_CONFIG).join(', ')}`);
  }
  const grid = new Grid(config.rows, config.cols);
  const scene = new config.SceneClass(grid);
  return { scene, grid };
}

/**
 * 获取场景行数（pool 场景 6 行，其余 5 行）
 * @param {'day'|'night'|'pool'|'fog'|'roof'} sceneType
 * @returns {number}
 */
export function getRowCount(sceneType) {
  return sceneType === 'pool' ? 6 : 5;
}

/**
 * 获取场景的行列数（不创建实例，仅查询）
 * @param {'day'|'night'|'pool'|'fog'|'roof'} sceneType
 * @returns {{ rows: number, cols: number }}
 */
export function getSceneDimensions(sceneType) {
  const config = SCENE_CONFIG[sceneType];
  if (!config) throw new Error(`未知场景类型: "${sceneType}"`);
  return { rows: config.rows, cols: config.cols };
}
