import { Graphics } from 'pixi.js'
import { App } from '../core/App'

export class OverlayMarkers {
  view = new Graphics()
  private losX = -1
  private ltgX = -1

  set(LOSx: number, LTGx: number) {
    this.losX = LOSx; this.ltgX = LTGx
    this.draw()
  }
  clear() { this.losX = this.ltgX = -1; this.draw() }
  resize() { this.draw() }

  private draw() {
    const g = this.view
    g.clear()
    const { height } = App.instance.renderer
    if (this.losX >= 0) {
      g.lineStyle(3, 0xffffff, 0.9)
      g.moveTo(this.losX, 0); g.lineTo(this.losX, height)
    }
    if (this.ltgX >= 0) {
      g.lineStyle(3, 0xffd400, 0.9)
      g.moveTo(this.ltgX, 0); g.lineTo(this.ltgX, height)
    }
  }
}
