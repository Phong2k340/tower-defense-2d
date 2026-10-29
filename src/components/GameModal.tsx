import React from 'react';
import { Trophy, Skull, RotateCcw, Swords, Coins, Zap, Shield } from 'lucide-react';
import { UIStateSnapshot } from '../engine/GameEngine';

interface GameModalProps {
  state: UIStateSnapshot;
  onRestart: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ state, onRestart }) => {
  const isVictory = state.gameStatus === 'VICTORY';
  const isGameOver = state.gameStatus === 'GAME_OVER';

  if (!isVictory && !isGameOver) return null;

  return (
    <div className="modal-backdrop">
      <div className={`modal-card ${isVictory ? 'modal-victory' : 'modal-defeat'} pop-in`}>
        {/* Banner Icon */}
        <div className="modal-icon-badge">
          {isVictory ? (
            <Trophy size={48} className="trophy-glow" />
          ) : (
            <Skull size={48} className="skull-glow" />
          )}
        </div>

        {/* Title */}
        <h2 className="modal-title">
          {isVictory ? 'CHIẾN THẮNG HUY HOÀNG!' : 'CĂN CỨ THẤT THỦ!'}
        </h2>
        <p className="modal-subtitle">
          {isVictory
            ? 'Bạn đã xuất sắc tiêu diệt toàn bộ quân đoàn bóng tối và bảo vệ vương quốc toàn vẹn!'
            : 'Quân đoàn quái vật đã phá vỡ phòng tuyến phòng thủ. Vương quốc cần một chiến lược mới!'}
        </p>

        {/* Battle Summary Statistics */}
        <div className="modal-stats-list">
          <div className="modal-stat-item">
            <div className="stat-meta">
              <Swords size={18} className="meta-icon" />
              <span>Kẻ địch tiêu diệt</span>
            </div>
            <span className="stat-number">{state.stats.enemiesKilled}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-meta">
              <Coins size={18} className="meta-icon gold-icon" />
              <span>Tổng vàng thu được</span>
            </div>
            <span className="stat-number gold-text">{state.stats.goldEarned.toLocaleString()}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-meta">
              <Zap size={18} className="meta-icon" />
              <span>Tổng sát thương gây ra</span>
            </div>
            <span className="stat-number">{Math.round(state.stats.damageDealt).toLocaleString()}</span>
          </div>

          <div className="modal-stat-item">
            <div className="stat-meta">
              <Shield size={18} className="meta-icon" />
              <span>Đợt quái cầm cự</span>
            </div>
            <span className="stat-number">
              {state.currentWave} / {state.totalWaves}
            </span>
          </div>

          {isVictory && (
            <div className="modal-stat-item highlight-hp">
              <div className="stat-meta">
                <span>Máu căn cứ bảo toàn</span>
              </div>
              <span className="stat-number">
                {state.baseHp} / {state.maxBaseHp}
              </span>
            </div>
          )}
        </div>

        {/* Restart Button */}
        <button className="btn btn-primary btn-modal-restart" onClick={onRestart}>
          <RotateCcw size={20} />
          <span>{isVictory ? 'CHƠI LẠI TRẬN MỚI' : 'THỬ SỨC LẠI NGAY'}</span>
        </button>
      </div>
    </div>
  );
};

