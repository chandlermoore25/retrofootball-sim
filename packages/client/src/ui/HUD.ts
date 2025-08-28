import * as PIXI from 'pixi.js'
import type { GameState } from '../state/GameState'

// Modern HUD: full-width bottom bar with segments
export class HUD {
  public view = new PIXI.Container()
  private bar = new PIXI.Graphics()
  private clock = new PIXI.Text('', new PIXI.TextStyle({ fill: 0xffffff, fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold' }))
  private dnd = new PIXI.Text('', new PIXI.TextStyle({ fill: 0xffffff, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }))
  private spot = new PIXI.Text('', new PIXI.TextStyle({ fill: 0xffffff, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }))
  private score = new PIXI.Text('', new PIXI.TextStyle({ fill: 0xffffff, fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold' }))
  private state: GameState | null = null
  private h = 48

  constructor() {
    ;(this.view as any).eventMode = 'none'
    this.view.addChild(this.bar, this.dnd, this.spot, this.clock, this.score)
  }

  set(state: GameState) {
    this.state = state
    this.redraw()
  }

  tick(dt: number) {
    if (!this.state) return
    const clockMs = Math.max(0, (this.state.clockMs ?? 0) - Math.round(dt * 1000))
    this.set({ ...this.state, clockMs })
  }

  private redraw() {
    if (!this.state) return
    const s = this.fillDefaults(this.state)

    // compose strings
    const m = Math.floor(s.clockMs / 60000)
    const sec = Math.floor((s.clockMs % 60000) / 1000).toString().padStart(2,'0')
    this.clock.text = `Q${s.quarter} ${m}:${sec}`
    this.dnd.text = `${s.down}&${s.distance}`
    this.spot.text = `${s.yardline.side}${s.yardline.yards}`
    this.score.text = `${s.score.home}-${s.score.away}`

    // layout in onResize
    this.onResize(window.innerWidth, window.innerHeight)
  }

  private fillDefaults(st: Partial<GameState>): Required<GameState> {
    const yardline = st.yardline ?? { side: 'OWN', yards: 25 }
    const score = st.score ?? { home: 0, away: 0 }
    return {
      quarter: st.quarter ?? 1,
      clockMs: st.clockMs ?? 15*60*1000,
      down: st.down ?? 1,
      distance: st.distance ?? 10,
      yardline,
      score,
    } as Required<GameState>
  }

  onResize(w: number, h: number) {
    // draw the bar
    const r = 14
    this.bar.clear()
    this.bar.beginFill(0x000000, 0.35).drawRoundedRect(8, h - this.h - 8, w - 16, this.h, r).endFill()
    // subtle top border line
    this.bar.lineStyle({ width: 1, color: 0xffffff, alpha: 0.12 }).moveTo(8 + r, h - this.h - 8).lineTo(w - 8 - r, h - this.h - 8)

    // layout: [ D&D | SPOT ] ---center--- [ CLOCK ] ---right--- [ SCORE ]
    const y = h - this.h - 8 + Math.floor((this.h - 20) / 2)
    this.dnd.position.set(20, y)
    this.spot.position.set(this.dnd.x + this.dnd.width + 16, y)

    this.clock.position.set(Math.floor(w/2 - this.clock.width/2), y - 2)

    this.score.position.set(w - this.score.width - 20, y - 1)
  }
}
