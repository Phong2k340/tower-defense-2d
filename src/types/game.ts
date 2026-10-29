export interface Point {
  x: number;
  y: number;
}

export type TowerType = 'archer' | 'cannon' | 'magic';
export type TowerLevel = 1 | 2 | 3;
export type TargetStrategy = 'first' | 'last' | 'closest' | 'strongest' | 'weakest';

export interface TowerConfig {
  type: TowerType;
  name: string;
  description: string;
  baseCost: number;
  baseRange: number;
  baseDamage: number;
  baseAttackSpeed: number; // shots per second
  splashRadius: number;    // > 0 for AoE
  color: string;
  accentColor: string;
  projectileSpeed: number;
  projectileType: ProjectileType;
  upgrades: {
    [key in 2 | 3]: {
      cost: number;
      damage: number;
      range: number;
      attackSpeed: number;
      splashRadius?: number;
      specialDesc: string;
    };
  };
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  level: TowerLevel;
  damage: number;
  range: number;
  attackSpeed: number;
  cooldownTimer: number; // seconds remaining until next shot
  splashRadius: number;
  totalCost: number;     // for sell calculation
  kills: number;
  damageDealt: number;
  targetStrategy: TargetStrategy;
  rotation: number;      // angle in radians facing target
  lastFireTime: number;  // for recoil/firing animation
}

export type EnemyType = 'goblin' | 'orc' | 'runner' | 'boss';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  hp: number;
  speed: number;       // pixels per second
  goldReward: number;
  livesDeducted: number;
  radius: number;
  color: string;
  accentColor: string;
  description: string;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  maxHp: number;
  currentHp: number;
  baseSpeed: number;
  speed: number;
  goldReward: number;
  livesDeducted: number;
  radius: number;
  color: string;
  accentColor: string;
  waypointIndex: number;
  distanceTraveled: number;
  isDead: boolean;
  isRewardClaimed: boolean;
  reachedBase: boolean;
  slowTimer: number;
  slowFactor: number;
  hitFlashTimer: number; // for visual hit reaction
  walkCycle: number;     // for walking animation
}

export type ProjectileType = 'arrow' | 'cannonball' | 'magic';

export interface Projectile {
  id: string;
  towerId: string;
  type: ProjectileType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetEnemyId?: string;
  speed: number;
  damage: number;
  splashRadius: number;
  slowEffect?: {
    duration: number;
    factor: number;
  };
  hasHit: boolean;
  distanceTotal: number;
  distanceCovered: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'ring' | 'text' | 'blood' | 'magic';
  text?: string;
}

export interface EnemySpawnGroup {
  enemyType: EnemyType;
  count: number;
  interval: number; // seconds between spawns
  delay: number;    // seconds delay before starting this group
  spawned: number;
  timer: number;
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  groups: EnemySpawnGroup[];
  bonusReward: number;
}

export type GameStatus =
  | 'IDLE'
  | 'WAVE_ACTIVE'
  | 'WAVE_COMPLETED'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface GameStats {
  enemiesKilled: number;
  goldEarned: number;
  damageDealt: number;
  towersBuilt: number;
  wavesCleared: number;
}
