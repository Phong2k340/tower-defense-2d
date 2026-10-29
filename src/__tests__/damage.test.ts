import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../engine/GameEngine';

describe('Combat and Damage Calculation Rules', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('deals exact single-target damage to an enemy', () => {
    const enemy = engine.enemyManager.spawnEnemy('orc');
    const initialHp = enemy.currentHp;
    const damage = 35;

    const res = engine.enemyManager.applyDamage(enemy.id, damage);
    expect(res.died).toBe(false);
    expect(enemy.currentHp).toBe(initialHp - damage);
  });

  it('applies AoE splash damage to all enemies in range and spares outside enemies', () => {
    // Spawn two enemies close to each other, one far away
    const enemy1 = engine.enemyManager.spawnEnemy('goblin');
    enemy1.x = 200;
    enemy1.y = 200;

    const enemy2 = engine.enemyManager.spawnEnemy('goblin');
    enemy2.x = 230;
    enemy2.y = 200;

    const enemyFar = engine.enemyManager.spawnEnemy('goblin');
    enemyFar.x = 500;
    enemyFar.y = 500;

    const initialHp1 = enemy1.currentHp;
    const initialHp2 = enemy2.currentHp;
    const initialHpFar = enemyFar.currentHp;

    // Cannonball arrives at (200, 200) with splash radius 75 and damage 40
    engine.projectileManager.spawnProjectile(
      'cannon_1',
      'cannonball',
      100,
      100,
      200,
      200,
      40,
      5000, // fast speed so it hits on update
      75
    );

    const hits = engine.projectileManager.update(0.1, engine.enemyManager);
    expect(hits.length).toBe(1);

    // Both enemy1 and enemy2 are within radius 75 from (200, 200)
    expect(enemy1.currentHp).toBe(initialHp1 - 40);
    expect(enemy2.currentHp).toBe(initialHp2 - 40);

    // enemyFar is at (500, 500), well outside splash radius
    expect(enemyFar.currentHp).toBe(initialHpFar);
  });

  it('reduces base HP when an enemy reaches the base', () => {
    const enemy = engine.enemyManager.spawnEnemy('goblin');
    // Set waypoint index to the last segment
    enemy.waypointIndex = engine.enemyManager.waypoints.length - 2;
    const lastWaypoint = engine.enemyManager.waypoints[engine.enemyManager.waypoints.length - 1];

    enemy.x = lastWaypoint.x - 2;
    enemy.y = lastWaypoint.y;

    // Move past the base waypoint
    const updateRes = engine.enemyManager.update(0.1);
    expect(updateRes.reachedBaseEnemies.length).toBe(1);
    expect(updateRes.totalBaseDamage).toBe(enemy.livesDeducted);
  });

  it('triggers GAME_OVER when base HP reaches 0', () => {
    engine.baseHp = 1;
    const enemy = engine.enemyManager.spawnEnemy('goblin');
    enemy.waypointIndex = engine.enemyManager.waypoints.length - 2;
    const lastWaypoint = engine.enemyManager.waypoints[engine.enemyManager.waypoints.length - 1];
    enemy.x = lastWaypoint.x - 1;
    enemy.y = lastWaypoint.y;

    // Tick the engine
    (engine as unknown as { tick: (dt: number) => void }).tick(0.05);

    expect(engine.baseHp).toBe(0);
    expect(engine.gameStatus).toBe('GAME_OVER');
  });
});

