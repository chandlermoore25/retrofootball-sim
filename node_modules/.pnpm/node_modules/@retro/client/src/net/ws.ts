import type { NormalizedEvent } from './types'

export type LiveStatus = 'DISC' | 'CONNECTING' | 'LIVE'
export const DEFAULT_WS_URL = (import.meta as any).env?.VITE_WS_URL ?? 'ws://localhost:3001/ws/live'

export type Incoming = NormalizedEvent[]

export function connectLive(url: string = DEFAULT_WS_URL, onStatus?: (s: LiveStatus) => void) {
  let ws: WebSocket | null = null
  let open = false
  const subs = new Set<(evs: Incoming) => void>()
  let closed = false

  const setStatus = (s: LiveStatus) => { try { onStatus?.(s) } catch {} }

  function connect() {
    setStatus('CONNECTING')
    ws = new WebSocket(url)
    ws.addEventListener('open', () => { open = true; setStatus('LIVE') })
    ws.addEventListener('close', () => { open = false; setStatus('DISC'); if (!closed) retry() })
    ws.addEventListener('error', () => { /* swallow, close will follow */ })
    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data)
        const arr: Incoming = Array.isArray(data) ? data : [data]
        for (const cb of subs) cb(arr)
      } catch {}
    })
  }

  let backoff = 1000
  function retry() {
    setTimeout(() => { if (!closed) { backoff = Math.min(10000, backoff * 1.5); connect() } }, backoff)
  }

  connect()

  return {
    subscribe(cb: (evs: Incoming) => void): () => boolean { subs.add(cb); return () => subs.delete(cb) },
    close() { closed = true; try { ws?.close() } catch {} },
  }
}
