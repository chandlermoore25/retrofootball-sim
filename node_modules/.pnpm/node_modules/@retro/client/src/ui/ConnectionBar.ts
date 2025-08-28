import * as PIXI from 'pixi.js';
export type Mode = 'LIVE' | 'REW' | 'DISC' | 'CONNECTING';
const COLORS: Record<Mode, number> = { LIVE: 0x2ecc71, REW: 0x9b59b6, DISC: 0xe74c3c, CONNECTING: 0xf1c40f };

export class ConnectionBar extends PIXI.Container {
  public container: PIXI.Container;
  public view: 'LIVE' | 'REW' = 'LIVE';
  public running = true;
  public run = true;
  private bg = new PIXI.Graphics();
  private label = new PIXI.Text('DISC', new PIXI.TextStyle({ fill: 0x111111, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' }));
  private _mode: Mode = 'DISC';
  private toggleListeners = new Set<(running: boolean) => void>();

  constructor() {
    super();
    this.container = this;
    this.addChild(this.bg, this.label);
    this.label.anchor.set(0.5);
    (this as any).eventMode = 'static';
    this.updateVisual();
  }

  set mode(m: Mode) { if (this._mode !== m) { this._mode = m; this.updateVisual(); } }
  get mode() { return this._mode }

  setMode(m: Mode) { this.mode = m; }
  setStatus(m: Mode) { this.mode = m; }
  getConnected() { return this._mode === 'LIVE'; }
  setConnected(connected: boolean) { this.mode = connected ? 'LIVE' : 'DISC'; } // <-- added alias

  setRunning(r: boolean) {
    this.running = this.run = r;
    this.toggleListeners.forEach(fn => { try { fn(this.running); } catch {} });
  }
  onToggle(fn: (running: boolean) => void) { this.toggleListeners.add(fn); return () => this.toggleListeners.delete(fn); }

  resize(width?: number, height?: number, margin = 8, anchor: 'tl'|'tr' = 'tl') {
    const pw = (width ?? (this.parent && (this.parent as any).width) ?? 0) as number;
    if (anchor === 'tl' || pw === 0) this.position.set(margin, margin);
    else { const w = 110; this.position.set(Math.max(0, pw - w - margin), margin); }
  }
  onResize(width?: number, height?: number) { this.resize(width, height); }

  private updateVisual() {
    const w = 110, h = 26, r = 13;
    this.bg.clear().beginFill(COLORS[this._mode]).drawRoundedRect(0, 0, w, h, r).endFill();
    this.label.text = this._mode; this.label.position.set(w / 2, h / 2 + 1);
  }
}
