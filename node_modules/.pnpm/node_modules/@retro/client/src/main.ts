import { App, getCanvasEl } from './core/App'
import { sceneManager } from './core/SceneManager'
import { HomeScene } from './scenes/HomeScene'

async function boot() {
  await App.init({ resizeTo: window, backgroundColor: 0x0b3d0b })
  document.getElementById('app')!.appendChild(getCanvasEl())
  sceneManager.start(new HomeScene())
}
boot()
