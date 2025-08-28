import type { NormalizedEvent } from './types'

type Sub = (events: NormalizedEvent[]) => void

export class BufferManager {
  private buf: NormalizedEvent[] = []
  private subs = new Set<Sub>()
  private paused = false

  subscribe(cb: Sub): () => boolean {
    this.subs.add(cb)
    return () => this.subs.delete(cb)
  }

  pushMany(events: NormalizedEvent[]): void {
    if (!events || events.length === 0) return
    this.buf.push(...events)
    if (!this.paused) this.flush()
  }

  flush(): void {
    if (this.buf.length === 0) return
    const batch = this.buf.splice(0, this.buf.length)
    for (const cb of this.subs) cb(batch)
  }

  pause(): void { this.paused = true }
  resume(): void { this.paused = false; this.flush() }
  clear(): void { this.buf.length = 0 }
  dispose(): void { this.subs.clear(); this.buf.length = 0 }
}
