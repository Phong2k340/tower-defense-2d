import React from 'react';
import { Play, Swords, Coins, Skull } from 'lucide-react';
import { ENEMY_CONFIGS, WAVES } from '../config/gameConfig';
import { UIStateSnapshot } from '../engine/GameEngine';

interface WaveControlProps {
  state: UIStateSnapshot;
  onStartWave: () => void;
}

export const WaveControl: React.FC<WaveControlProps> = ({ state, onStartWave }) => {
  const nextWaveNum = state.currentWave + 1;
  const nextWaveConfig = WAVES.find((w) => w.waveNumber === nextWaveNum);
  const isWaveActive = state.gameStatus === 'WAVE_ACTIVE';
  const isAllWavesDone = state.currentWave >= state.totalWaves && !isWaveActive;

  return (
    <div className="wave-control-container">
      {isWaveActive ? (
        <div className="wave-status-box active-wave">
          <div className="wave-status-left">
            <Swords className="pulse-icon" size={20} />
            <div>
              <div className="wave-title-text">ĐỢT {state.currentWave} ĐANG TIẾN CÔNG!</div>
              <div className="wave-subtitle-text">
                Kẻ địch còn lại: <span className="highlight-count">{state.enemiesActive}</span>
              </div>
            </div>
          </div>
        </div>
      ) : isAllWavesDone ? (
        <div className="wave-status-box completed-wave">
          <div className="wave-title-text">★ BẢO VỆ VƯƠNG QUỐC THÀNH CÔNG ★</div>
          <div className="wave-subtitle-text">Tất cả đợt quái đã bị quét sạch!</div>
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

            {/* List of enemies in next wave */}
            <div className="next-enemy-types">
              {nextWaveConfig?.groups.map((grp, idx) => {
                const cfg = ENEMY_CONFIGS[grp.enemyType];
                return (
                  <span key={idx} className="enemy-preview-badge">
                    <Skull size={12} style={{ color: cfg.color }} />
                    <span>
                      {grp.count}x {cfg.name}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-primary btn-call-wave pulse-glow"
            onClick={onStartWave}
            title="Bắt đầu đợt quái (Phím Space)"
          >
            <Play size={18} fill="currentColor" />
            <span>XUẤT TRẬN [Space]</span>
          </button>
        </div>
      )}
    </div>
  );
};

