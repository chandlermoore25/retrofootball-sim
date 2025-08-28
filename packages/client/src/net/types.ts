export type Side = 'OWN' | 'OPP' | 'MID'
export type Base = { seq: number; at: number }
export type NormalizedEvent =
  | (Base & { type: 'GameStart'; gameId: string; home: string; away: string })
  | (Base & { type: 'QuarterStart'; quarter: number; clockMs: number })
  | (Base & { type: 'ClockUpdate'; clockMs: number })
  | (Base & { type: 'PlayStart'; down: number; distance: number; yardline: { side: Side; yards: number } })
  | (Base & { type: 'PlayEnd'; result: { yards: number; firstDown: boolean; touchdown?: boolean } })
  | (Base & { type: 'ScoreUpdate'; home: number; away: number })
