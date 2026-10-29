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

// Strategic build nodes (bệ đá chiến thuật) positioned at prime defense spots
export const TACTICAL_BUILD_NODES: Point[] = [
  { x: 125, y: 80 },   // Node 1: Entrance overwatch
  { x: 175, y: 240 },  // Node 2: First inner hairpin
  { x: 385, y: 320 },  // Node 3: Central loop core
  { x: 385, y: 560 },  // Node 4: South bend anchor
  { x: 640, y: 95 },   // Node 5: North bend sniper
  { x: 640, y: 320 },  // Node 6: East loop core
  { x: 870, y: 340 },  // Node 7: Castle defense approach
  { x: 870, y: 550 },  // Node 8: Castle gate defense
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
    description: 'Tốc bắn cực nhanh, sát thương vật lý đơn mục tiêu hiệu quả cao nhất.',
    baseCost: 65,
    baseRange: 145,
    baseDamage: 18,
    baseAttackSpeed: 2.4, // 43.2 DPS (0.66 DPS/Vàng)
    splashRadius: 0,
    color: '#38bdf8', // Sky blue
    accentColor: '#0284c7',
    projectileSpeed: 520,
    projectileType: 'arrow',
    upgrades: {
      2: {
        cost: 50,
        damage: 32,
        range: 165,
        attackSpeed: 2.8, // 89.6 DPS
        specialDesc: '+ Cung composite gỗ sồi tăng tốc và sát thương',
      },
      3: {
        cost: 85,
        damage: 54,
        range: 190,
        attackSpeed: 3.4, // 183.6 DPS
        specialDesc: '+ Tên phong linh xé gió, sát thương chí mạng đơn mục tiêu',
      },
    },
  },
  cannon: {
    type: 'cannon',
    name: 'Pháo Thần Công',
    description: 'Uy lực khủng khiếp, nổ lan diện rộng khắc chế toàn bộ bầy quái đông.',
    baseCost: 120,
    baseRange: 130,
    baseDamage: 65,
    baseAttackSpeed: 0.8, // 52.0 DPS đơn + x2-x5 khi quái tụ đàn
    splashRadius: 75,
    color: '#f97316', // Orange
    accentColor: '#c2410c',
    projectileSpeed: 340,
    projectileType: 'cannonball',
    upgrades: {
      2: {
        cost: 90,
        damage: 115,
        range: 145,
        attackSpeed: 0.9, // 103.5 DPS
        splashRadius: 90,
        specialDesc: '+ Nòng thép cường lực tăng uy lực và bán kính nổ',
      },
      3: {
        cost: 140,
        damage: 190,
        range: 165,
        attackSpeed: 1.05, // 199.5 DPS
        splashRadius: 115,
        specialDesc: '+ Pháo hỏa ngục kép tàn phá toàn bộ bầy quái',
      },
    },
  },
  magic: {
    type: 'magic',
    name: 'Tháp Pháp Thuật',
    description: 'Sát thương phép xuyên giáp, làm chậm tốc độ kẻ địch quan trọng.',
    baseCost: 110,
    baseRange: 180,
    baseDamage: 26,
    baseAttackSpeed: 1.2, // 31.2 DPS + khống chế làm chậm
    splashRadius: 0,
    color: '#a855f7', // Purple
    accentColor: '#7e22ce',
    projectileSpeed: 420,
    projectileType: 'magic',
    upgrades: {
      2: {
        cost: 75,
        damage: 45,
        range: 205,
        attackSpeed: 1.4, // 63.0 DPS
        specialDesc: '+ Tinh thể Arcanite làm chậm 45% tốc độ trong 2.6s',
      },
      3: {
        cost: 120,
        damage: 75,
        range: 230,
        attackSpeed: 1.7, // 127.5 DPS
        specialDesc: '+ Bão sấm sét ma thuật làm chậm 55% tốc độ trong 3.0s',
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
    description: 'Di chuyển nhanh, máu thấp, thường tràn vào theo đàn đông.',
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
    description: 'Giáp sắt dày, thể hình hộ pháp, chịu đòn cực kỳ bền bỉ.',
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
    description: 'Di chuyển siêu tốc (150 px/s), cần tháp phép làm chậm để chặn.',
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
    description: 'Boss trùm khổng lồ, máu áp đảo, trừ 3 máu nếu lọt vào căn cứ!',
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
