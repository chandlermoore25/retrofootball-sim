import type { NormalizedEvent } from '../net/types'

export class PlaybackController {
  private timer: number | null = null
  private idx = 0
  private startAt = 0
  private baseTime = 0
  private subs = new Set<(events: NormalizedEvent[]) => void>()

  constructor(private events: NormalizedEvent[]) {
    // ensure 'at' is non-decreasing
    this.events = [...events].sort((a,b) => (a.at ?? 0) - (b.at ?? 0))
  }

  subscribe(cb: (events: NormalizedEvent[]) => void): () => boolean {
    this.subs.add(cb); return () => this.subs.delete(cb)
  }

  private emitOne(e: NormalizedEvent) {
    for (const cb of this.subs) cb([e])
  }

  start() {
    this.stop()
    this.idx = 0
    this.baseTime = performance.now()
    this.scheduleNext()
  }

  private scheduleNext() {
    if (this.idx >= this.events.length) return
    const e = this.events[this.idx]
    const when = (e.at ?? 0) - (this.events[0].at ?? 0)
    const delay = Math.max(0, when - (performance.now() - this.baseTime))
    this.timer = window.setTimeout(() => {
      this.emitOne(e)
      this.idx++
      this.scheduleNext()
    }, delay)
  }

  stop() { if (this.timer != null) { clearTimeout(this.timer); this.timer = null } }
}
