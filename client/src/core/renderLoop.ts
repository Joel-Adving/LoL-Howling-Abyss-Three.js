import { Renderer } from './renderer'
import { Scene } from './scene'
import { animationMixer } from './animations'
import { updateLightPos } from './lighting'
import { Camera, cameraLocked, setCameraPosition } from './camera'
import { Mouse } from './mouse'
import { PhysicsWorld } from './physics'
import { lockCameraToPlayerPosition, playerUpdate } from './player'

const stepFunctions: Function[] = []

export function addToLoop(fn: (delta: number) => void) {
  stepFunctions.push(fn)
}

function step(delta: number) {
  PhysicsWorld().fixedStep()
  playerUpdate()
  updateLightPos(Camera())
  animationMixer.update(delta * 0.85)
  stepFunctions.forEach((fn) => fn(delta))

  if (Mouse().isAtEdge) {
    setCameraPosition()
  }
  if (cameraLocked) {
    lockCameraToPlayerPosition()
  }
}

let lastFrameTime = 0

export function frame(currentFrameTime: number) {
  requestAnimationFrame(frame)
  step((currentFrameTime - lastFrameTime) / 1000)
  Renderer().render(Scene(), Camera())
  lastFrameTime = currentFrameTime
}

export function startRenderLoop() {
  requestAnimationFrame(frame)
}
