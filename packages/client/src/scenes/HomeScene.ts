import * as PIXI from 'pixi.js'
import type { IScene } from '../core/SceneManager'
import { sceneManager } from '../core/SceneManager'
import { GameScene } from './GameScene'

function makeButton(label: string): PIXI.Text {
  const txt = new PIXI.Text(label, new PIXI.TextStyle({
    fill: 0xffffff, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold'
  }))
  txt.anchor.set(0.5)
  ;(txt as any).eventMode = 'static'
  ;(txt as any).cursor = 'pointer'
  return txt
}

export class HomeScene implements IScene {
  public root = new PIXI.Container()

  init(): void {
    const w = window.innerWidth, h = window.innerHeight
    const live = makeButton('Start LIVE')
    const demo = makeButton('Play DEMO')
    const rew  = makeButton('Play REWIND')
    live.position.set(w/2, h/2 - 40)
    demo.position.set(w/2, h/2)
    rew.position.set(w/2, h/2 + 40)
    this.root.addChild(live, demo, rew)

    live.on('pointertap', () => sceneManager.start(new GameScene({ mode: 'LIVE' } as any)))
    demo.on('pointertap', () => sceneManager.start(new GameScene({ mode: 'DEMO' } as any)))
    rew.on('pointertap',  () => sceneManager.start(new GameScene({ mode: 'REW'  } as any)))
  }
  update(_dt: number): void {}
  onResize(): void {}
  destroy(): void { this.root.removeAllListeners(); this.root.destroy({ children: true }) }
}
