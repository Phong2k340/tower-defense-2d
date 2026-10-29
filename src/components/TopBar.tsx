import React from 'react';
import {
  Heart,
  Coins,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Flame,
} from 'lucide-react';
import { UIStateSnapshot } from '../engine/GameEngine';

interface TopBarProps {
  state: UIStateSnapshot;
  onTogglePause: () => void;
  onSetSpeed: (speed: 1 | 2 | 4) => void;
  onToggleSound: () => void;
  onRestart: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  onTogglePause,
  onSetSpeed,
  onToggleSound,
  onRestart,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (state.baseHp / state.maxBaseHp) * 100));
  const isPaused = state.gameStatus === 'PAUSED';

  return (
    <header className="topbar-container">
      {/* Brand / Game Title */}
      <div className="topbar-brand">
        <Flame className="brand-icon" size={22} />
        <div>
          <h1 className="brand-title">FANTASY DEFENSE</h1>
          <span className="brand-subtitle">Vương Quốc Phù Thủy</span>
        </div>
      </div>

      {/* Core Stats: HP & Gold */}
      <div className="topbar-stats">
        {/* Base Health */}
        <div className="stat-card stat-hp" title="Máu căn cứ hoàng gia">
          <Heart className="stat-icon heart-icon" size={18} />
          <div className="stat-info">
            <div className="stat-label">CĂN CỨ</div>
            <div className="stat-value">
              {state.baseHp} <span className="stat-max">/ {state.maxBaseHp}</span>
            </div>
            <div className="hp-bar-track">
              <div
                className="hp-bar-fill"
                style={{
                  width: `${hpPercent}%`,
                  backgroundColor:
                    hpPercent < 30 ? '#ef4444' : hpPercent < 60 ? '#f59e0b' : '#22c55e',
                }}
              />
            </div>
          </div>
        </div>

        {/* Gold Coins */}
        <div className="stat-card stat-gold" title="Kho vàng hiện có">
          <Coins className="stat-icon gold-icon" size={20} />
          <div className="stat-info">
            <div className="stat-label">KHO VÀNG</div>
            <div className="stat-value gold-text">{state.gold.toLocaleString()}</div>
          </div>
        </div>

        {/* Wave Status Badge */}
        <div className="stat-card stat-wave" title="Tiến trình đợt quái">
          <ShieldAlert className="stat-icon wave-icon" size={18} />
          <div className="stat-info">
            <div className="stat-label">TIẾN TRÌNH</div>
            <div className="stat-value">
              ĐỢT {state.currentWave}{' '}
              <span className="stat-max">/ {state.totalWaves}</span>
            </div>
          </div>
          {state.enemiesActive > 0 ? (
            <span className="active-enemies-badge">
              {state.enemiesActive} quái
            </span>
          ) : (
            <span className="ready-wave-badge">
              {state.currentWave >= state.totalWaves ? 'Chiến thắng' : 'Sẵn sàng'}
            </span>
          )}
        </div>
      </div>

      {/* Controls: Speed, Pause, Sound, Restart */}
      <div className="topbar-controls">
        {/* Speed Controls */}
        <div className="speed-toggle-group">
          <button
            className={`btn-speed ${state.gameSpeed === 1 ? 'active' : ''}`}
            onClick={() => onSetSpeed(1)}
            title="Tốc độ bình thường (1x)"
          >
            1x
          </button>
          <button
            className={`btn-speed ${state.gameSpeed === 2 ? 'active' : ''}`}
            onClick={() => onSetSpeed(2)}
            title="Tốc độ nhanh (2x)"
          >
            <FastForward size={13} /> 2x
          </button>
          <button
            className={`btn-speed ${state.gameSpeed === 4 ? 'active' : ''}`}
            onClick={() => onSetSpeed(4)}
            title="Tốc độ siêu nhanh (4x)"
          >
            4x
          </button>
        </div>

        {/* Pause Button */}
        <button
          className={`btn-icon ${isPaused ? 'btn-active' : ''}`}
          onClick={onTogglePause}
          title={isPaused ? 'Tiếp tục (P)' : 'Tạm dừng (P)'}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>

        {/* Mute Sound Button */}
        <button
          className={`btn-icon ${!state.soundEnabled ? 'btn-muted' : ''}`}
          onClick={onToggleSound}
          title={state.soundEnabled ? 'Tắt âm thanh (M)' : 'Bật âm thanh (M)'}
        >
          {state.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Restart Button */}
        <button
          className="btn-icon btn-restart"
          onClick={() => {
            if (window.confirm('Khởi tạo lại ván chơi mới từ đầu?')) {
              onRestart();
            }
          }}
          title="Chơi lại từ đầu (R)"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
};
