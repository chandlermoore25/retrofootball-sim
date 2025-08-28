import { Container, Graphics, Text } from 'pixi.js'
import { App } from '../core/App'

export class PlayBanner {
  view = new Container()
  private bg = new Graphics()
  private label = new Text('', { fill: 0xffffff, fontSize: 18 } as any)
  private t = 0
  private dur = 1800 // ms
  private visible = false

  constructor() {
    this.view.addChild(this.bg, this.label)
    this.resize()
    this.redraw()
  }

  show(text: string, durMs = 1800) {
    this.dur = durMs
    this.t = 0
    this.visible = true
    this.label.text = text
    this.redraw()
  }

  update(dtSec: number) {
    if (!this.visible) return
    this.t += dtSec * 1000
    if (this.t >= this.dur) {
      this.visible = false
      this.redraw()
    } else {
      const a = 1 - Math.max(0, this.t - this.dur * 0.6) / (this.dur * 0.4)
      this.view.alpha = Math.max(0, Math.min(1, a))
    }
  }

  resize() {
    const { width } = App.instance.renderer
    this.view.position.set((width - 420) / 2, 6)
    this.redraw()
  }

  private redraw() {
    const w = 420, h = 36
    this.bg.clear()
    if (!this.visible) { this.view.alpha = 0; return }
    this.view.alpha = 1
    this.bg.lineStyle(1, 0xffffff, 0.5)
    this.bg.beginFill(0x000000, 0.35)
    this.bg.drawRoundedRect(0, 0, w, h, 8)
    this.bg.endFill()
    this.label.position.set(12, 8)
  }
}
