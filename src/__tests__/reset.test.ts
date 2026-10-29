import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../engine/GameEngine';

describe('Game Reset and State Reinitialization', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('completely resets all gameplay state, towers, enemies, projectiles and stats', () => {
    // Dirty the state: build towers, take damage, change gold, spawn enemies, advance waves
    engine.gold = 500;
    engine.selectTowerTypeToBuild('archer');
    engine.buildTowerAt(100, 350);
    engine.selectTowerTypeToBuild('cannon');
    engine.buildTowerAt(300, 100);

    engine.baseHp = 7;
    engine.currentWave = 4;
    engine.gameStatus = 'PAUSED';
    engine.gameSpeed = 4;
    engine.stats.enemiesKilled = 25;
    engine.stats.damageDealt = 1800;

    engine.enemyManager.spawnEnemy('orc');
    engine.projectileManager.spawnProjectile(
      't1',
      'cannonball',
      0,
      0,
      100,
      100,
      50,
      200,
      70
    );
    engine.particleManager.addDamageText(100, 100, '-50');

    // Call restart
    engine.restart();

    // Verify pristine initial state
    expect(engine.baseHp).toBe(20);
    expect(engine.maxBaseHp).toBe(20);
    expect(engine.gold).toBe(150);
    expect(engine.currentWave).toBe(0);
    expect(engine.gameStatus).toBe('IDLE');
    expect(engine.gameSpeed).toBe(1);
    expect(engine.buildingTowerType).toBe(null);

    // Verify managers are emptied
    expect(engine.towerManager.towers.length).toBe(0);
    expect(engine.towerManager.selectedTowerId).toBe(null);
    expect(engine.enemyManager.enemies.length).toBe(0);
    expect(engine.projectileManager.projectiles.length).toBe(0);
    expect(engine.particleManager.particles.length).toBe(0);

    // Verify stats are reset
    expect(engine.stats.enemiesKilled).toBe(0);
    expect(engine.stats.goldEarned).toBe(0);
    expect(engine.stats.damageDealt).toBe(0);
    expect(engine.stats.towersBuilt).toBe(0);
    expect(engine.stats.wavesCleared).toBe(0);
  });
});

