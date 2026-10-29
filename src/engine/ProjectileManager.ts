import { Enemy, Projectile, ProjectileType } from '../types/game';
import { angleBetween, distance, generateId } from '../utils/math';
import { EnemyManager } from './EnemyManager';

export interface HitResult {
  x: number;
  y: number;
  type: ProjectileType;
  damage: number;
  splashRadius: number;
  killedEnemies: Enemy[];
  totalGoldEarned: number;
}

export class ProjectileManager {
  public projectiles: Projectile[] = [];

  public reset() {
    this.projectiles = [];
  }

  public spawnProjectile(
    towerId: string,
    type: ProjectileType,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    splashRadius: number,
    targetEnemyId?: string,
    slowEffect?: { duration: number; factor: number }
  ): Projectile {
    const totalDist = distance({ x: startX, y: startY }, { x: targetX, y: targetY });

    const proj: Projectile = {
      id: generateId('proj'),
      towerId,
      type,
      x: startX,
      y: startY,
      startX,
      startY,
      targetX,
      targetY,
      targetEnemyId,
      speed,
      damage,
      splashRadius,
      slowEffect,
      hasHit: false,
      distanceTotal: totalDist,
      distanceCovered: 0,
    };

    this.projectiles.push(proj);
    return proj;
  }

  public update(dt: number, enemyManager: EnemyManager): HitResult[] {
    const hits: HitResult[] = [];

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Update target position if tracking an active enemy
      if (p.targetEnemyId) {
        const targetEnemy = enemyManager.enemies.find((e) => e.id === p.targetEnemyId);
        if (targetEnemy && !targetEnemy.isDead) {
          p.targetX = targetEnemy.x;
          p.targetY = targetEnemy.y;
        }
      }

      const distToTarget = distance({ x: p.x, y: p.y }, { x: p.targetX, y: p.targetY });
      const moveDist = p.speed * dt;

      if (distToTarget <= moveDist) {
        // Projectile reached target!
        p.hasHit = true;
        p.x = p.targetX;
        p.y = p.targetY;

        const hitResult: HitResult = {
          x: p.x,
          y: p.y,
          type: p.type,
          damage: p.damage,
          splashRadius: p.splashRadius,
          killedEnemies: [],
          totalGoldEarned: 0,
        };

        if (p.splashRadius > 0) {
          // AoE Cannonball damage
          for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
            const enemy = enemyManager.enemies[j];
            if (enemy.isDead) continue;

            const d = distance({ x: p.x, y: p.y }, { x: enemy.x, y: enemy.y });
            if (d <= p.splashRadius + enemy.radius) {
              // Apply damage
              const res = enemyManager.applyDamage(enemy.id, p.damage, p.slowEffect);
              if (res.died && res.enemy && !res.enemy.isRewardClaimed) {
                res.enemy.isRewardClaimed = true;
                hitResult.killedEnemies.push(res.enemy);
                hitResult.totalGoldEarned += res.enemy.goldReward;
                // Remove killed enemy
                enemyManager.enemies.splice(j, 1);
              }
            }
          }
        } else if (p.targetEnemyId) {
          // Single target: Arrow or Magic
          const targetEnemy = enemyManager.enemies.find((e) => e.id === p.targetEnemyId);
          if (targetEnemy && !targetEnemy.isDead) {
            const res = enemyManager.applyDamage(targetEnemy.id, p.damage, p.slowEffect);
            if (res.died && res.enemy && !res.enemy.isRewardClaimed) {
              res.enemy.isRewardClaimed = true;
              hitResult.killedEnemies.push(res.enemy);
              hitResult.totalGoldEarned += res.enemy.goldReward;
              const idx = enemyManager.enemies.indexOf(targetEnemy);
              if (idx !== -1) {
                enemyManager.enemies.splice(idx, 1);
              }
            }
          }
        }

        hits.push(hitResult);
        this.projectiles.splice(i, 1);
      } else {
        // Move towards target
        const angle = angleBetween({ x: p.x, y: p.y }, { x: p.targetX, y: p.targetY });
        p.x += Math.cos(angle) * moveDist;
        p.y += Math.sin(angle) * moveDist;
        p.distanceCovered += moveDist;
      }
    }

    return hits;
  }
}
