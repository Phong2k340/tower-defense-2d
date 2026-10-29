import React from 'react';
import {
  X,
  ArrowUpCircle,
  Trash2,
  Crosshair,
  Coins,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import { TOWER_CONFIGS } from '../config/gameConfig';
import { TargetStrategy, Tower } from '../types/game';

interface TowerInspectorProps {
  tower: Tower | null;
  currentGold: number;
  onUpgrade: (towerId: string) => void;
  onSell: (towerId: string) => void;
  onSelectStrategy: (towerId: string, strategy: TargetStrategy) => void;
  onClose: () => void;
}

export const TowerInspector: React.FC<TowerInspectorProps> = ({
  tower,
  currentGold,
  onUpgrade,
  onSell,
  onSelectStrategy,
  onClose,
}) => {
  if (!tower) return null;

  const config = TOWER_CONFIGS[tower.type];
  const nextLevel = (tower.level + 1) as 2 | 3;
  const upgradeData = tower.level < 3 ? config.upgrades[nextLevel] : null;
  const canAffordUpgrade = upgradeData ? currentGold >= upgradeData.cost : false;
  const sellValue = Math.floor(tower.totalCost * 0.7);

  const strategies: { value: TargetStrategy; label: string }[] = [
    { value: 'first', label: 'Đi đầu tiên' },
    { value: 'last', label: 'Đi sau cùng' },
    { value: 'closest', label: 'Gần trụ nhất' },
    { value: 'strongest', label: 'Máu cao nhất' },
    { value: 'weakest', label: 'Máu thấp nhất' },
  ];

  return (
    <div className="inspector-panel">
      {/* Panel Header */}
      <div className="inspector-header">
        <div className="inspector-title-group">
          <span className={`level-pill level-${tower.level}`}>Cấp {tower.level}</span>
          <h3 className="inspector-title">{config.name}</h3>
        </div>
        <button className="btn-close-inspector" onClick={onClose} title="Đóng bảng">
          <X size={16} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="inspector-stats-grid">
        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Zap size={14} className="stat-icon-dmg" />
            <span>Sát thương</span>
          </div>
          <span className="stat-number">{tower.damage}</span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Crosshair size={14} className="stat-icon-rng" />
            <span>Tầm bắn</span>
          </div>
          <span className="stat-number">{tower.range}px</span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Activity size={14} className="stat-icon-spd" />
            <span>Tốc bắn</span>
          </div>
          <span className="stat-number">{tower.attackSpeed}/s</span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Shield size={14} className="stat-icon-kls" />
            <span>Kẻ địch hạ</span>
          </div>
          <span className="stat-number">{tower.kills}</span>
        </div>
      </div>

      {/* Target Priority Selector */}
      <div className="inspector-strategy-section">
        <label className="section-label">MỤC TIÊU ƯU TIÊN</label>
        <div className="strategy-buttons">
          {strategies.map((st) => (
            <button
              key={st.value}
              className={`strategy-btn ${tower.targetStrategy === st.value ? 'active' : ''}`}
              onClick={() => onSelectStrategy(tower.id, st.value)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upgrade or Max Level Box */}
      {upgradeData ? (
        <div className="upgrade-box">
          <div className="upgrade-header">
            <span className="upgrade-label">NÂNG CẤP LÊN CẤP {nextLevel}</span>
            <div className="upgrade-cost">
              <Coins size={14} className="gold-icon" />
              <span>{upgradeData.cost} Vàng</span>
            </div>
          </div>

          <div className="upgrade-preview">
            <div className="preview-stat">
              Sát thương: <span className="old-val">{tower.damage}</span> →{' '}
              <span className="new-val">{upgradeData.damage}</span>
            </div>
            <div className="preview-stat">
              Tầm bắn: <span className="old-val">{tower.range}</span> →{' '}
              <span className="new-val">{upgradeData.range}</span>
            </div>
            <div className="preview-stat">
              Tốc bắn: <span className="old-val">{tower.attackSpeed}/s</span> →{' '}
              <span className="new-val">{upgradeData.attackSpeed}/s</span>
            </div>
          </div>

          <p className="special-desc">{upgradeData.specialDesc}</p>

          <button
            className={`btn btn-upgrade ${canAffordUpgrade ? 'can-upgrade' : 'cant-upgrade'}`}
            disabled={!canAffordUpgrade}
            onClick={() => onUpgrade(tower.id)}
          >
            <ArrowUpCircle size={16} />
            {canAffordUpgrade ? `Nâng cấp (+${upgradeData.cost} Vàng)` : 'Không đủ vàng'}
          </button>
        </div>
      ) : (
        <div className="max-level-box">
          <div className="max-badge">★ ĐÃ ĐẠT CẤP TỐI ĐA (CẤP 3) ★</div>
          <p className="max-desc">Trụ đã đạt trạng thái sức mạnh hoàng gia tối thượng.</p>
        </div>
      )}

      {/* Sell Button */}
      <button className="btn btn-sell" onClick={() => onSell(tower.id)}>
        <Trash2 size={16} />
        <span>Bán trụ (Thu hồi +{sellValue} Vàng)</span>
      </button>
    </div>
  );
};

