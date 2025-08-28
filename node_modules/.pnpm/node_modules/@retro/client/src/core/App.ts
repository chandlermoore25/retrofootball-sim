import * as PIXI from 'pixi.js';

export function getCanvasEl(): HTMLCanvasElement {
  // Prefer an existing tagged canvas if present
  let el = document.querySelector('canvas#retro-canvas') as HTMLCanvasElement | null;
  if (el) return el;
  // If a PIXI app already exists, return its view
  const view = (App as any)?.instance?.view;
  if (view instanceof HTMLCanvasElement) return view as HTMLCanvasElement;
  // Otherwise create one and attach to the document
  el = document.createElement('canvas');
  el.id = 'retro-canvas';
  (document.body ?? document.documentElement).appendChild(el);
  return el;
}

export class App {
  static instance: PIXI.Application;

  static init(canvas?: HTMLCanvasElement) {
    if (this.instance) return this.instance;
    const view = canvas ?? (document.querySelector('canvas') as HTMLCanvasElement | null) ?? undefined;
    this.instance = new PIXI.Application({
      resizeTo: window,
      antialias: true,
      background: 0x0b3d0b,
      view,
    });
    if (!view) (document.body ?? document.documentElement).appendChild(this.instance.view as HTMLCanvasElement);
    return this.instance;
  }
}
