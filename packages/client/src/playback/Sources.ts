import type { NormalizedEvent } from '../net/types'

export type PushFn = (e: NormalizedEvent) => void
export type SourceHandle = { close: () => void }
export interface GameSource {
  start(push: PushFn): SourceHandle
}

/** No-op source placeholder */
export class NullSource implements GameSource {
  start(): SourceHandle { return { close: () => {} } }
}

/** Simple Rewind source: plays events by their timestamp `at` with a speed factor */
export class RewindSource implements GameSource {
  private events: NormalizedEvent[]
  private speed: number
  constructor(events: NormalizedEvent[], speed = 1) {
    this.events = [...events].sort((a, b) => a.at - b.at)
    this.speed = Math.max(0.01, speed)
  }
  start(push: PushFn): SourceHandle {
    if (this.events.length === 0) return { close: () => {} }
    const t0 = this.events[0].at
    const timers: any[] = []
    for (const ev of this.events) {
      const delay = Math.max(0, Math.round((ev.at - t0) / this.speed))
      const h = setTimeout(() => push(ev), delay)
      timers.push(h)
    }
    return {
      close: () => timers.forEach((h) => clearTimeout(h)),
    }
  }
}
