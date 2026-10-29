import React, { useState } from 'react';
import { Play, Swords, Coins, Skull, Zap, Shield, Heart } from 'lucide-react';
import { ENEMY_CONFIGS, WAVES } from '../config/gameConfig';
import { EnemyType } from '../types/game';
import { UIStateSnapshot } from '../engine/GameEngine';

interface WaveControlProps {
  state: UIStateSnapshot;
  onStartWave: () => void;
}

export const WaveControl: React.FC<WaveControlProps> = ({ state, onStartWave }) => {
  const [hoveredEnemy, setHoveredEnemy] = useState<EnemyType | null>(null);

  const nextWaveNum = state.currentWave + 1;
  const nextWaveConfig = WAVES.find((w) => w.waveNumber === nextWaveNum);
  const isWaveActive = state.gameStatus === 'WAVE_ACTIVE';
  const isAllWavesDone = state.currentWave >= state.totalWaves && !isWaveActive;
  const canStartWave = (state.gameStatus === 'IDLE' || state.gameStatus === 'WAVE_COMPLETED') && !isAllWavesDone;

  const hoveredConfig = hoveredEnemy ? ENEMY_CONFIGS[hoveredEnemy] : null;

  return (
    <div className="wave-control-container">
      {isWaveActive ? (
        <div className="wave-status-box active-wave">
          <div className="wave-status-left">
            <Swords className="pulse-icon" size={20} />
            <div>
              <div className="wave-title-text">
                ĐỢT {state.currentWave} ĐANG TIẾN CÔNG!
              </div>
              <div className="wave-subtitle-text">
                Kẻ địch còn sống: <span className="highlight-count">{state.enemiesActive}</span>
              </div>
            </div>
          </div>
          <div className="wave-in-progress-badge">
            <span className="dot-flashing" />
            <span>Đang giao chiến...</span>
          </div>
        </div>
      ) : isAllWavesDone ? (
        <div className="wave-status-box completed-wave">
          <div className="wave-title-text">★ BẢO VỆ VƯƠNG QUỐC THÀNH CÔNG ★</div>
          <div className="wave-subtitle-text">Toàn bộ 10 đợt quái đã bị quét sạch!</div>
        </div>
      ) : (
        <div className="wave-status-box next-wave-ready">
          <div className="next-wave-info">
            <div className="next-wave-header">
              <span className="next-tag">KẾ TIẾP</span>
              <span className="next-title">{nextWaveConfig?.name || `Đợt ${nextWaveNum}`}</span>
              <span className="reward-tag">
                <Coins size={13} className="gold-icon" /> +{nextWaveConfig?.bonusReward || 25} Vàng
              </span>
            </div>

            {/* List of enemies in next wave with interactive tooltips */}
            <div className="next-enemy-types">
              {nextWaveConfig?.groups.map((grp, idx) => {
                const cfg = ENEMY_CONFIGS[grp.enemyType];
                return (
                  <div
                    key={idx}
                    className="enemy-preview-wrapper"
                    onMouseEnter={() => setHoveredEnemy(grp.enemyType)}
                    onMouseLeave={() => setHoveredEnemy(null)}
                  >
                    <span className="enemy-preview-badge">
                      <Skull size={13} style={{ color: cfg.color }} />
                      <span className="enemy-name-text">
                        {grp.count}x {cfg.name}
                      </span>
                    </span>

                    {/* Rich Enemy Stats Popover */}
                    {hoveredEnemy === grp.enemyType && hoveredConfig && (
                      <div className="enemy-tooltip-card pop-in">
                        <div className="tooltip-header">
                          <Skull size={15} style={{ color: hoveredConfig.color }} />
                          <span className="tooltip-title">{hoveredConfig.name}</span>
                        </div>
                        <div className="tooltip-stats">
                          <div className="t-stat">
                            <Heart size={12} className="heart-icon" />
                            <span>Máu: <strong>{hoveredConfig.hp} HP</strong></span>
                          </div>
                          <div className="t-stat">
                            <Zap size={12} className="stat-icon-spd" />
                            <span>Tốc độ: <strong>{hoveredConfig.speed} px/s</strong></span>
                          </div>
                          <div className="t-stat">
                            <Coins size={12} className="gold-icon" />
                            <span>Thưởng: <strong>+{hoveredConfig.goldReward} Vàng</strong></span>
                          </div>
                          <div className="t-stat">
                            <Shield size={12} className="stat-icon-dmg" />
                            <span>Sát thương căn cứ: <strong>-{hoveredConfig.livesDeducted} Máu</strong></span>
                          </div>
                        </div>
                        <p className="tooltip-desc">{hoveredConfig.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button (The single unified start wave button) */}
          <button
            className={`btn btn-primary btn-call-wave ${canStartWave ? 'pulse-glow' : 'btn-disabled'}`}
            onClick={onStartWave}
            disabled={!canStartWave}
            title="Bắt đầu đợt quái tiếp theo (Phím Space)"
          >
            <Play size={18} fill="currentColor" />
            <span>XUẤT TRẬN [SPACE]</span>
          </button>
        </div>
      )}
    </div>
  );
};
