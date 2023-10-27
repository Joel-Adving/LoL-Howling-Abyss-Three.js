import { Renderer } from './renderer'
import { Scene } from './scene'
import { animationMixer, updateAnimations } from './animations'
import { updateLightPos } from './lighting'
import { Camera, cameraLocked, setCameraPosition } from './camera'
import { Mouse } from './mouse'
import type { PerspectiveCamera, Scene as ThreeScene, WebGLRenderer } from 'three'
import { assets } from './assets'

// thanks to the poor singleton pattern i implemented
// and the ES6+ temporal dead zone (TDZ) and some circular dependencies
// we will laizily initialize these variables in the frame function
let renderer: WebGLRenderer
let scene: ThreeScene
let camera: PerspectiveCamera
let mouse: Mouse
let playerChampion: any = null

const updateFunctions: Function[] = []

export function addToLoop(fn: (delta: number) => void) {
  updateFunctions.push(fn)
}

function step(delta: number) {
  if (mouse.isAtEdge) {
    setCameraPosition()
  }

  if (cameraLocked) {
    camera.position.x = playerChampion.value.scene.position.x
    camera.position.z = playerChampion.value.scene.position.z + 5
  }

  updateFunctions.forEach((fn) => fn(delta))
  updateAnimations()
  updateLightPos(camera)
  animationMixer.update(delta * 0.85)
}

let lastFrameTime: null | number = null

export function frame(time: number) {
  if (!scene) scene = Scene()
  if (!renderer) renderer = Renderer()
  if (!camera) camera = Camera()
  if (!mouse) mouse = Mouse()
  if (!playerChampion) playerChampion = assets.get('nidalee')
  if (lastFrameTime === null) lastFrameTime = time

  step((time - lastFrameTime) / 1000)

  renderer.render(scene, camera)
  lastFrameTime = time
  requestAnimationFrame(frame)
}

export function startRenderLoop() {
  requestAnimationFrame(frame)
}
