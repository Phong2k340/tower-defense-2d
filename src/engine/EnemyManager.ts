import { ENEMY_CONFIGS, WAVES } from '../config/gameConfig';
import { Enemy, EnemySpawnGroup, EnemyType, Point, WaveConfig } from '../types/game';
import { angleBetween, distance, generateId } from '../utils/math';

export interface EnemyUpdateResult {
  killedEnemies: Enemy[];
  reachedBaseEnemies: Enemy[];
  totalGoldEarned: number;
  totalBaseDamage: number;
}

export class EnemyManager {
  public enemies: Enemy[] = [];
  public waypoints: Point[];
  public activeWave: WaveConfig | null = null;
  public waveGroups: EnemySpawnGroup[] = [];
  public isWaveSpawning: boolean = false;
  public waveTimer: number = 0;

  constructor(waypoints: Point[]) {
    this.waypoints = waypoints;
  }

  public reset() {
    this.enemies = [];
    this.activeWave = null;
    this.waveGroups = [];
    this.isWaveSpawning = false;
    this.waveTimer = 0;
  }

  public startWave(waveIndex: number): boolean {
    const wave = WAVES.find((w) => w.waveNumber === waveIndex);
    if (!wave) return false;

    // Clone groups so we don't mutate original definitions
    this.activeWave = wave;
    this.waveGroups = wave.groups.map((g) => ({
      ...g,
      spawned: 0,
      timer: 0,
    }));
    this.waveTimer = 0;
    this.isWaveSpawning = true;
    return true;
  }

  public spawnEnemy(type: EnemyType): Enemy {
    const config = ENEMY_CONFIGS[type];
    const startPoint = this.waypoints[0];

    const enemy: Enemy = {
      id: generateId('enemy'),
      type,
      name: config.name,
      x: startPoint.x,
      y: startPoint.y,
      maxHp: config.hp,
      currentHp: config.hp,
      baseSpeed: config.speed,
      speed: config.speed,
      goldReward: config.goldReward,
      livesDeducted: config.livesDeducted,
      radius: config.radius,
      color: config.color,
      accentColor: config.accentColor,
      waypointIndex: 0,
      distanceTraveled: 0,
      isDead: false,
      isRewardClaimed: false,
      reachedBase: false,
      slowTimer: 0,
      slowFactor: 0,
      hitFlashTimer: 0,
      walkCycle: 0,
    };

    this.enemies.push(enemy);
    return enemy;
  }

  public update(dt: number): EnemyUpdateResult {
    const result: EnemyUpdateResult = {
      killedEnemies: [],
      reachedBaseEnemies: [],
      totalGoldEarned: 0,
      totalBaseDamage: 0,
    };

    // 1. Spawning logic for active wave
    if (this.isWaveSpawning && this.waveGroups.length > 0) {
      this.waveTimer += dt;
      let allGroupsDone = true;

      for (const group of this.waveGroups) {
        if (group.spawned < group.count) {
          allGroupsDone = false;
          // Check if initial delay has elapsed
          if (this.waveTimer >= group.delay) {
            group.timer += dt;
            if (group.timer >= group.interval || group.spawned === 0) {
              group.timer = 0;
              this.spawnEnemy(group.enemyType);
              group.spawned++;
            }
          }
        }
      }

      if (allGroupsDone) {
        this.isWaveSpawning = false;
      }
    }

    // 2. Update existing enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Handle hit flash timer
      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
      }

      // Handle slow status effect
      if (enemy.slowTimer > 0) {
        enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
        enemy.speed = enemy.baseSpeed * (1 - enemy.slowFactor);
      } else {
        enemy.speed = enemy.baseSpeed;
        enemy.slowFactor = 0;
      }

      // Check if dead or death flagged
      if ((enemy.currentHp <= 0 || enemy.isDead) && !enemy.reachedBase) {
        enemy.isDead = true;
        if (!enemy.isRewardClaimed) {
          enemy.isRewardClaimed = true;
          result.killedEnemies.push(enemy);
          result.totalGoldEarned += enemy.goldReward;
        }
        this.enemies.splice(i, 1);
        continue;
      }

      // Movement along waypoints
      const nextWaypointIdx = enemy.waypointIndex + 1;
      if (nextWaypointIdx >= this.waypoints.length) {
        // Reached destination base!
        if (!enemy.reachedBase && !enemy.isDead) {
          enemy.reachedBase = true;
          result.reachedBaseEnemies.push(enemy);
          result.totalBaseDamage += enemy.livesDeducted;
        }
        this.enemies.splice(i, 1);
        continue;
      }

      const targetWaypoint = this.waypoints[nextWaypointIdx];
      const distToNext = distance({ x: enemy.x, y: enemy.y }, targetWaypoint);
      const moveDist = enemy.speed * dt;

      enemy.walkCycle += dt * (enemy.speed / 20);

      if (distToNext <= moveDist) {
        // Snap to waypoint and advance index
        enemy.x = targetWaypoint.x;
        enemy.y = targetWaypoint.y;
        enemy.distanceTraveled += distToNext;
        enemy.waypointIndex = nextWaypointIdx;

        // Check if finished path after reaching waypoint
        if (enemy.waypointIndex >= this.waypoints.length - 1) {
          if (!enemy.reachedBase && !enemy.isDead) {
            enemy.reachedBase = true;
            result.reachedBaseEnemies.push(enemy);
            result.totalBaseDamage += enemy.livesDeducted;
          }
          this.enemies.splice(i, 1);
          continue;
        }
      } else {
        // Move towards next waypoint
        const angle = angleBetween({ x: enemy.x, y: enemy.y }, targetWaypoint);
        enemy.x += Math.cos(angle) * moveDist;
        enemy.y += Math.sin(angle) * moveDist;
        enemy.distanceTraveled += moveDist;
      }
    }

    return result;
  }

  /**
   * Applies damage to an enemy with guarantee that dead enemies don't get damaged or reward twice.
   */
  public applyDamage(
    enemyId: string,
    damage: number,
    slowEffect?: { duration: number; factor: number }
  ): { died: boolean; enemy?: Enemy } {
    const enemy = this.enemies.find((e) => e.id === enemyId);
    if (!enemy || enemy.isDead) {
      return { died: false };
    }

    enemy.currentHp -= damage;
    enemy.hitFlashTimer = 0.12;

    if (slowEffect && slowEffect.factor > enemy.slowFactor) {
      enemy.slowTimer = slowEffect.duration;
      enemy.slowFactor = slowEffect.factor;
    }

    if (enemy.currentHp <= 0) {
      enemy.isDead = true;
      return { died: true, enemy };
    }

    return { died: false, enemy };
  }

  public getActiveEnemyCount(): number {
    return this.enemies.length;
  }

  public isWaveFinished(): boolean {
    return !this.isWaveSpawning && this.enemies.length === 0;
  }
}
