export class GameLoop {
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private onTick: (dt: number) => void;

  constructor(onTick: (dt: number) => void) {
    this.onTick = onTick;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to 0.1s to prevent physics explosions when switching tabs or pausing
    const dt = Math.min(rawDt, 0.1);

    this.onTick(dt);

    this.animFrameId = requestAnimationFrame(this.loop);
  }
}

