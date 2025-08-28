import * as PIXI from 'pixi.js';
import { App } from './App';

export interface IScene {
  root: PIXI.Container;
  init(): void;
  update(dt: number): void;
  onResize(): void; // zero-arg signature
  destroy(): void;
}

export class SceneManager {
  private app = App.init();
  private current?: IScene;
  private lastTime = performance.now();
  private running = true;

  constructor() {
    window.addEventListener('resize', () => this.current?.onResize());
    this.app.ticker.add(this._tick, this);
  }

  private _tick() {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.current?.update(dt);
  }

  mount(scene: IScene) {
    this.current?.destroy();
    this.current = scene;
    this.app.stage.removeChildren();
    this.app.stage.addChild(scene.root);
    scene.init();
    scene.onResize();
  }

  // Added: start/stop to match existing boot code in main.ts
  async start(scene?: IScene): Promise<void> {
    if (scene) this.mount(scene);
    this.running = true;
  }
  stop(): void {
    this.running = false;
  }
}

// HMR-safe singleton for code that imports { sceneManager }
const _singleton =
  (globalThis as any).__retro_scene_manager__ ||
  ((globalThis as any).__retro_scene_manager__ = new SceneManager());

export const sceneManager: SceneManager = _singleton;
