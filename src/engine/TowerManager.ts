import { INITIAL_GAME_STATE, TOWER_CONFIGS } from '../config/gameConfig';
import { Enemy, TargetStrategy, Tower, TowerLevel, TowerType } from '../types/game';
import { angleBetween, distance, generateId } from '../utils/math';
import { EnemyManager } from './EnemyManager';
import { ProjectileManager } from './ProjectileManager';

export interface TowerFireEvent {
  tower: Tower;
  targetEnemy: Enemy;
}

export class TowerManager {
  public towers: Tower[] = [];
  public selectedTowerId: string | null = null;

  public reset() {
    this.towers = [];
    this.selectedTowerId = null;
  }

  public getTowerById(id: string): Tower | undefined {
    return this.towers.find((t) => t.id === id);
  }

  public getSelectedTower(): Tower | null {
    if (!this.selectedTowerId) return null;
    return this.getTowerById(this.selectedTowerId) || null;
  }

  public selectTower(id: string | null) {
    this.selectedTowerId = id;
  }

  public createTower(
    type: TowerType,
    x: number,
    y: number,
    gridX: number,
    gridY: number
  ): Tower {
    const config = TOWER_CONFIGS[type];
    const tower: Tower = {
      id: generateId('tower'),
      type,
      x,
      y,
      gridX,
      gridY,
      level: 1,
      damage: config.baseDamage,
      range: config.baseRange,
      attackSpeed: config.baseAttackSpeed,
      splashRadius: config.splashRadius,
      cooldownTimer: 0,
      totalCost: config.baseCost,
      kills: 0,
      damageDealt: 0,
      targetStrategy: 'first',
      rotation: -Math.PI / 2, // Facing up by default
      lastFireTime: 0,
    };

    this.towers.push(tower);
    return tower;
  }

  public canUpgrade(towerId: string, currentGold: number): { canUpgrade: boolean; cost: number; reason?: string } {
    const tower = this.getTowerById(towerId);
    if (!tower) return { canUpgrade: false, cost: 0, reason: 'Trụ không tồn tại!' };
    if (tower.level >= 3) return { canUpgrade: false, cost: 0, reason: 'Trụ đã đạt cấp tối đa (Cấp 3)!' };

    const config = TOWER_CONFIGS[tower.type];
    const nextLevel = (tower.level + 1) as 2 | 3;
    const upgradeData = config.upgrades[nextLevel];
    if (!upgradeData) return { canUpgrade: false, cost: 0, reason: 'Không có dữ liệu nâng cấp!' };

    if (currentGold < upgradeData.cost) {
      return { canUpgrade: false, cost: upgradeData.cost, reason: 'Không đủ vàng để nâng cấp!' };
    }

    return { canUpgrade: true, cost: upgradeData.cost };
  }

  public upgradeTower(towerId: string): { success: boolean; cost: number; upgradedTower?: Tower } {
    const tower = this.getTowerById(towerId);
    if (!tower || tower.level >= 3) return { success: false, cost: 0 };

    const config = TOWER_CONFIGS[tower.type];
    const nextLevel = (tower.level + 1) as 2 | 3;
    const upgradeData = config.upgrades[nextLevel];
    if (!upgradeData) return { success: false, cost: 0 };

    tower.level = nextLevel;
    tower.damage = upgradeData.damage;
    tower.range = upgradeData.range;
    tower.attackSpeed = upgradeData.attackSpeed;
    if (upgradeData.splashRadius !== undefined) {
      tower.splashRadius = upgradeData.splashRadius;
    }
    tower.totalCost += upgradeData.cost;

    return { success: true, cost: upgradeData.cost, upgradedTower: tower };
  }

  public getSellValue(towerId: string): number {
    const tower = this.getTowerById(towerId);
    if (!tower) return 0;
    return Math.floor(tower.totalCost * INITIAL_GAME_STATE.sellRefundRate);
  }

  public sellTower(towerId: string): { success: boolean; refund: number } {
    const idx = this.towers.findIndex((t) => t.id === towerId);
    if (idx === -1) return { success: false, refund: 0 };

    const refund = this.getSellValue(towerId);
    this.towers.splice(idx, 1);
    if (this.selectedTowerId === towerId) {
      this.selectedTowerId = null;
    }

    return { success: true, refund };
  }

  public setTargetStrategy(towerId: string, strategy: TargetStrategy) {
    const tower = this.getTowerById(towerId);
    if (tower) {
      tower.targetStrategy = strategy;
    }
  }

  /**
   * Finds the best target enemy within tower range according to targeting strategy.
   */
  public findTarget(tower: Tower, enemies: Enemy[]): Enemy | null {
    const enemiesInRange = enemies.filter((e) => {
      if (e.isDead || e.reachedBase) return false;
      const d = distance({ x: tower.x, y: tower.y }, { x: e.x, y: e.y });
      return d <= tower.range + e.radius;
    });

    if (enemiesInRange.length === 0) return null;

    switch (tower.targetStrategy) {
      case 'first':
        // Furthest along path
        return enemiesInRange.reduce((prev, curr) =>
          curr.distanceTraveled > prev.distanceTraveled ? curr : prev
        );

      case 'last':
        // Least distance along path
        return enemiesInRange.reduce((prev, curr) =>
          curr.distanceTraveled < prev.distanceTraveled ? curr : prev
        );

      case 'closest':
        // Closest Euclidean distance to tower
        return enemiesInRange.reduce((prev, curr) => {
          const dCurr = distance({ x: tower.x, y: tower.y }, { x: curr.x, y: curr.y });
          const dPrev = distance({ x: tower.x, y: tower.y }, { x: prev.x, y: prev.y });
          return dCurr < dPrev ? curr : prev;
        });

      case 'strongest':
        // Highest current HP
        return enemiesInRange.reduce((prev, curr) =>
          curr.currentHp > prev.currentHp ? curr : prev
        );

      case 'weakest':
        // Lowest current HP
        return enemiesInRange.reduce((prev, curr) =>
          curr.currentHp < prev.currentHp ? curr : prev
        );

      default:
        return enemiesInRange[0];
    }
  }

  /**
   * Updates tower cooldowns, rotates towards target, and fires projectiles.
   */
  public update(
    dt: number,
    enemyManager: EnemyManager,
    projectileManager: ProjectileManager
  ): TowerFireEvent[] {
    const fireEvents: TowerFireEvent[] = [];

    for (const tower of this.towers) {
      if (tower.cooldownTimer > 0) {
        tower.cooldownTimer = Math.max(0, tower.cooldownTimer - dt);
      }

      // Find target
      const target = this.findTarget(tower, enemyManager.enemies);

      if (target) {
        // Rotate tower facing target
        tower.rotation = angleBetween({ x: tower.x, y: tower.y }, { x: target.x, y: target.y });

        // Fire if cooldown is ready
        if (tower.cooldownTimer <= 0) {
          tower.cooldownTimer = 1 / tower.attackSpeed;
          tower.lastFireTime = Date.now();

          const config = TOWER_CONFIGS[tower.type];
          let slowEffect: { duration: number; factor: number } | undefined;

          if (tower.type === 'magic') {
            const factor = tower.level === 3 ? 0.55 : tower.level === 2 ? 0.45 : 0.35;
            const duration = tower.level === 3 ? 3.0 : tower.level === 2 ? 2.5 : 2.0;
            slowEffect = { duration, factor };
          }

          projectileManager.spawnProjectile(
            tower.id,
            config.projectileType,
            tower.x,
            tower.y,
            target.x,
            target.y,
            tower.damage,
            config.projectileSpeed,
            tower.splashRadius,
            target.id,
            slowEffect
          );

          fireEvents.push({ tower, targetEnemy: target });
        }
      }
    }

    return fireEvents;
  }
}

