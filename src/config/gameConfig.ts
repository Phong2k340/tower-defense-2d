import { EnemyConfig, Point, TowerConfig, WaveConfig } from '../types/game';

export const MAP_CONFIG = {
  width: 1000,
  height: 650,
  gridCols: 20,
  gridRows: 13,
  cellSize: 50,
  pathWidth: 46,
  minTowerDistance: 44, // Minimum distance between tower centers
  pathDistanceMargin: 36, // Minimum distance from tower center to path line
};

// Strategic winding path across 1000x650 map
export const PATH_WAYPOINTS: Point[] = [
  { x: -20, y: 150 },  // 0: Spawn off-screen left
  { x: 250, y: 150 },  // 1: East
  { x: 250, y: 480 },  // 2: South
  { x: 520, y: 480 },  // 3: East
  { x: 520, y: 180 },  // 4: North
  { x: 760, y: 180 },  // 5: East
  { x: 760, y: 460 },  // 6: South
  { x: 1020, y: 460 }, // 7: Base exit off-screen right
];

export const INITIAL_GAME_STATE = {
  baseHp: 20,
  maxBaseHp: 20,
  startingGold: 150,
  sellRefundRate: 0.7,
  totalWaves: 10,
};

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  archer: {
    type: 'archer',
    name: 'Tháp Cung Thủ',
    description: 'Tốc độ bắn cực nhanh, sát thương đơn mục tiêu ổn định.',
    baseCost: 70,
    baseRange: 145,
    baseDamage: 16,
    baseAttackSpeed: 2.2,
    splashRadius: 0,
    color: '#38bdf8', // Sky blue
    accentColor: '#0284c7',
    projectileSpeed: 480,
    projectileType: 'arrow',
    upgrades: {
      2: {
        cost: 55,
        damage: 28,
        range: 165,
        attackSpeed: 2.6,
        specialDesc: '+ Cung tên composite tăng sát thương và tầm bắn',
      },
      3: {
        cost: 95,
        damage: 48,
        range: 190,
        attackSpeed: 3.2,
        specialDesc: '+ Mũi tên phong linh xé gió, tốc bắn tối đa',
      },
    },
  },
  cannon: {
    type: 'cannon',
    name: 'Pháo Thần Công',
    description: 'Bắn chậm nhưng uy lực khủng khiếp, nổ lan diện rộng.',
    baseCost: 125,
    baseRange: 125,
    baseDamage: 55,
    baseAttackSpeed: 0.75,
    splashRadius: 75,
    color: '#f97316', // Orange
    accentColor: '#c2410c',
    projectileSpeed: 320,
    projectileType: 'cannonball',
    upgrades: {
      2: {
        cost: 95,
        damage: 95,
        range: 140,
        attackSpeed: 0.85,
        splashRadius: 90,
        specialDesc: '+ Nòng thép cường lực tăng uy lực và bán kính nổ',
      },
      3: {
        cost: 150,
        damage: 160,
        range: 160,
        attackSpeed: 1.0,
        splashRadius: 110,
        specialDesc: '+ Pháo hỏa ngục kép tàn phá toàn bộ bầy quái',
      },
    },
  },
  magic: {
    type: 'magic',
    name: 'Tháp Pháp Thuật',
    description: 'Sát thương phép xuyên giáp, làm chậm tốc độ kẻ địch.',
    baseCost: 100,
    baseRange: 175,
    baseDamage: 32,
    baseAttackSpeed: 1.3,
    splashRadius: 0,
    color: '#a855f7', // Purple
    accentColor: '#7e22ce',
    projectileSpeed: 400,
    projectileType: 'magic',
    upgrades: {
      2: {
        cost: 75,
        damage: 54,
        range: 195,
        attackSpeed: 1.5,
        specialDesc: '+ Tinh thể Arcanite tăng sát thương phép và làm chậm 45%',
      },
      3: {
        cost: 125,
        damage: 92,
        range: 220,
        attackSpeed: 1.85,
        specialDesc: '+ Bão sấm sét ma thuật làm chậm 55% kẻ địch',
      },
    },
  },
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  goblin: {
    type: 'goblin',
    name: 'Goblin Trinh Sát',
    hp: 55,
    speed: 95,
    goldReward: 12,
    livesDeducted: 1,
    radius: 13,
    color: '#22c55e', // Emerald green
    accentColor: '#15803d',
    description: 'Di chuyển nhanh nhẹn, máu ít nhưng hay đi theo đàn.',
  },
  orc: {
    type: 'orc',
    name: 'Orc Chiến Binh',
    hp: 240,
    speed: 52,
    goldReward: 25,
    livesDeducted: 1,
    radius: 19,
    color: '#ef4444', // Red-crimson
    accentColor: '#991b1b',
    description: 'Thể hình đồ sộ, giáp dày chịu đòn cực tốt.',
  },
  runner: {
    type: 'runner',
    name: 'Kẻ Đột Kích',
    hp: 75,
    speed: 150,
    goldReward: 18,
    livesDeducted: 1,
    radius: 12,
    color: '#eab308', // Amber gold
    accentColor: '#a16207',
    description: 'Cực nhanh và né tránh tốt, cần tháp làm chậm để cản.',
  },
  boss: {
    type: 'boss',
    name: 'Chúa Quỷ Titan',
    hp: 1100,
    speed: 36,
    goldReward: 150,
    livesDeducted: 3,
    radius: 26,
    color: '#ec4899', // Hot Pink / Magma
    accentColor: '#831843',
    description: 'Boss trùm khổng lồ, lượng máu áp đảo, trừ 3 máu nếu lọt qua!',
  },
};

export const WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Trinh Sát Tiền Tuyến',
    bonusReward: 25,
    groups: [
      { enemyType: 'goblin', count: 8, interval: 1.3, delay: 0.5, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Goblin Tăng Cường',
    bonusReward: 30,
    groups: [
      { enemyType: 'goblin', count: 12, interval: 1.0, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'orc', count: 2, interval: 2.5, delay: 5.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Băng Cướp Tốc Độ',
    bonusReward: 35,
    groups: [
      { enemyType: 'runner', count: 6, interval: 1.2, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'goblin', count: 8, interval: 0.9, delay: 4.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Quân Đoàn Giáp Nặng',
    bonusReward: 40,
    groups: [
      { enemyType: 'orc', count: 6, interval: 2.0, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'goblin', count: 10, interval: 1.0, delay: 3.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Cuộc Tấn Công Chớp Nhoáng',
    bonusReward: 50,
    groups: [
      { enemyType: 'runner', count: 12, interval: 0.9, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'orc', count: 4, interval: 1.8, delay: 6.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Bão Trùng Goblin',
    bonusReward: 60,
    groups: [
      { enemyType: 'goblin', count: 22, interval: 0.65, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'runner', count: 8, interval: 1.0, delay: 5.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bức Tường Sắt Thép',
    bonusReward: 70,
    groups: [
      { enemyType: 'orc', count: 12, interval: 1.6, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'runner', count: 10, interval: 1.1, delay: 7.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Cuồng Phong Phục Kích',
    bonusReward: 80,
    groups: [
      { enemyType: 'runner', count: 18, interval: 0.8, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'orc', count: 8, interval: 1.5, delay: 4.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Đại Quân Tổng Lực',
    bonusReward: 100,
    groups: [
      { enemyType: 'goblin', count: 20, interval: 0.6, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'orc', count: 12, interval: 1.4, delay: 3.0, spawned: 0, timer: 0 },
      { enemyType: 'runner', count: 14, interval: 0.8, delay: 6.0, spawned: 0, timer: 0 },
    ],
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Phán Quyết Của Chúa Quỷ',
    bonusReward: 200,
    groups: [
      { enemyType: 'orc', count: 8, interval: 1.5, delay: 0.5, spawned: 0, timer: 0 },
      { enemyType: 'runner', count: 12, interval: 0.8, delay: 3.0, spawned: 0, timer: 0 },
      { enemyType: 'boss', count: 1, interval: 1.0, delay: 8.0, spawned: 0, timer: 0 },
      { enemyType: 'goblin', count: 15, interval: 0.7, delay: 12.0, spawned: 0, timer: 0 },
    ],
  },
];

