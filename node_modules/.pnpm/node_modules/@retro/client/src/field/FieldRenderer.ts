import * as PIXI from 'pixi.js'
import { FIELD } from './FieldConstants'
import { yardToX, stripeCount } from './CoordinateHelpers'

export class FieldRenderer {
  public container = new PIXI.Container()
  private bg = new PIXI.Graphics()
  private lines = new PIXI.Graphics()

  constructor() {
    this.container.addChild(this.bg, this.lines)
    ;(this.container as any).eventMode = 'none'
  }

  resize(w: number, h: number) {
    this.bg.clear().beginFill(0x0b3d0b).drawRect(0, 0, w, h).endFill()
    this.lines.clear()
    this.lines.lineStyle({ width: 2, color: 0xffffff, alpha: 0.9 })
    const stripes = stripeCount()
    for (let i = 0; i <= stripes; i++) {
      const yard = i * FIELD.yardPerStripe
      const x = yardToX(yard, w)
      this.lines.moveTo(x, 0).lineTo(x, h)
    }
  }
}
