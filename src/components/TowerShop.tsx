import React from 'react';
import { Crosshair, Bomb, Sparkles, X, Coins, Zap } from 'lucide-react';
import { MAP_CONFIG, TOWER_CONFIGS } from '../config/gameConfig';
import { TowerType } from '../types/game';

interface TowerShopProps {
  currentGold: number;
  buildingType: TowerType | null;
  onSelectTowerType: (type: TowerType | null) => void;
  onHoverTowerType?: (type: TowerType | null) => void;
}

export const TowerShop: React.FC<TowerShopProps> = ({
  currentGold,
  buildingType,
  onSelectTowerType,
  onHoverTowerType,
}) => {
  const towers = Object.values(TOWER_CONFIGS);

  const getTowerIcon = (type: TowerType) => {
    switch (type) {
      case 'archer':
        return <Crosshair size={20} className="tower-icon-archer" />;
      case 'cannon':
        return <Bomb size={20} className="tower-icon-cannon" />;
      case 'magic':
        return <Sparkles size={20} className="tower-icon-magic" />;
    }
  };

  const getTowerHotkey = (type: TowerType) => {
    switch (type) {
      case 'archer':
        return '1';
      case 'cannon':
        return '2';
      case 'magic':
        return '3';
    }
  };

  return (
    <div className="tower-shop-container">
      <div className="shop-header">
        <div className="shop-title-group">
          <h3 className="shop-title">CÔNG TRÌNH PHÒNG THỦ</h3>
          <span className="shop-hint">Nhấn [1], [2], [3] hoặc chọn thẻ</span>
        </div>
        {buildingType && (
          <button
            className="btn-cancel-build"
            onClick={() => onSelectTowerType(null)}
            title="Hủy đặt trụ (Phím Esc)"
          >
            <X size={14} /> Hủy đặt [Esc]
          </button>
        )}
      </div>

      <div className="shop-grid">
        {towers.map((cfg) => {
          const isSelected = buildingType === cfg.type;
          const canAfford = currentGold >= cfg.baseCost;
          const hotkey = getTowerHotkey(cfg.type);
          const dps = (cfg.baseDamage * cfg.baseAttackSpeed).toFixed(1);
          const rangeTiles = (cfg.baseRange / MAP_CONFIG.cellSize).toFixed(1);

          return (
            <div
              key={cfg.type}
              className={`shop-card ${isSelected ? 'selected' : ''} ${
                !canAfford ? 'unaffordable' : ''
              }`}
              onClick={() => onSelectTowerType(isSelected ? null : cfg.type)}
              onMouseEnter={() => onHoverTowerType?.(cfg.type)}
              onMouseLeave={() => onHoverTowerType?.(null)}
              title={
                canAfford
                  ? `Nhấp hoặc ấn phím [${hotkey}] để đặt ${cfg.name}`
                  : `Cần thêm ${cfg.baseCost - currentGold} Vàng`
              }
            >
              {/* Hotkey Tag */}
              <span className="hotkey-badge">[{hotkey}]</span>

              {/* Card Top: Icon, Name & Cost */}
              <div className="card-top">
                <div className={`card-icon-wrapper ${cfg.type}-glow`}>
                  {getTowerIcon(cfg.type)}
                </div>
                <div className="card-heading">
                  <h4 className="card-name">{cfg.name}</h4>
                  <div className="card-cost">
                    <Coins size={13} className="gold-icon" />
                    <span>{cfg.baseCost} Vàng</span>
                  </div>
                </div>
              </div>

              {/* Stats & DPS Highlight */}
              <div className="card-stats">
                <div className="stat-row dps-row">
                  <span className="stat-name">
                    <Zap size={12} className="stat-icon-dmg" /> Hiệu năng DPS:
                  </span>
                  <span className="stat-val dps-val">{dps}/s</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Tầm bắn:</span>
                  <span className="stat-val">
                    {rangeTiles} ô <small>({cfg.baseRange}px)</small>
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Sát thương:</span>
                  <span className="stat-val">{cfg.baseDamage} ({cfg.baseAttackSpeed}/s)</span>
                </div>
                {cfg.splashRadius > 0 && (
                  <div className="stat-row special-stat">
                    <span className="stat-name">Nổ lan AoE:</span>
                    <span className="stat-val">Bán kính {cfg.splashRadius}px</span>
                  </div>
                )}
                {cfg.type === 'magic' && (
                  <div className="stat-row special-stat">
                    <span className="stat-name">Hiệu ứng:</span>
                    <span className="stat-val">Làm chậm 35%</span>
                  </div>
                )}
              </div>

              <button
                className={`btn btn-build-action ${
                  isSelected ? 'btn-active-build' : canAfford ? 'btn-can-build' : 'btn-disabled'
                }`}
              >
                {isSelected ? 'Đang chọn vị trí...' : canAfford ? 'Xây dựng' : 'Thiếu vàng'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
