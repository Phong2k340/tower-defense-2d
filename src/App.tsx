import React, { useEffect, useMemo, useState } from 'react';
import { GameEngine, UIStateSnapshot } from './engine/GameEngine';
import { TopBar } from './components/TopBar';
import { CanvasView } from './components/CanvasView';
import { TowerShop } from './components/TowerShop';
import { TowerInspector } from './components/TowerInspector';
import { WaveControl } from './components/WaveControl';
import { GameModal } from './components/GameModal';
import { NotificationToast } from './components/NotificationToast';
import './App.css';

export const App: React.FC = () => {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState<UIStateSnapshot>(() => engine.getSnapshot());

  useEffect(() => {
    // Start game loop
    engine.start();

    // Subscribe to state updates
    const unsubscribe = engine.subscribeState((snap) => {
      setGameState(snap);
    });

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts if typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case '1':
          engine.selectTowerTypeToBuild(
            engine.buildingTowerType === 'archer' ? null : 'archer'
          );
          break;
        case '2':
          engine.selectTowerTypeToBuild(
            engine.buildingTowerType === 'cannon' ? null : 'cannon'
          );
          break;
        case '3':
          engine.selectTowerTypeToBuild(
            engine.buildingTowerType === 'magic' ? null : 'magic'
          );
          break;
        case 'Escape':
          if (engine.buildingTowerType) {
            engine.selectTowerTypeToBuild(null);
          } else if (engine.towerManager.selectedTowerId) {
            engine.selectTower(null);
          }
          break;
        case ' ':
          e.preventDefault();
          engine.startNextWave();
          break;
        case 'p':
        case 'P':
          engine.togglePause();
          break;
        case 'm':
        case 'M':
          engine.toggleSound();
          break;
        case 'r':
        case 'R':
          if (window.confirm('Khởi tạo lại ván chơi mới?')) {
            engine.restart();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
      engine.destroy();
    };
  }, [engine]);

  return (
    <div className="game-app-root">
      {/* Top Header Bar */}
      <TopBar
        state={gameState}
        onTogglePause={() => engine.togglePause()}
        onSetSpeed={(speed) => engine.setSpeed(speed)}
        onToggleSound={() => engine.toggleSound()}
        onRestart={() => engine.restart()}
        onStartWave={() => engine.startNextWave()}
      />

      {/* Main Game Stage */}
      <main className="game-stage">
        {/* Wave Announcement & Action Bar */}
        <WaveControl state={gameState} onStartWave={() => engine.startNextWave()} />

        {/* Battlefield Canvas Area */}
        <div className="battlefield-container">
          <CanvasView engine={engine} />

          {/* Tower Inspector Sidebar/Overlay */}
          {gameState.selectedTower && (
            <div className="inspector-overlay-wrapper">
              <TowerInspector
                tower={gameState.selectedTower}
                currentGold={gameState.gold}
                onUpgrade={(id) => engine.upgradeTower(id)}
                onSell={(id) => engine.sellTower(id)}
                onSelectStrategy={(id, st) => engine.setTowerTargetStrategy(id, st)}
                onClose={() => engine.selectTower(null)}
              />
            </div>
          )}
        </div>

        {/* Tower Recruitment Shop */}
        <TowerShop
          currentGold={gameState.gold}
          buildingType={gameState.buildingTowerType}
          onSelectTowerType={(type) => engine.selectTowerTypeToBuild(type)}
        />
      </main>

      {/* Floating System Toasts */}
      <NotificationToast engine={engine} />

      {/* Victory / Defeat Modal */}
      <GameModal state={gameState} onRestart={() => engine.restart()} />
    </div>
  );
};

export default App;

