import type { NormalizedEvent } from '../net/types'

type Emit = (events: NormalizedEvent[]) => void

export class LocalDemoController {
  private seq = 1
  private timer: number | null = null

  constructor(private emit: Emit) {}

  start() {
    // Kickoff sequence, then plays
    const now = Date.now()
    this.emit([{ type:'GameStart', at: now, seq: this.seq++ } as any])
    this.emit([{ type:'QuarterStart', at: now, seq: this.seq++, quarter: 1, clockMs: 15*60*1000 } as any])
    this.loop()
  }

  private loop() {
    const at = Date.now()
    // a second of clock
    this.emit([{ type:'ClockUpdate', at, seq: this.seq++, clockMs: Math.max(0, (15*60*1000) - ((this.seq-1)*1000)) } as any])
    // every ~4s start a play
    this.timer = window.setTimeout(() => {
      const startAt = Date.now()
      this.emit([{ type:'PlayStart', at: startAt, seq: this.seq++ } as any])
      // end play after ~2s
      const yards = Math.floor(3 + Math.random()*9)
      window.setTimeout(() => {
        const endAt = Date.now()
        this.emit([{ type:'PlayEnd', at: endAt, seq: this.seq++, result: { yards, firstDown: yards>=10 } } as any])
        // next
        this.loop()
      }, 2000)
    }, 3000)
  }

  stop() { if (this.timer != null) { clearTimeout(this.timer); this.timer = null } }
}
