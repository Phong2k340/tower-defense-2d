import { MAP_CONFIG, PATH_WAYPOINTS } from '../config/gameConfig';
import { Point, Tower } from '../types/game';
import { distance, distanceToSegment } from '../utils/math';

export interface PlacementCheckResult {
  valid: boolean;
  reason?: string;
}

export class MapManager {
  public waypoints: Point[];
  public segmentLengths: number[] = [];
  public totalPathLength: number = 0;

  constructor(waypoints: Point[] = PATH_WAYPOINTS) {
    this.waypoints = waypoints;
    this.calculatePathMetrics();
  }

  private calculatePathMetrics() {
    this.segmentLengths = [];
    this.totalPathLength = 0;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const segLen = distance(this.waypoints[i], this.waypoints[i + 1]);
      this.segmentLengths.push(segLen);
      this.totalPathLength += segLen;
    }
  }

  /**
   * Snaps a mouse coordinate to the center of a grid cell.
   */
  public snapToGrid(rawX: number, rawY: number): { x: number; y: number; gridX: number; gridY: number } {
    const cellSize = MAP_CONFIG.cellSize;
    const gridX = Math.floor(rawX / cellSize);
    const gridY = Math.floor(rawY / cellSize);
    const x = gridX * cellSize + cellSize / 2;
    const y = gridY * cellSize + cellSize / 2;
    return { x, y, gridX, gridY };
  }

  /**
   * Validates if a tower can be placed at (x, y).
   */
  public validatePlacement(x: number, y: number, existingTowers: Tower[]): PlacementCheckResult {
    // 1. Boundary check
    const margin = 20;
    if (
      x < margin ||
      x > MAP_CONFIG.width - margin ||
      y < margin ||
      y > MAP_CONFIG.height - margin
    ) {
      return { valid: false, reason: 'Vị trí nằm ngoài phạm vi bản đồ!' };
    }

    // 2. Check collision with path segments
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const p1 = this.waypoints[i];
      const p2 = this.waypoints[i + 1];
      const dist = distanceToSegment({ x, y }, p1, p2);

      if (dist < MAP_CONFIG.pathDistanceMargin) {
        return { valid: false, reason: 'Không thể xây trụ trên đường đi của kẻ địch!' };
      }
    }

    // 3. Check collision with existing towers
    for (const tower of existingTowers) {
      const dist = distance({ x, y }, { x: tower.x, y: tower.y });
      if (dist < MAP_CONFIG.minTowerDistance) {
        return { valid: false, reason: 'Vị trí đã có trụ hoặc quá gần trụ khác!' };
      }
    }

    return { valid: true };
  }
}

export const defaultMapManager = new MapManager();

