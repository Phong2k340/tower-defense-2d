import { Point } from '../types/game';

export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

export function angleBetween(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the shortest distance from point p to the line segment between a and b.
 */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const l2 = distanceSq(a, b);
  if (l2 === 0) return distance(p, a);

  // Consider the line extending the segment, parameterized as a + t (b - a).
  // We find projection of point p onto the line.
  // It falls where t = [(p-a) . (b-a)] / |b-a|^2
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = clamp(t, 0, 1);

  // Projection falls on the segment
  const proj: Point = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return distance(p, proj);
}

/**
 * Returns a unique id string.
 */
let counter = 0;
export function generateId(prefix: string = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 7)}`;
}

