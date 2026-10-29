import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../engine/GameEngine';

describe('Single Death and Safe Targeting Guarantees', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('guarantees enemy death is counted exactly once and cannot take damage again', () => {
    const enemy = engine.enemyManager.spawnEnemy('goblin');

    // First lethal damage
    const res1 = engine.enemyManager.applyDamage(enemy.id, 9999);
    expect(res1.died).toBe(true);
    expect(enemy.isDead).toBe(true);

    // Second damage call to already dead enemy
    const res2 = engine.enemyManager.applyDamage(enemy.id, 500);
    expect(res2.died).toBe(false); // cannot die a second time
  });

  it('never awards duplicate gold when enemy is killed', () => {
    const enemy = engine.enemyManager.spawnEnemy('goblin');
    const initialGold = engine.gold;

    // Fatal damage
    engine.enemyManager.applyDamage(enemy.id, enemy.maxHp);

    // Update enemy manager once
    const res1 = engine.enemyManager.update(0.016);
    expect(res1.killedEnemies.length).toBe(1);
    expect(res1.totalGoldEarned).toBe(enemy.goldReward);

    // Update enemy manager again
    const res2 = engine.enemyManager.update(0.016);
    expect(res2.killedEnemies.length).toBe(0);
    expect(res2.totalGoldEarned).toBe(0);

    // Enemy is removed from active array
    expect(engine.enemyManager.enemies.includes(enemy)).toBe(false);
  });

  it('prevents projectiles from dealing damage to an already dead enemy', () => {
    const enemy = engine.enemyManager.spawnEnemy('runner');
    enemy.x = 200;
    enemy.y = 200;

    // Fire arrow at runner
    engine.projectileManager.spawnProjectile(
      'archer_1',
      'arrow',
      100,
      100,
      200,
      200,
      25,
      5000,
      0,
      enemy.id
    );

    // Enemy is killed beforehand by another effect
    engine.enemyManager.applyDamage(enemy.id, 999);
    expect(enemy.isDead).toBe(true);

    // Update projectile flight -> it arrives, but enemy is dead
    const hits = engine.projectileManager.update(0.1, engine.enemyManager);
    expect(hits.length).toBe(1);
    expect(hits[0].killedEnemies.length).toBe(0);
    expect(hits[0].totalGoldEarned).toBe(0);
  });

  it('rejects starting new waves when paused or when game is over', () => {
    // 1. When paused
    engine.togglePause();
    expect(engine.gameStatus).toBe('PAUSED');
    const startedWhenPaused = engine.startNextWave();
    expect(startedWhenPaused).toBe(false);

    // 2. Unpause and simulate game over
    engine.togglePause();
    engine.gameStatus = 'GAME_OVER';
    const startedWhenGameOver = engine.startNextWave();
    expect(startedWhenGameOver).toBe(false);

    // 3. When victory
    engine.gameStatus = 'VICTORY';
    const startedWhenVictory = engine.startNextWave();
    expect(startedWhenVictory).toBe(false);
  });
});

