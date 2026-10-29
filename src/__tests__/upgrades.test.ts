import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../engine/GameEngine';
import { TOWER_CONFIGS } from '../config/gameConfig';

describe('Tower Upgrade System', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.gold = 1000; // ample gold for testing upgrades
  });

  it('correctly scales tower stats across Level 1 -> 2 -> 3', () => {
    engine.selectTowerTypeToBuild('cannon');
    engine.buildTowerAt(100, 350);
    const tower = engine.towerManager.towers[0];

    // Level 1 baseline
    expect(tower.level).toBe(1);
    expect(tower.damage).toBe(TOWER_CONFIGS.cannon.baseDamage);
    expect(tower.range).toBe(TOWER_CONFIGS.cannon.baseRange);
    expect(tower.splashRadius).toBe(TOWER_CONFIGS.cannon.splashRadius);

    // Upgrade to Level 2
    const upg2 = engine.upgradeTower(tower.id);
    expect(upg2).toBe(true);
    expect(tower.level).toBe(2);
    expect(tower.damage).toBe(TOWER_CONFIGS.cannon.upgrades[2].damage);
    expect(tower.range).toBe(TOWER_CONFIGS.cannon.upgrades[2].range);
    expect(tower.splashRadius).toBe(TOWER_CONFIGS.cannon.upgrades[2].splashRadius);

    // Upgrade to Level 3
    const upg3 = engine.upgradeTower(tower.id);
    expect(upg3).toBe(true);
    expect(tower.level).toBe(3);
    expect(tower.damage).toBe(TOWER_CONFIGS.cannon.upgrades[3].damage);
    expect(tower.range).toBe(TOWER_CONFIGS.cannon.upgrades[3].range);
    expect(tower.splashRadius).toBe(TOWER_CONFIGS.cannon.upgrades[3].splashRadius);

    // Cannot upgrade past Level 3
    const upg4 = engine.upgradeTower(tower.id);
    expect(upg4).toBe(false);
    expect(tower.level).toBe(3);
  });

  it('correctly tracks total invested cost for sell calculations', () => {
    engine.selectTowerTypeToBuild('magic');
    engine.buildTowerAt(100, 350);
    const tower = engine.towerManager.towers[0];

    const baseCost = TOWER_CONFIGS.magic.baseCost; // 100
    expect(tower.totalCost).toBe(baseCost);

    engine.upgradeTower(tower.id);
    const cost2 = TOWER_CONFIGS.magic.upgrades[2].cost; // 75
    expect(tower.totalCost).toBe(baseCost + cost2);

    engine.upgradeTower(tower.id);
    const cost3 = TOWER_CONFIGS.magic.upgrades[3].cost; // 125
    expect(tower.totalCost).toBe(baseCost + cost2 + cost3);

    // Sell value should be floor(total * 0.7)
    const expectedSell = Math.floor((baseCost + cost2 + cost3) * 0.7);
    expect(engine.towerManager.getSellValue(tower.id)).toBe(expectedSell);
  });
});

