import { Particle } from '../types/game';
import { generateId } from '../utils/math';

export class ParticleManager {
  public particles: Particle[] = [];

  public reset() {
    this.particles = [];
  }

  public addDamageText(x: number, y: number, text: string, color: string = '#f87171') {
    this.particles.push({
      id: generateId('part_text'),
      x: x + (Math.random() - 0.5) * 16,
      y: y - 10,
      vx: (Math.random() - 0.5) * 20,
      vy: -45 - Math.random() * 25,
      life: 0.8,
      maxLife: 0.8,
      size: 14,
      color,
      alpha: 1,
      type: 'text',
      text,
    });
  }

  public addGoldText(x: number, y: number, amount: number) {
    this.particles.push({
      id: generateId('part_gold'),
      x,
      y: y - 15,
      vx: 0,
      vy: -35,
      life: 0.9,
      maxLife: 0.9,
      size: 15,
      color: '#fbbf24',
      alpha: 1,
      type: 'text',
      text: `+${amount} Vàng`,
    });
  }

  public addExplosion(x: number, y: number, radius: number) {
    // Shockwave ring
    this.particles.push({
      id: generateId('part_ring'),
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.4,
      maxLife: 0.4,
      size: radius,
      color: '#fb923c',
      alpha: 0.8,
      type: 'shockwave',
    });

    // Fire sparks
    const sparkCount = 18;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
      const speed = 70 + Math.random() * 110;
      this.particles.push({
        id: generateId('part_spark'),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#f97316' : '#fde047',
        alpha: 1,
        type: 'spark',
      });
    }

    // Smoke puffs
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 40;
      this.particles.push({
        id: generateId('part_smoke'),
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
        size: 8 + Math.random() * 10,
        color: '#78716c',
        alpha: 0.65,
        type: 'smoke',
      });
    }
  }

  public addMagicImpact(x: number, y: number) {
    const sparkCount = 12;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount;
      const speed = 50 + Math.random() * 60;
      this.particles.push({
        id: generateId('part_magic'),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.2,
        maxLife: 0.6,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#c084fc' : '#38bdf8',
        alpha: 1,
        type: 'magic',
      });
    }
  }

  public addArrowHit(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      this.particles.push({
        id: generateId('part_spark'),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.15,
        maxLife: 0.4,
        size: 2 + Math.random() * 2,
        color: '#fef08a',
        alpha: 0.9,
        type: 'spark',
      });
    }
  }

  public addDeathPoof(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 45;
      this.particles.push({
        id: generateId('part_death'),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0.5 + Math.random() * 0.25,
        maxLife: 0.75,
        size: 5 + Math.random() * 6,
        color,
        alpha: 0.8,
        type: 'smoke',
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction / gravity
      if (p.type === 'spark' || p.type === 'magic') {
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else if (p.type === 'smoke') {
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.size += dt * 8; // smoke expands
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }
}

