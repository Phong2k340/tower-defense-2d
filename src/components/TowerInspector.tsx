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
import { MAP_CONFIG, TOWER_CONFIGS } from '../config/gameConfig';
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

  const currentDps = (tower.damage * tower.attackSpeed).toFixed(1);
  const nextDps = upgradeData ? (upgradeData.damage * upgradeData.attackSpeed).toFixed(1) : null;

  const currentRangeTiles = (tower.range / MAP_CONFIG.cellSize).toFixed(1);
  const nextRangeTiles = upgradeData ? (upgradeData.range / MAP_CONFIG.cellSize).toFixed(1) : null;

  const strategies: { value: TargetStrategy; label: string }[] = [
    { value: 'first', label: 'Đi đầu tiên' },
    { value: 'last', label: 'Đi sau cùng' },
    { value: 'closest', label: 'Gần trụ nhất' },
    { value: 'strongest', label: 'Máu cao nhất' },
    { value: 'weakest', label: 'Máu thấp nhất' },
  ];

  return (
    <div className="inspector-panel pop-in">
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

      {/* Stats Summary with DPS */}
      <div className="inspector-stats-grid">
        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Zap size={13} className="stat-icon-dmg" />
            <span>Hiệu năng DPS</span>
          </div>
          <span className="stat-number dps-highlight">{currentDps}/s</span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Crosshair size={13} className="stat-icon-rng" />
            <span>Tầm bắn</span>
          </div>
          <span className="stat-number">{currentRangeTiles} ô <small>({tower.range}px)</small></span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Activity size={13} className="stat-icon-spd" />
            <span>Sát thương / Tốc</span>
          </div>
          <span className="stat-number">{tower.damage} <small>({tower.attackSpeed}/s)</small></span>
        </div>

        <div className="inspector-stat">
          <div className="stat-icon-label">
            <Shield size={13} className="stat-icon-kls" />
            <span>Kẻ địch hạ</span>
          </div>
          <span className="stat-number">{tower.kills} quái</span>
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
              Hiệu năng DPS: <span className="old-val">{currentDps}/s</span> →{' '}
              <span className="new-val">{nextDps}/s</span>
            </div>
            <div className="preview-stat">
              Sát thương: <span className="old-val">{tower.damage}</span> →{' '}
              <span className="new-val">{upgradeData.damage}</span>
            </div>
            <div className="preview-stat">
              Tầm bắn: <span className="old-val">{currentRangeTiles} ô</span> →{' '}
              <span className="new-val">{nextRangeTiles} ô ({upgradeData.range}px)</span>
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
