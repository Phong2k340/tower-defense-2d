import { INITIAL_GAME_STATE, MAP_CONFIG, PATH_WAYPOINTS, TOWER_CONFIGS, WAVES } from '../config/gameConfig';
import { GameStats, GameStatus, Point, TargetStrategy, Tower, TowerType } from '../types/game';
import { CanvasRenderer } from './CanvasRenderer';
import { EnemyManager } from './EnemyManager';
import { GameLoop } from './GameLoop';
import { MapManager } from './MapManager';
import { ParticleManager } from './ParticleManager';
import { ProjectileManager } from './ProjectileManager';
import { soundManager } from './SoundManager';
import { TowerManager } from './TowerManager';

export interface UIStateSnapshot {
  baseHp: number;
  maxBaseHp: number;
  gold: number;
  currentWave: number;
  totalWaves: number;
  gameStatus: GameStatus;
  gameSpeed: 1 | 2 | 4;
  selectedTower: Tower | null;
  buildingTowerType: TowerType | null;
  stats: GameStats;
  soundEnabled: boolean;
  enemiesActive: number;
}

export type StateListener = (snapshot: UIStateSnapshot) => void;
export type ToastListener = (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;

export class GameEngine {
  public mapManager: MapManager;
  public enemyManager: EnemyManager;
  public towerManager: TowerManager;
  public projectileManager: ProjectileManager;
  public particleManager: ParticleManager;
  public renderer: CanvasRenderer | null = null;
  public loop: GameLoop;

  // Economy & Game Progression
  public baseHp: number = INITIAL_GAME_STATE.baseHp;
  public maxBaseHp: number = INITIAL_GAME_STATE.maxBaseHp;
  public gold: number = INITIAL_GAME_STATE.startingGold;
  public currentWave: number = 0;
  public totalWaves: number = INITIAL_GAME_STATE.totalWaves;
  public gameStatus: GameStatus = 'IDLE';
  public gameSpeed: 1 | 2 | 4 = 1;

  // Interaction
  public buildingTowerType: TowerType | null = null;
  public hoverShopTowerType: TowerType | null = null;
  public mousePos: Point | null = null;

  // Stats
  public stats: GameStats = {
    enemiesKilled: 0,
    goldEarned: 0,
    damageDealt: 0,
    towersBuilt: 0,
    wavesCleared: 0,
  };

  private stateListeners: Set<StateListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();
  private lastStateBroadcast: number = 0;

  constructor(waypoints: Point[] = PATH_WAYPOINTS) {
    this.mapManager = new MapManager(waypoints);
    this.enemyManager = new EnemyManager(waypoints);
    this.towerManager = new TowerManager();
    this.projectileManager = new ProjectileManager();
    this.particleManager = new ParticleManager();

    this.loop = new GameLoop(this.tick.bind(this));
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.renderer = new CanvasRenderer(ctx);
  }

  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getSnapshot());
    return () => this.stateListeners.delete(listener);
  }

  public subscribeToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  public notifyToast(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    this.toastListeners.forEach((listener) => listener(message, type));
  }

  public getSnapshot(): UIStateSnapshot {
    return {
      baseHp: this.baseHp,
      maxBaseHp: this.maxBaseHp,
      gold: this.gold,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      gameStatus: this.gameStatus,
      gameSpeed: this.gameSpeed,
      selectedTower: this.towerManager.getSelectedTower(),
      buildingTowerType: this.buildingTowerType,
      stats: { ...this.stats },
      soundEnabled: soundManager.enabled,
      enemiesActive: this.enemyManager.getActiveEnemyCount(),
    };
  }

  public broadcastState(force: boolean = false) {
    const now = performance.now();
    if (force || now - this.lastStateBroadcast > 40) {
      this.lastStateBroadcast = now;
      const snapshot = this.getSnapshot();
      this.stateListeners.forEach((fn) => fn(snapshot));
    }
  }

  public start() {
    this.loop.start();
  }

  public destroy() {
    this.loop.stop();
    this.stateListeners.clear();
    this.toastListeners.clear();
  }

  public restart() {
    this.baseHp = INITIAL_GAME_STATE.baseHp;
    this.gold = INITIAL_GAME_STATE.startingGold;
    this.currentWave = 0;
    this.gameStatus = 'IDLE';
    this.gameSpeed = 1;
    this.buildingTowerType = null;
    this.hoverShopTowerType = null;
    this.mousePos = null;

    this.stats = {
      enemiesKilled: 0,
      goldEarned: 0,
      damageDealt: 0,
      towersBuilt: 0,
      wavesCleared: 0,
    };

    this.enemyManager.reset();
    this.towerManager.reset();
    this.projectileManager.reset();
    this.particleManager.reset();

    this.notifyToast('Đã khởi động lại trận chiến mới!', 'info');
    this.broadcastState(true);
  }

  public togglePause() {
    if (this.gameStatus === 'GAME_OVER' || this.gameStatus === 'VICTORY') return;

    if (this.gameStatus === 'PAUSED') {
      this.gameStatus = this.enemyManager.isWaveFinished() ? 'WAVE_COMPLETED' : 'WAVE_ACTIVE';
      this.notifyToast('Tiếp tục trò chơi', 'info');
    } else {
      this.gameStatus = 'PAUSED';
      this.notifyToast('Trò chơi tạm dừng', 'warning');
    }
    this.broadcastState(true);
  }

  public setSpeed(speed: 1 | 2 | 4) {
    this.gameSpeed = speed;
    this.broadcastState(true);
  }

  public toggleSound(): boolean {
    const enabled = soundManager.toggleMute();
    this.notifyToast(enabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt', 'info');
    this.broadcastState(true);
    return enabled;
  }

  public selectTowerTypeToBuild(type: TowerType | null) {
    if (type) {
      const config = TOWER_CONFIGS[type];
      if (this.gold < config.baseCost) {
        this.notifyToast(`Không đủ vàng để xây ${config.name}! Cần ${config.baseCost} Vàng`, 'error');
        return;
      }
    }
    this.buildingTowerType = type;
    this.towerManager.selectTower(null);
    this.broadcastState(true);
  }

  public setHoverShopTowerType(type: TowerType | null) {
    this.hoverShopTowerType = type;
  }

  public selectTower(id: string | null) {
    this.buildingTowerType = null;
    this.towerManager.selectTower(id);
    this.broadcastState(true);
  }

  public setTowerTargetStrategy(towerId: string, strategy: TargetStrategy) {
    this.towerManager.setTargetStrategy(towerId, strategy);
    this.broadcastState(true);
  }

  public startNextWave(): boolean {
    if (
      this.gameStatus === 'PAUSED' ||
      this.gameStatus === 'GAME_OVER' ||
      this.gameStatus === 'VICTORY' ||
      this.gameStatus === 'WAVE_ACTIVE'
    ) {
      return false;
    }

    if (this.currentWave >= this.totalWaves) {
      this.gameStatus = 'VICTORY';
      soundManager.playVictory();
      this.broadcastState(true);
      return false;
    }

    this.currentWave++;
    const started = this.enemyManager.startWave(this.currentWave);
    if (started) {
      this.gameStatus = 'WAVE_ACTIVE';
      soundManager.playWaveHorn();
      this.notifyToast(`Bắt đầu Đợt ${this.currentWave} / ${this.totalWaves}!`, 'info');
      this.broadcastState(true);
      return true;
    }

    return false;
  }

  public buildTowerAt(x: number, y: number): boolean {
    if (!this.buildingTowerType) return false;

    const config = TOWER_CONFIGS[this.buildingTowerType];
    if (this.gold < config.baseCost) {
      this.notifyToast(`Không đủ vàng! Cần ${config.baseCost} Vàng`, 'error');
      return false;
    }

    const snapped = this.mapManager.snapToGrid(x, y);
    const validation = this.mapManager.validatePlacement(snapped.x, snapped.y, this.towerManager.towers);

    if (!validation.valid) {
      this.notifyToast(validation.reason || 'Vị trí xây dựng không hợp lệ!', 'error');
      return false;
    }

    // Deduct gold
    this.gold -= config.baseCost;
    this.stats.towersBuilt++;

    const tower = this.towerManager.createTower(
      this.buildingTowerType,
      snapped.x,
      snapped.y,
      snapped.gridX,
      snapped.gridY
    );

    soundManager.playBuild();
    this.particleManager.addGoldText(snapped.x, snapped.y, -config.baseCost);
    this.buildingTowerType = null;
    this.towerManager.selectTower(tower.id);
    this.notifyToast(`Đã xây dựng ${config.name}!`, 'success');

    this.broadcastState(true);
    return true;
  }

  public upgradeTower(towerId: string): boolean {
    const tower = this.towerManager.getTowerById(towerId);
    if (!tower) return false;

    const canRes = this.towerManager.canUpgrade(towerId, this.gold);
    if (!canRes.canUpgrade) {
      this.notifyToast(canRes.reason || 'Không thể nâng cấp!', 'error');
      return false;
    }

    this.gold -= canRes.cost;
    const res = this.towerManager.upgradeTower(towerId);
    if (res.success && res.upgradedTower) {
      soundManager.playUpgrade();
      this.particleManager.addGoldText(res.upgradedTower.x, res.upgradedTower.y, -res.cost);
      this.notifyToast(`Đã nâng cấp lên Cấp ${res.upgradedTower.level}!`, 'success');
      this.broadcastState(true);
      return true;
    }

    return false;
  }

  public sellTower(towerId: string): boolean {
    const tower = this.towerManager.getTowerById(towerId);
    if (!tower) return false;

    const tx = tower.x;
    const ty = tower.y;
    const res = this.towerManager.sellTower(towerId);

    if (res.success) {
      this.gold += res.refund;
      this.stats.goldEarned += res.refund;
      soundManager.playSell();
      this.particleManager.addGoldText(tx, ty, res.refund);
      this.notifyToast(`Đã bán trụ, nhận lại +${res.refund} Vàng`, 'info');
      this.broadcastState(true);
      return true;
    }

    return false;
  }

  // Pointer / Click Handler
  public handleCanvasClick(rawX: number, rawY: number) {
    // Check if clicked an existing tower first (always allow selecting/inspecting)
    let clickedTower: Tower | null = null;
    for (const t of this.towerManager.towers) {
      const dx = rawX - t.x;
      const dy = rawY - t.y;
      if (dx * dx + dy * dy <= 24 * 24) {
        clickedTower = t;
        break;
      }
    }

    if (clickedTower) {
      this.selectTower(clickedTower.id);
      return;
    }

    // If currently placing a tower
    if (this.buildingTowerType) {
      this.buildTowerAt(rawX, rawY);
      return;
    }

    // Clicked on empty ground -> deselect
    this.selectTower(null);
  }

  public handleCanvasMouseMove(rawX: number, rawY: number) {
    this.mousePos = { x: rawX, y: rawY };
  }

  public handleCanvasMouseLeave() {
    this.mousePos = null;
  }

  // Core Simulation Step with Fixed Sub-Stepping
  private tick(dt: number) {
    if (this.renderer) {
      this.renderer.updateTime(dt);
    }

    // If game paused or ended, skip simulation but keep rendering
    if (
      this.gameStatus !== 'PAUSED' &&
      this.gameStatus !== 'GAME_OVER' &&
      this.gameStatus !== 'VICTORY'
    ) {
      const totalEffectiveDt = dt * this.gameSpeed;
      // Sub-stepping: slice large delta times into chunks <= 0.02s (50 FPS steps)
      // to eliminate tunneling for projectiles and enemies at 2x and 4x speeds!
      const maxSubStep = 0.02;
      let remainingDt = totalEffectiveDt;

      while (remainingDt > 0) {
        const stepDt = Math.min(remainingDt, maxSubStep);
        this.stepSimulation(stepDt);
        remainingDt -= stepDt;

        const currentStatus = this.gameStatus as GameStatus;
        if (currentStatus === 'GAME_OVER' || currentStatus === 'VICTORY') {
          break;
        }
      }
    }

    // Render step
    if (this.renderer) {
      let hoverGhost: { type: TowerType; x: number; y: number; valid: boolean } | null = null;
      if (this.buildingTowerType && this.mousePos) {
        const snapped = this.mapManager.snapToGrid(this.mousePos.x, this.mousePos.y);
        const check = this.mapManager.validatePlacement(snapped.x, snapped.y, this.towerManager.towers);
        hoverGhost = {
          type: this.buildingTowerType,
          x: snapped.x,
          y: snapped.y,
          valid: check.valid && this.gold >= TOWER_CONFIGS[this.buildingTowerType].baseCost,
        };
      }

      this.renderer.render(
        this.mapManager.waypoints,
        this.towerManager.towers,
        this.enemyManager.enemies,
        this.projectileManager.projectiles,
        this.particleManager.particles,
        this.towerManager.getSelectedTower(),
        hoverGhost,
        this.hoverShopTowerType
      );
    }

    // Periodically sync UI
    this.broadcastState();
  }

  private stepSimulation(dt: number) {
    // 1. Update Enemies
    const enemyResult = this.enemyManager.update(dt);

    // Handle enemies reaching base
    if (enemyResult.totalBaseDamage > 0) {
      this.baseHp = Math.max(0, this.baseHp - enemyResult.totalBaseDamage);
      soundManager.playLifeLost();

      for (const e of enemyResult.reachedBaseEnemies) {
        this.particleManager.addDamageText(
          MAP_CONFIG.width - 30,
          e.y,
          `-${e.livesDeducted} Máu!`,
          '#ef4444'
        );
      }

      if (this.baseHp <= 0) {
        this.baseHp = 0;
        this.gameStatus = 'GAME_OVER';
        soundManager.playGameOver();
        this.notifyToast('Căn cứ đã bị phá hủy! Trận đấu kết thúc!', 'error');
        this.broadcastState(true);
        return; // Terminate step immediately, preventing race condition with victory
      }
    }

    // Handle killed enemies from status effects/DOT
    if (enemyResult.killedEnemies.length > 0) {
      this.gold += enemyResult.totalGoldEarned;
      this.stats.goldEarned += enemyResult.totalGoldEarned;
      this.stats.enemiesKilled += enemyResult.killedEnemies.length;

      for (const e of enemyResult.killedEnemies) {
        this.particleManager.addDeathPoof(e.x, e.y, e.color);
        this.particleManager.addGoldText(e.x, e.y, e.goldReward);
      }
      soundManager.playEnemyDeath();
      soundManager.playGold();
    }

    // 2. Update Towers (Targeting & Firing)
    const fireEvents = this.towerManager.update(
      dt,
      this.enemyManager,
      this.projectileManager
    );

    for (const ev of fireEvents) {
      if (ev.tower.type === 'archer') {
        soundManager.playArrowShoot();
      } else if (ev.tower.type === 'cannon') {
        soundManager.playCannonShoot();
      } else if (ev.tower.type === 'magic') {
        soundManager.playMagicShoot();
      }
    }

    // 3. Update Projectiles
    const hits = this.projectileManager.update(dt, this.enemyManager);

    for (const hit of hits) {
      this.stats.damageDealt += hit.damage;

      if (hit.splashRadius > 0) {
        soundManager.playExplosion();
        this.particleManager.addExplosion(hit.x, hit.y, hit.splashRadius);
      } else if (hit.type === 'magic') {
        soundManager.playMagicImpact();
        this.particleManager.addMagicImpact(hit.x, hit.y);
        this.particleManager.addDamageText(hit.x, hit.y, `-${Math.round(hit.damage)}`, '#c084fc');
      } else {
        soundManager.playHit();
        this.particleManager.addArrowHit(hit.x, hit.y);
        this.particleManager.addDamageText(hit.x, hit.y, `-${Math.round(hit.damage)}`, '#f87171');
      }

      // Check kills caused by projectile
      if (hit.killedEnemies.length > 0) {
        this.gold += hit.totalGoldEarned;
        this.stats.goldEarned += hit.totalGoldEarned;
        this.stats.enemiesKilled += hit.killedEnemies.length;

        for (const deadEnemy of hit.killedEnemies) {
          this.particleManager.addDeathPoof(deadEnemy.x, deadEnemy.y, deadEnemy.color);
          this.particleManager.addGoldText(deadEnemy.x, deadEnemy.y, deadEnemy.goldReward);
        }

        soundManager.playEnemyDeath();
        soundManager.playGold();
      }
    }

    // 4. Update Particles
    this.particleManager.update(dt);

    // 5. Check Wave Completion (only if base is still alive)
    if (
      this.baseHp > 0 &&
      this.gameStatus === 'WAVE_ACTIVE' &&
      this.enemyManager.isWaveFinished()
    ) {
      const currentWaveConfig = WAVES.find((w) => w.waveNumber === this.currentWave);
      const bonus = currentWaveConfig ? currentWaveConfig.bonusReward : 25;

      this.gold += bonus;
      this.stats.goldEarned += bonus;
      this.stats.wavesCleared++;
      soundManager.playGold();

      if (this.currentWave >= this.totalWaves) {
        this.gameStatus = 'VICTORY';
        soundManager.playVictory();
        this.notifyToast(`Chúc mừng! Bạn đã hoàn thành toàn bộ ${this.totalWaves} đợt quái và bảo vệ căn cứ thành công!`, 'success');
      } else {
        this.gameStatus = 'WAVE_COMPLETED';
        this.notifyToast(`Hoàn thành Đợt ${this.currentWave}! Thưởng hoàn thành: +${bonus} Vàng`, 'success');
      }
      this.broadcastState(true);
    }
  }
}
