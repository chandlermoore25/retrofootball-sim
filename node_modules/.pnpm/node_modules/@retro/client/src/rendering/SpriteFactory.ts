import { Graphics } from 'pixi.js'

export function makePlayer(color: number) {
  const g = new Graphics()
  g.lineStyle(2, 0xffffff); g.beginFill(color); g.drawCircle(0, 0, 12); g.endFill()
  if ('eventMode' in (g as any)) (g as any).eventMode = 'none'
  return g
}

export function makeBall() {
  const g = new Graphics()
  g.lineStyle(2, 0x6b4500); g.beginFill(0xffcc00); g.drawCircle(0, 0, 6); g.endFill()
  if ('eventMode' in (g as any)) (g as any).eventMode = 'none'
  return g
}
