export class FixedTimestep {
  public onUpdate: (dt: number) => void = () => {}
  private step = 1 / 60
  private acc = 0
  private running = false
  private last = 0

  constructor(fps = 60) { this.step = 1 / fps }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const tick = () => {
      if (!this.running) return
      const now = performance.now()
      this.acc += (now - this.last) / 1000
      this.last = now
      while (this.acc >= this.step) {
        this.onUpdate(this.step)
        this.acc -= this.step
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  stop() { this.running = false }
}
