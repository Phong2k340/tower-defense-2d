import { MAP_CONFIG, TACTICAL_BUILD_NODES, TOWER_CONFIGS } from '../config/gameConfig';
import { Enemy, Particle, Point, Projectile, Tower, TowerType } from '../types/game';
import { angleBetween } from '../utils/math';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public updateTime(dt: number) {
    this.animTimer += dt;
  }

  public render(
    waypoints: Point[],
    towers: Tower[],
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    selectedTower: Tower | null,
    hoverBuild: { type: TowerType; x: number; y: number; valid: boolean } | null,
    hoverPreviewRangeType: TowerType | null = null
  ) {
    const ctx = this.ctx;
    const w = MAP_CONFIG.width;
    const h = MAP_CONFIG.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Terrain & Map Background
    this.drawTerrain(w, h);

    // 2. Tactical Build Pedestals (Bệ đá đặt tháp chiến thuật)
    this.drawTacticalBuildNodes(towers, hoverBuild !== null || hoverPreviewRangeType !== null);

    // 3. Pathway with borders and cobblestones
    this.drawPath(waypoints);

    // 4. Portals / Spawn & Base Citadel
    this.drawPortals(waypoints);

    // 5. Tower range indicator for selected tower
    if (selectedTower) {
      this.drawTowerRange(selectedTower.x, selectedTower.y, selectedTower.range, '#38bdf8', true);
    }

    // 6. Hover Preview Range (when hovering tower card in shop)
    if (!hoverBuild && hoverPreviewRangeType && !selectedTower) {
      const cfg = TOWER_CONFIGS[hoverPreviewRangeType];
      // Draw preview range in center or strategic node
      this.drawTowerRange(385, 320, cfg.baseRange, cfg.color, false, `Tầm: ${(cfg.baseRange / 50).toFixed(1)} ô`);
    }

    // 7. Towers
    for (const tower of towers) {
      this.drawTower(tower, selectedTower?.id === tower.id);
    }

    // 8. Enemies
    for (const enemy of enemies) {
      this.drawEnemy(enemy);
    }

    // 9. Projectiles
    for (const proj of projectiles) {
      this.drawProjectile(proj);
    }

    // 10. Particles (Explosions, Texts, Sparks)
    for (const part of particles) {
      this.drawParticle(part);
    }

    // 11. Hover Placement Ghost
    if (hoverBuild) {
      this.drawHoverGhost(hoverBuild);
    }
  }

  private drawTerrain(w: number, h: number) {
    const ctx = this.ctx;

    // Deep tactical grass gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#112217'); // Rich deep forest moss
    bgGrad.addColorStop(0.5, '#0c1a12');
    bgGrad.addColorStop(1, '#08120c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle tactical grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const cellSize = MAP_CONFIG.cellSize;

    ctx.beginPath();
    for (let x = 0; x <= w; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  /**
   * Draws designated tactical stone platforms (Bệ đá đặt tháp)
   * High contrast, rune circles, pulsing indicators when in build mode or early game.
   */
  private drawTacticalBuildNodes(towers: Tower[], isBuildMode: boolean) {
    const ctx = this.ctx;

    for (const node of TACTICAL_BUILD_NODES) {
      // Check if a tower is already occupying this node
      const hasTower = towers.some((t) => {
        const dx = t.x - node.x;
        const dy = t.y - node.y;
        return dx * dx + dy * dy < 22 * 22;
      });

      ctx.save();

      // Pedestal Ground Shadow
      ctx.beginPath();
      ctx.ellipse(node.x + 2, node.y + 4, 25, 17, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();

      // Octagonal Carved Stone Base (high contrast slate)
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const px = node.x + Math.cos(angle) * 22;
        const py = node.y + Math.sin(angle) * 17;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Beveled stone gradient
      const stoneGrad = ctx.createRadialGradient(
        node.x - 4,
        node.y - 4,
        2,
        node.x,
        node.y,
        22
      );
      stoneGrad.addColorStop(0, hasTower ? '#334155' : '#475569');
      stoneGrad.addColorStop(0.8, hasTower ? '#1e293b' : '#334155');
      stoneGrad.addColorStop(1, hasTower ? '#0f172a' : '#1e293b');
      ctx.fillStyle = stoneGrad;
      ctx.fill();

      // Stone border
      ctx.strokeStyle = hasTower ? '#475569' : '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner tactical runic circle
      ctx.strokeStyle = hasTower
        ? 'rgba(71, 85, 105, 0.4)'
        : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      // If unoccupied, show glowing visual invitation to place tower
      if (!hasTower) {
        const pulse = Math.sin(this.animTimer * 4) * 0.3 + 0.7;
        const ringRadius = 24 + Math.sin(this.animTimer * 3) * 2;

        if (isBuildMode || towers.length === 0) {
          // Animated dashed beacon ring
          ctx.strokeStyle = `rgba(56, 189, 248, ${pulse * 0.85})`;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Center "+" tactical build icon
        ctx.strokeStyle = `rgba(250, 204, 21, ${pulse * 0.95})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(node.x - 5, node.y);
        ctx.lineTo(node.x + 5, node.y);
        ctx.moveTo(node.x, node.y - 5);
        ctx.lineTo(node.x, node.y + 5);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawPath(waypoints: Point[]) {
    if (waypoints.length < 2) return;
    const ctx = this.ctx;
    const pathWidth = MAP_CONFIG.pathWidth;

    ctx.save();

    // 1. Path outer dirt embankment
    ctx.lineWidth = pathWidth + 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#292017'; // Dark earth border
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.stroke();

    // 2. Stone path surface
    ctx.lineWidth = pathWidth;
    ctx.strokeStyle = '#443a2b'; // Worn stone roadway
    ctx.stroke();

    // 3. Inner worn track
    ctx.lineWidth = pathWidth - 14;
    ctx.strokeStyle = '#5a4f3d';
    ctx.stroke();

    // 4. Cobblestone texture / pavers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 14]);
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.stroke();

    // 5. Pulsing path direction arrows
    const dashOffset = -this.animTimer * 28;
    ctx.setLineDash([4, 28]);
    ctx.lineDashOffset = dashOffset;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)'; // Amber guide pips
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  private drawPortals(waypoints: Point[]) {
    const ctx = this.ctx;
    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];

    // Spawn Portal: Dark Void / Goblin Gate (left)
    ctx.save();
    const portalX = Math.max(25, start.x);
    const portalY = start.y;

    // Glowing aura
    const portalGrad = ctx.createRadialGradient(portalX, portalY, 5, portalX, portalY, 38);
    portalGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
    portalGrad.addColorStop(0.6, 'rgba(126, 34, 206, 0.4)');
    portalGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(portalX, portalY, 38, 0, Math.PI * 2);
    ctx.fill();

    // Runic stone pillars
    ctx.fillStyle = '#262626';
    ctx.fillRect(portalX - 12, portalY - 26, 8, 52);
    ctx.fillRect(portalX + 4, portalY - 26, 8, 52);

    // Swirling vortex
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(portalX, portalY, 14, 24, this.animTimer * 2, 0, Math.PI * 2);
    ctx.stroke();

    // Base: Player Citadel / Castle Gate (right)
    const baseGateX = Math.min(MAP_CONFIG.width - 25, end.x);
    const baseGateY = end.y;

    // Fortress Bastion
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(baseGateX - 22, baseGateY - 35, 44, 70);
    ctx.fill();
    ctx.stroke();

    // Battlements
    ctx.fillStyle = '#475569';
    for (let by = baseGateY - 35; by <= baseGateY + 25; by += 16) {
      ctx.fillRect(baseGateX - 26, by, 7, 10);
    }

    // Shield crest banner
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(baseGateX - 8, baseGateY - 14);
    ctx.lineTo(baseGateX + 8, baseGateY - 14);
    ctx.lineTo(baseGateX + 8, baseGateY + 6);
    ctx.lineTo(baseGateX, baseGateY + 14);
    ctx.lineTo(baseGateX - 8, baseGateY + 6);
    ctx.closePath();
    ctx.fill();

    // Core crystal / beacon light
    const pulse = Math.sin(this.animTimer * 4) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.beginPath();
    ctx.arc(baseGateX, baseGateY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public drawTowerRange(
    x: number,
    y: number,
    range: number,
    color: string,
    isSelected: boolean = false,
    label?: string
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Soft glowing range fill
    const grad = ctx.createRadialGradient(x, y, 0, x, y, range);
    grad.addColorStop(0, `${color}08`);
    grad.addColorStop(0.85, `${color}18`);
    grad.addColorStop(1, `${color}33`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.fill();

    // Animated dashed outline
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -this.animTimer * 15;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.stroke();

    // Display range label in tile units
    const tiles = (range / MAP_CONFIG.cellSize).toFixed(1);
    const rangeText = label || `Tầm bắn: ${tiles} ô (${range}px)`;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(rangeText, x - 50 + 1, y - range - 8 + 1);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(rangeText, x - 50, y - range - 8);

    ctx.restore();
  }

  private drawTower(tower: Tower, isSelected: boolean) {
    const ctx = this.ctx;
    const { x, y, type, level, rotation, lastFireTime } = tower;

    ctx.save();

    // Shadow underneath tower
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 4, 22, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Recoil offset
    const timeSinceFire = (Date.now() - lastFireTime) / 1000;
    const recoil = timeSinceFire < 0.15 ? (1 - timeSinceFire / 0.15) * 5 : 0;

    // Draw specific tower type
    if (type === 'archer') {
      this.drawArcherTower(x, y, level, rotation, recoil);
    } else if (type === 'cannon') {
      this.drawCannonTower(x, y, level, rotation, recoil);
    } else if (type === 'magic') {
      this.drawMagicTower(x, y, level, rotation);
    }

    // Level Badges / Pips
    this.drawLevelBadge(x, y + 16, level);

    // Selection ring
    if (isSelected) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawArcherTower(x: number, y: number, level: number, rotation: number, recoil: number) {
    const ctx = this.ctx;

    // 1. Stone foundation
    ctx.fillStyle = level === 3 ? '#1e293b' : level === 2 ? '#334155' : '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wooden deck
    ctx.fillStyle = level === 3 ? '#92400e' : '#b45309';
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Archer & Bow
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.translate(-recoil, 0);

    // Archer figure
    ctx.fillStyle = level === 3 ? '#0284c7' : '#0369a1';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Bow
    ctx.strokeStyle = level === 3 ? '#38bdf8' : '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(10, 0, 10, -Math.PI / 2.5, Math.PI / 2.5);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10 + Math.cos(-Math.PI / 2.5) * 10, Math.sin(-Math.PI / 2.5) * 10);
    ctx.lineTo(recoil > 1 ? 5 : 8, 0);
    ctx.lineTo(10 + Math.cos(Math.PI / 2.5) * 10, Math.sin(Math.PI / 2.5) * 10);
    ctx.stroke();

    // Arrow ready
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(recoil > 1 ? 4 : 7, 0);
    ctx.lineTo(19, 0);
    ctx.stroke();

    ctx.restore();
  }

  private drawCannonTower(x: number, y: number, level: number, rotation: number, recoil: number) {
    const ctx = this.ctx;

    // Heavy iron hexagonal base
    ctx.fillStyle = level === 3 ? '#451a03' : level === 2 ? '#292524' : '#3f3f46';
    ctx.strokeStyle = level === 3 ? '#ea580c' : '#18181b';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const bx = x + Math.cos(angle) * 20;
      const by = y + Math.sin(angle) * 20;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Turntable center
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Cannon Barrel
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.translate(-recoil, 0);

    if (level === 1) {
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.fillRect(0, -6, 22, 12);
      ctx.strokeRect(0, -6, 22, 12);

      ctx.fillStyle = '#71717a';
      ctx.fillRect(19, -7, 4, 14);
    } else if (level === 2) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-2, -8, 24, 6);
      ctx.fillRect(-2, 2, 24, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(20, -9, 4, 8);
      ctx.fillRect(20, 1, 4, 8);
    } else {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-4, -10, 27, 6);
      ctx.fillRect(-2, -3, 29, 6);
      ctx.fillRect(-4, 4, 27, 6);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawMagicTower(x: number, y: number, level: number, _rotation: number) {
    const ctx = this.ctx;

    // Dark obsidian pedestal
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Runic circle on ground
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.animTimer * 0.8);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Central pulsing arcane crystal core
    const pulse = Math.sin(this.animTimer * 5) * 2;
    ctx.fillStyle = level === 3 ? '#f43f5e' : level === 2 ? '#c084fc' : '#a855f7';
    ctx.beginPath();
    ctx.arc(x, y, 8 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting satellite crystals
    const count = level === 3 ? 4 : level === 2 ? 3 : 2;
    const orbitDist = 14;

    for (let i = 0; i < count; i++) {
      const angle = this.animTimer * 2.5 + (Math.PI * 2 * i) / count;
      const ox = x + Math.cos(angle) * orbitDist;
      const oy = y + Math.sin(angle) * orbitDist * 0.7;

      ctx.fillStyle = level === 3 ? '#fb7185' : '#e9d5ff';
      ctx.beginPath();
      ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }
  }

  private drawLevelBadge(x: number, y: number, level: number) {
    const ctx = this.ctx;
    ctx.save();

    const starSpacing = 7;
    const startX = x - ((level - 1) * starSpacing) / 2;

    for (let i = 0; i < level; i++) {
      const sx = startX + i * starSpacing;
      ctx.fillStyle = level === 3 ? '#facc15' : level === 2 ? '#38bdf8' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(sx, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawEnemy(enemy: Enemy) {
    const ctx = this.ctx;
    const { x, y, type, radius, currentHp, maxHp, hitFlashTimer, slowTimer, walkCycle } = enemy;

    ctx.save();

    // Ground shadow
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.8, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Slow effect ice aura beneath enemy
    if (slowTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y + radius * 0.6, radius * 1.3, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const bounceY = Math.abs(Math.sin(walkCycle * 2)) * 3;
    const drawY = y - bounceY;

    if (type === 'goblin') {
      this.drawGoblin(x, drawY, radius, hitFlashTimer > 0, walkCycle);
    } else if (type === 'orc') {
      this.drawOrc(x, drawY, radius, hitFlashTimer > 0, walkCycle);
    } else if (type === 'runner') {
      this.drawRunner(x, drawY, radius, hitFlashTimer > 0, walkCycle);
    } else if (type === 'boss') {
      this.drawBoss(x, drawY, radius, hitFlashTimer > 0, walkCycle);
    }

    // Health Bar
    this.drawHealthBar(x, y - radius - 9, currentHp, maxHp, radius * 2.2);

    ctx.restore();
  }

  private drawGoblin(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;
    const legOffset = Math.sin(walk * 2) * 4;
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 4);
    ctx.lineTo(x - 5, y + 10 + legOffset);
    ctx.moveTo(x + 5, y + 4);
    ctx.lineTo(x + 5, y + 10 - legOffset);
    ctx.stroke();

    ctx.fillStyle = isHit ? '#ffffff' : '#22c55e';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isHit ? '#ffffff' : '#16a34a';
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x - r - 6, y - 5);
    ctx.lineTo(x - r + 2, y + 3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + r + 6, y - 5);
    ctx.lineTo(x + r - 2, y + 3);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOrc(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;
    const legOffset = Math.sin(walk * 1.5) * 5;
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 6);
    ctx.lineTo(x - 7, y + 14 + legOffset);
    ctx.moveTo(x + 7, y + 6);
    ctx.lineTo(x + 7, y + 14 - legOffset);
    ctx.stroke();

    ctx.fillStyle = isHit ? '#ffffff' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x - r * 0.7, y - 4, r * 1.4, 9);

    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(x, y - 5, r * 0.85, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - 7);
    ctx.lineTo(x - r * 0.7 - 5, y - 13);
    ctx.moveTo(x + r * 0.7, y - 7);
    ctx.lineTo(x + r * 0.7 + 5, y - 13);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRunner(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.beginPath();
    ctx.arc(x - Math.cos(walk) * 8, y, r * 0.9, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = Math.sin(walk * 3) * 6;
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4);
    ctx.lineTo(x - 4, y + 11 + legOffset);
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 4, y + 11 - legOffset);
    ctx.stroke();

    ctx.fillStyle = isHit ? '#ffffff' : '#eab308';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x, y - r - 4);
    ctx.lineTo(x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 4, y - 2, 8, 3);
  }

  private drawBoss(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 15, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    const legOffset = Math.sin(walk * 1.2) * 6;
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(x - 12, y + 10, 8, 14 + legOffset);
    ctx.fillRect(x + 4, y + 10, 8, 14 - legOffset);

    ctx.fillStyle = isHit ? '#ffffff' : '#831843';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 8);
    ctx.lineTo(x - 2, y + 2);
    ctx.lineTo(x + 12, y - 4);
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 10);
    ctx.lineTo(x - 24, y - 26);
    ctx.lineTo(x - 10, y - 18);
    ctx.lineTo(x, y - 28);
    ctx.lineTo(x + 10, y - 18);
    ctx.lineTo(x + 24, y - 26);
    ctx.lineTo(x + 18, y - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x - 8, y - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHealthBar(x: number, y: number, curHp: number, maxHp: number, width: number) {
    const ctx = this.ctx;
    const barWidth = Math.max(26, width);
    const barHeight = 4.5;
    const pct = Math.max(0, Math.min(1, curHp / maxHp));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

    let hpColor = '#22c55e';
    if (pct < 0.3) hpColor = '#ef4444';
    else if (pct < 0.6) hpColor = '#facc15';

    ctx.fillStyle = hpColor;
    ctx.fillRect(x - barWidth / 2, y, barWidth * pct, barHeight);
  }

  private drawProjectile(proj: Projectile) {
    const ctx = this.ctx;
    const { x, y, type } = proj;

    ctx.save();

    if (type === 'arrow') {
      const angle = angleBetween({ x: proj.startX, y: proj.startY }, { x: proj.targetX, y: proj.targetY });
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(8, -3.5);
      ctx.lineTo(13, 0);
      ctx.lineTo(8, 3.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-10, 3);
      ctx.stroke();
    } else if (type === 'cannonball') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 4, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'magic') {
      const pulse = Math.sin(this.animTimer * 10) * 1.5;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, 9 + pulse);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#c084fc');
      grad.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 9 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawParticle(part: Particle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = part.alpha;

    if (part.type === 'text') {
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(part.text || '', part.x + 1, part.y + 1);
      ctx.fillStyle = part.color;
      ctx.fillText(part.text || '', part.x, part.y);
    } else if (part.type === 'shockwave') {
      const radius = part.size * (1 - part.life / part.maxLife);
      ctx.strokeStyle = part.color;
      ctx.lineWidth = 3 * (part.life / part.maxLife);
      ctx.beginPath();
      ctx.arc(part.x, part.y, Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
    } else if (part.type === 'spark' || part.type === 'magic') {
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (part.type === 'smoke') {
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawHoverGhost(ghost: { type: TowerType; x: number; y: number; valid: boolean }) {
    const ctx = this.ctx;
    const config = TOWER_CONFIGS[ghost.type];
    const range = config.baseRange;
    const color = ghost.valid ? '#22c55e' : '#ef4444';

    ctx.save();

    // Range preview with tile annotation
    this.drawTowerRange(ghost.x, ghost.y, range, color, false);

    // Tower base preview
    ctx.fillStyle = ghost.valid ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cross or checkmark
    if (!ghost.valid) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ghost.x - 8, ghost.y - 8);
      ctx.lineTo(ghost.x + 8, ghost.y + 8);
      ctx.moveTo(ghost.x + 8, ghost.y - 8);
      ctx.lineTo(ghost.x - 8, ghost.y + 8);
      ctx.stroke();
    }

    ctx.restore();
  }
}
