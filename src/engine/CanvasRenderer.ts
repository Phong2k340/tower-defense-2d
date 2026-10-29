import { MAP_CONFIG, TOWER_CONFIGS } from '../config/gameConfig';
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
    hoverBuild: { type: TowerType; x: number; y: number; valid: boolean } | null
  ) {
    const ctx = this.ctx;
    const w = MAP_CONFIG.width;
    const h = MAP_CONFIG.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Terrain & Map Background
    this.drawTerrain(w, h);

    // 2. Pathway with borders and cobblestones
    this.drawPath(waypoints);

    // 3. Portals / Spawn & Base Citadel
    this.drawPortals(waypoints);

    // 4. Tower range indicator for selected tower
    if (selectedTower) {
      this.drawTowerRange(selectedTower.x, selectedTower.y, selectedTower.range, '#38bdf8', true);
    }

    // 5. Towers
    for (const tower of towers) {
      this.drawTower(tower, selectedTower?.id === tower.id);
    }

    // 6. Enemies
    for (const enemy of enemies) {
      this.drawEnemy(enemy);
    }

    // 7. Projectiles
    for (const proj of projectiles) {
      this.drawProjectile(proj);
    }

    // 8. Particles (Explosions, Texts, Sparks)
    for (const part of particles) {
      this.drawParticle(part);
    }

    // 9. Hover Placement Ghost
    if (hoverBuild) {
      this.drawHoverGhost(hoverBuild);
    }
  }

  private drawTerrain(w: number, h: number) {
    const ctx = this.ctx;

    // Deep tactical grass gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#14281d'); // Rich deep forest moss
    bgGrad.addColorStop(0.5, '#0f2017');
    bgGrad.addColorStop(1, '#0a1610');
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

    // Decorative landscape elements: decorative rock clusters & runes
    this.drawEnvironmentalProps();
  }

  private drawEnvironmentalProps() {
    const ctx = this.ctx;
    // Ambient forest rocks with moss
    const rocks = [
      { x: 100, y: 70, r: 18 },
      { x: 380, y: 90, r: 24 },
      { x: 380, y: 320, r: 28 },
      { x: 640, y: 330, r: 22 },
      { x: 630, y: 90, r: 16 },
      { x: 140, y: 550, r: 25 },
      { x: 390, y: 560, r: 20 },
      { x: 880, y: 280, r: 24 },
    ];

    for (const rock of rocks) {
      ctx.save();
      // Drop shadow
      ctx.beginPath();
      ctx.ellipse(rock.x + 3, rock.y + 4, rock.r, rock.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // Rock body
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
      const rGrad = ctx.createRadialGradient(
        rock.x - rock.r * 0.3,
        rock.y - rock.r * 0.3,
        2,
        rock.x,
        rock.y,
        rock.r
      );
      rGrad.addColorStop(0, '#57534e');
      rGrad.addColorStop(0.7, '#292524');
      rGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = rGrad;
      ctx.fill();

      // Moss patch
      ctx.beginPath();
      ctx.arc(rock.x - rock.r * 0.2, rock.y - rock.r * 0.2, rock.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.fill();
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
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)'; // Amber guide pips
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

  public drawTowerRange(x: number, y: number, range: number, color: string, isSelected: boolean = false) {
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
    ctx.translate(-recoil, 0); // Apply recoil backwards

    // Archer figure (hooded cloak)
    ctx.fillStyle = level === 3 ? '#0284c7' : '#0369a1';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Bow (arc facing target)
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

    // 1. Heavy iron hexagonal base
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
      // Single heavy iron barrel
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.fillRect(0, -6, 22, 12);
      ctx.strokeRect(0, -6, 22, 12);

      // Muzzle rim
      ctx.fillStyle = '#71717a';
      ctx.fillRect(19, -7, 4, 14);
    } else if (level === 2) {
      // Double reinforced barrels
      ctx.fillStyle = '#b45309'; // Bronze plating
      ctx.fillRect(-2, -8, 24, 6);
      ctx.fillRect(-2, 2, 24, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(20, -9, 4, 8);
      ctx.fillRect(20, 1, 4, 8);
    } else {
      // Level 3: Triple infernal magma cannon
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-4, -10, 27, 6);
      ctx.fillRect(-2, -3, 29, 6);
      ctx.fillRect(-4, 4, 27, 6);
      // Magma core glow
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawMagicTower(x: number, y: number, level: number, _rotation: number) {
    const ctx = this.ctx;

    // 1. Dark obsidian pedestal
    ctx.fillStyle = '#1e1b4b'; // Deep void purple
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
      const oy = y + Math.sin(angle) * orbitDist * 0.7; // Elliptical 3D perspective orbit

      ctx.fillStyle = level === 3 ? '#fb7185' : '#e9d5ff';
      ctx.beginPath();
      ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Energy tether to core
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

    // Walking bounce offset
    const bounceY = Math.abs(Math.sin(walkCycle * 2)) * 3;
    const drawY = y - bounceY;

    // Draw enemy by type
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

    // Legs
    const legOffset = Math.sin(walk * 2) * 4;
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 4);
    ctx.lineTo(x - 5, y + 10 + legOffset);
    ctx.moveTo(x + 5, y + 4);
    ctx.lineTo(x + 5, y + 10 - legOffset);
    ctx.stroke();

    // Body
    ctx.fillStyle = isHit ? '#ffffff' : '#22c55e';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Goblin Ears
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

    // Red goblin eyes
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOrc(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;

    // Heavy Stomping Legs
    const legOffset = Math.sin(walk * 1.5) * 5;
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 6);
    ctx.lineTo(x - 7, y + 14 + legOffset);
    ctx.moveTo(x + 7, y + 6);
    ctx.lineTo(x + 7, y + 14 - legOffset);
    ctx.stroke();

    // Bulky Body / Crimson Armor
    ctx.fillStyle = isHit ? '#ffffff' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Iron Breastplate & Spiked Pauldrons
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x - r * 0.7, y - 4, r * 1.4, 9);

    // Horned Iron Helm
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(x, y - 5, r * 0.85, Math.PI, 0);
    ctx.fill();

    // Horns
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - 7);
    ctx.lineTo(x - r * 0.7 - 5, y - 13);
    ctx.moveTo(x + r * 0.7, y - 7);
    ctx.lineTo(x + r * 0.7 + 5, y - 13);
    ctx.stroke();

    // Fierce glowing eyes
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRunner(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;

    // Speed ghost / trail
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.beginPath();
    ctx.arc(x - Math.cos(walk) * 8, y, r * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Rapid scuttling legs
    const legOffset = Math.sin(walk * 3) * 6;
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4);
    ctx.lineTo(x - 4, y + 11 + legOffset);
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 4, y + 11 - legOffset);
    ctx.stroke();

    // Sleek hooded assassin body
    ctx.fillStyle = isHit ? '#ffffff' : '#eab308';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Cloak hood
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x, y - r - 4);
    ctx.lineTo(x + r, y);
    ctx.closePath();
    ctx.fill();

    // Glowing cyan visor/eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 4, y - 2, 8, 3);
  }

  private drawBoss(x: number, y: number, r: number, isHit: boolean, walk: number) {
    const ctx = this.ctx;

    // Ground stomp tremor ring
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 15, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Huge Legs
    const legOffset = Math.sin(walk * 1.2) * 6;
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(x - 12, y + 10, 8, 14 + legOffset);
    ctx.fillRect(x + 4, y + 10, 8, 14 - legOffset);

    // Giant Magma Granite Body
    ctx.fillStyle = isHit ? '#ffffff' : '#831843';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Magma cracks
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 8);
    ctx.lineTo(x - 2, y + 2);
    ctx.lineTo(x + 12, y - 4);
    ctx.stroke();

    // Obsidian Crown/Horns
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

    // Burning Molten Eyes
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

    // Dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

    // Health color gradient: Green -> Yellow -> Red
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

      // Arrow shaft
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(8, -3.5);
      ctx.lineTo(13, 0);
      ctx.lineTo(8, 3.5);
      ctx.closePath();
      ctx.fill();

      // Fletching
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-10, 3);
      ctx.stroke();
    } else if (type === 'cannonball') {
      // Cannonball shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 2, y + 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Fiery heavy shell
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Burning ember trail
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'magic') {
      // Arcane orb
      const pulse = Math.sin(this.animTimer * 10) * 1.5;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, 9 + pulse);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#c084fc');
      grad.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 9 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
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

    // Range preview
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

