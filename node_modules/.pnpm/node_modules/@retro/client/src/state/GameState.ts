export type Side = 'OWN' | 'OPP' | 'MID'
export type GameState = {
  quarter: number
  clockMs: number
  down: number
  distance: number
  yardline: { side: Side; yards: number }
  score: { home: number; away: number }
}
export const defaultGameState: GameState = {
  quarter: 1,
  clockMs: 15 * 60 * 1000,
  down: 1,
  distance: 10,
  yardline: { side: 'OWN', yards: 25 },
  score: { home: 0, away: 0 },
}
