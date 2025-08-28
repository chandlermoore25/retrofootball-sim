import * as PIXI from 'pixi.js'
import type { IScene } from '../core/SceneManager'
import { FieldRenderer } from '../field/FieldRenderer'
import { HUD } from '../ui/HUD'
import { FixedTimestep } from '../sim/FixedTimestep'
import { yardToX } from '../field/CoordinateHelpers'
import { OverlayMarkers } from '../ui/OverlayMarkers'
import { PlayBanner } from '../ui/PlayBanner'
import { defaultGameState, type GameState } from '../state/GameState'
import type { NormalizedEvent } from '../net/types'
import { applyEvent } from '../state/applyEvent'
import { BufferManager } from '../net/BufferManager'
import { connectLive, DEFAULT_WS_URL, type LiveStatus } from '../net/ws'
import { LocalDemoController } from '../sim/LocalDemoController'
import { ConnectionBar } from '../ui/ConnectionBar'

type Mode = 'LIVE' | 'DEMO' | 'REW'
interface Opts { mode?: Mode }

export class GameScene implements IScene {
  public root = new PIXI.Container()
  private field = new FieldRenderer()
  private hud = new HUD()
  private loop = new FixedTimestep(60)
  private mode: Mode = 'DEMO'
  private state: GameState = { ...defaultGameState }
  private markers = new OverlayMarkers()
  private banner = new PlayBanner()
  private buffer = new BufferManager()
  private bar = new ConnectionBar()

  private sprites = new PIXI.Container()
  private offense!: PIXI.Graphics
  private defense!: PIXI.Graphics
  private ball!: PIXI.Graphics

  private anim: { active: boolean; t: number; dur: number; fromX: number; toX: number } = { active: false, t: 0, dur: 0, fromX: 0, toX: 0 }

  private liveHandle: { close?: () => void } | null = null
  private demoHandle: LocalDemoController | null = null
  private unsubBuffer: (() => boolean) | null = null

  constructor(opts: Opts = {}) { if (opts.mode) this.mode = opts.mode }

  init(): void {
    this.root.addChild(this.field.container)
    this.root.addChild(this.sprites)
    this.root.addChild(this.hud.view)
    this.root.addChild(this.markers.view)
    this.root.addChild(this.banner.view)
    this.root.addChild(this.bar)

    // move connection pill to top-right so it never overlaps HUD
    this.bar.position.set(window.innerWidth - 130, 10)
    this.bar.alpha = 0.8

    this.offense = this.circle(0x1e90ff, 10)
    this.defense = this.circle(0xff4d4d, 10)
    this.ball    = this.circle(0xffd166, 5)
    this.sprites.addChild(this.offense, this.defense, this.ball)

    this.onResize()
    this.syncHudAndMarkers()
    this.banner.show('Kickoff!', 1000)
    this.bar.setMode(this.mode === 'LIVE' ? 'CONNECTING' : this.mode)

    this.loop.onUpdate = (dt) => {
      this.hud.tick(dt)
      this.banner.update(dt)
      if (this.anim.active) {
        this.anim.t += dt
        const k = Math.min(1, this.anim.t / this.anim.dur)
        const x = this.anim.fromX + (this.anim.toX - this.anim.fromX) * k
        const midY = Math.round(window.innerHeight * 0.5)
        this.offense.position.x = x - 20
        this.defense.position.x = x + 20
        this.ball.position.set(x - 5, midY - 2)
        if (k >= 1) this.anim.active = false
      }
    }
    this.loop.start()

    this.unsubBuffer = this.buffer.subscribe((batch) => { for (const e of batch) this.onEvent(e) })

    if (this.mode === 'LIVE') {
      const live = connectLive(DEFAULT_WS_URL, (s) => this.onLiveStatus(s))
      this.liveHandle = live
      live.subscribe((evs) => this.buffer.pushMany(evs))
    } else {
      const demo = new LocalDemoController((evs) => this.buffer.pushMany(evs))
      this.demoHandle = demo
      demo.start()
    }
  }

  private onLiveStatus(s: LiveStatus) { this.bar.setMode(s === 'LIVE' ? 'LIVE' : (s === 'CONNECTING' ? 'CONNECTING' : 'DISC')) }

  private onEvent(e: NormalizedEvent) {
    if (e.type === 'PlayStart') this.banner.show('Play start', 800)
    if (e.type === 'PlayEnd') {
      const gain = (e as any).result?.yards ?? 0
      const fromYards = this.state?.yardline?.yards ?? 25
      const fromX = yardToX(fromYards, window.innerWidth)
      const toX = yardToX(Math.min(99, fromYards + gain), window.innerWidth)
      this.anim = { active: true, t: 0, dur: 1.8, fromX, toX }
      const txt = `Run for ${gain} yd${gain!==1?'s':''}`
      this.banner.show(txt, 1500)
    }
    this.state = applyEvent(this.state, e)
    this.syncHudAndMarkers()
  }

  private syncHudAndMarkers() {
    const y = this.state?.yardline?.yards ?? 25
    this.hud.set({
      ...this.state,
      yardline: this.state.yardline ?? { side: 'OWN', yards: 25 },
      score: this.state.score ?? { home: 0, away: 0 },
    })
    const losX = yardToX(y, window.innerWidth)
    const ltgX = yardToX(Math.min(99, y + (this.state.distance ?? 10)), window.innerWidth)
    this.markers.set(losX, ltgX)
  }

  private circle(color: number, r: number): PIXI.Graphics {
    const g = new PIXI.Graphics()
    g.beginFill(color).drawCircle(0,0,r).endFill()
    ;(g as any).eventMode = 'none'
    return g
  }

  update(_dt: number): void {}

  onResize(): void {
    this.field.resize(window.innerWidth, window.innerHeight)
    this.hud.onResize(window.innerWidth, window.innerHeight)
    this.markers.resize()
    if (!this.anim.active) {
      const midY = Math.round(window.innerHeight * 0.5)
      const x = yardToX(this.state?.yardline?.yards ?? 25, window.innerWidth)
      this.offense.position.set(x - 20, midY - 10)
      this.defense.position.set(x + 20, midY + 10)
      this.ball.position.set(x - 5, midY - 2)
    }
    this.banner.resize()
    this.bar.position.set(window.innerWidth - 130, 10)
  }

  destroy(): void {
    this.unsubBuffer?.()
    this.buffer.dispose()
    this.demoHandle?.stop()
    this.liveHandle?.close?.()
    this.root.destroy({ children: true })
  }
}
