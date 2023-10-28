import { PerspectiveCamera, Vector3 } from 'three'

export type CameraBounds = {
  topLeftCorner: Vector3
  topRightCorner: Vector3
  bottomLeftCorner: Vector3
  bottomRightCorner: Vector3
}

export let camera: PerspectiveCamera
export let cameraSpeed = 0.125
export let cameraLocked = false
export let cameraMaxZoom = 1.85 // 1.715

export function Camera() {
  if (!camera) {
    camera = initCamera()
  }
  return camera
}

export function initCamera() {
  const camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000.0)
  camera.rotation.x = -56.75 * (Math.PI / 180)
  camera.position.set(0, 8, 5)
  camera.zoom = cameraMaxZoom
  camera.updateProjectionMatrix()
  return camera
}

export const cameraMovingDirection = {
  forward: false,
  back: false,
  left: false,
  right: false
}

export const cameraBounds = {
  topLeftCorner: new Vector3(-2.7, 0, -51),
  topRightCorner: new Vector3(55.5, 0, 0),
  bottomLeftCorner: new Vector3(0, 0, 7.5),
  bottomRightCorner: new Vector3(0, 0, 30)
}

export function setCameraMovingDirection(direction: 'forward' | 'back' | 'left' | 'right', value: boolean) {
  cameraMovingDirection[direction] = value
}

export function setCameraSpeed(speed: number) {
  cameraSpeed = speed
}

export function setCameraLocked(locked: boolean) {
  cameraLocked = locked
}

export function setCameraMaxZoom(zoom: number) {
  cameraMaxZoom = zoom
}

export function resetCameraMovingDirection() {
  cameraMovingDirection.forward = false
  cameraMovingDirection.back = false
  cameraMovingDirection.left = false
  cameraMovingDirection.right = false
}

export function setCameraPosition() {
  if (cameraMovingDirection.forward) {
    if (camera.position.z - cameraSpeed >= cameraBounds.topLeftCorner.z) {
      camera.position.z -= cameraSpeed
    }
  }
  if (cameraMovingDirection.back) {
    if (
      camera.position.z + cameraSpeed <=
      Math.min(cameraBounds.bottomLeftCorner.z, cameraBounds.bottomRightCorner.z)
    ) {
      camera.position.z += cameraSpeed
    }
  }
  if (cameraMovingDirection.left) {
    if (camera.position.x - cameraSpeed >= cameraBounds.topLeftCorner.x) {
      camera.position.x -= cameraSpeed
    }
  }
  if (cameraMovingDirection.right) {
    if (camera.position.x + cameraSpeed <= cameraBounds.topRightCorner.x) {
      camera.position.x += cameraSpeed
    }
  }
}
