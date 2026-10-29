import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../engine/GameEngine';
import { TOWER_CONFIGS, INITIAL_GAME_STATE, ENEMY_CONFIGS } from '../config/gameConfig';

describe('Tower Defense Economy Rules', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  it('initializes with 150 starting gold and 20 base HP', () => {
    expect(engine.gold).toBe(150);
    expect(engine.baseHp).toBe(20);
    expect(engine.maxBaseHp).toBe(20);
  });

  it('deducts exact gold when building a tower', () => {
    const archerCost = TOWER_CONFIGS.archer.baseCost; // 70
    engine.selectTowerTypeToBuild('archer');
    // Choose valid location (e.g. x: 100, y: 350)
    const success = engine.buildTowerAt(100, 350);

    expect(success).toBe(true);
    expect(engine.gold).toBe(150 - archerCost);
    expect(engine.towerManager.towers.length).toBe(1);
    expect(engine.stats.towersBuilt).toBe(1);
  });

  it('rejects tower building when gold is insufficient', () => {
    engine.gold = 50; // Cannon costs 125
    engine.selectTowerTypeToBuild('cannon');
    const success = engine.buildTowerAt(100, 350);

    expect(success).toBe(false);
    expect(engine.gold).toBe(50);
    expect(engine.towerManager.towers.length).toBe(0);
  });

  it('deducts upgrade cost on successful upgrade', () => {
    engine.gold = 200;
    engine.selectTowerTypeToBuild('archer');
    engine.buildTowerAt(100, 350);

    const tower = engine.towerManager.towers[0];
    const goldBeforeUpgrade = engine.gold;
    const upgradeCost = TOWER_CONFIGS.archer.upgrades[2].cost;

    const success = engine.upgradeTower(tower.id);
    expect(success).toBe(true);
    expect(engine.gold).toBe(goldBeforeUpgrade - upgradeCost);
    expect(tower.level).toBe(2);
  });

  it('refunds 70% of total invested gold when selling', () => {
    engine.gold = 200;
    engine.selectTowerTypeToBuild('archer');
    engine.buildTowerAt(100, 350);

    const tower = engine.towerManager.towers[0];
    const initialInvested = tower.totalCost; // 70

    // Upgrade to level 2
    engine.upgradeTower(tower.id);
    const upgradeCost = TOWER_CONFIGS.archer.upgrades[2].cost; // 55
    const totalInvested = initialInvested + upgradeCost; // 125
    expect(tower.totalCost).toBe(totalInvested);

    const expectedRefund = Math.floor(totalInvested * INITIAL_GAME_STATE.sellRefundRate);
    const goldBeforeSell = engine.gold;

    const sellSuccess = engine.sellTower(tower.id);
    expect(sellSuccess).toBe(true);
    expect(engine.gold).toBe(goldBeforeSell + expectedRefund);
    expect(engine.towerManager.towers.length).toBe(0);
  });

  it('awards gold when an enemy is killed', () => {
    const goblinReward = ENEMY_CONFIGS.goblin.goldReward;
    const enemy = engine.enemyManager.spawnEnemy('goblin');
    const initialGold = engine.gold;

    // Apply lethal damage
    const res = engine.enemyManager.applyDamage(enemy.id, enemy.maxHp);
    expect(res.died).toBe(true);

    // Update enemy manager to process deaths and awards
    const updateResult = engine.enemyManager.update(0.016);
    expect(updateResult.killedEnemies.length).toBe(1);
    expect(updateResult.totalGoldEarned).toBe(goblinReward);
  });
});

