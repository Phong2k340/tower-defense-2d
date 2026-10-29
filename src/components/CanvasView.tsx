import React, { useEffect, useRef } from 'react';
import { MAP_CONFIG } from '../config/gameConfig';
import { GameEngine } from '../engine/GameEngine';

interface CanvasViewProps {
  engine: GameEngine;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Attach canvas to engine renderer
    engine.attachCanvas(canvas);

    const setupDPI = () => {
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = MAP_CONFIG.width;
      const logicalHeight = MAP_CONFIG.height;

      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
      }
    };

    setupDPI();
    window.addEventListener('resize', setupDPI);
    return () => {
      window.removeEventListener('resize', setupDPI);
    };
  }, [engine]);

  // Convert client mouse coordinates to game logical coordinates (1000x650)
  const getLogicalCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_CONFIG.width / rect.width;
    const scaleY = MAP_CONFIG.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getLogicalCoords(e);
    engine.handleCanvasClick(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getLogicalCoords(e);
    engine.handleCanvasMouseMove(x, y);
  };

  const handleMouseLeave = () => {
    engine.handleCanvasMouseLeave();
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="battlefield-canvas"
        style={{
          aspectRatio: `${MAP_CONFIG.width} / ${MAP_CONFIG.height}`,
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

