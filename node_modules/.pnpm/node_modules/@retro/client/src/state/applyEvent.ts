import type { NormalizedEvent } from '../net/types'
import { defaultGameState, type GameState } from './GameState'

export function applyEvent(prev: GameState | null | undefined, e: NormalizedEvent): GameState {
  // Always start from a concrete state
  let s: GameState = prev ? { ...prev } : { ...defaultGameState }

  switch (e.type) {
    case 'GameStart':
      return { ...defaultGameState }

    case 'QuarterStart': {
      const quarter = (e as any).quarter ?? s.quarter
      const clockMs = (e as any).clockMs ?? s.clockMs
      return { ...s, quarter, clockMs }
    }

    case 'ClockUpdate': {
      const clockMs = (e as any).clockMs ?? s.clockMs
      return { ...s, clockMs }
    }

    case 'PlayStart': {
      // No state change required for baseline; could stash metadata if needed
      return { ...s }
    }

    case 'PlayEnd': {
      const result = (e as any).result ?? {}
      const gain = Number(result.yards ?? 0) || 0
      const yardline = s.yardline ?? { side: 'OWN', yards: 25 }
      let yards = Math.max(1, Math.min(99, (yardline.yards ?? 25) + gain))

      // compute new down & distance
      let down = s.down ?? 1
      let distance = s.distance ?? 10
      if ((result.firstDown === true) || (distance - gain) <= 0) {
        down = 1
        distance = 10
      } else {
        down = Math.min(4, down + 1)
        distance = Math.max(1, distance - gain)
      }
      return { ...s, yardline: { ...yardline, yards }, down, distance }
    }

    default:
      return s
  }
}
