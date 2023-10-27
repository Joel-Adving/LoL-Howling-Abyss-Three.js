import { DirectionalLight, HemisphereLight, PerspectiveCamera } from 'three'
import { Scene } from './scene'

let directionalLight: DirectionalLight

export function setupLighting() {
  const scene = Scene()

  const hemisphereLight = new HemisphereLight('#0a9df2', 'black', 2)
  scene.add(hemisphereLight)

  directionalLight = new DirectionalLight(0xffffff, 2.5)
  directionalLight.shadow.mapSize.set(1024, 1024)
  directionalLight.castShadow = true
  directionalLight.position.set(-3, 7, -3)
  directionalLight.shadow.normalBias = 0.05
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 1000
  directionalLight.shadow.camera.left = -20
  directionalLight.shadow.camera.right = 20
  directionalLight.shadow.camera.top = 20
  directionalLight.shadow.camera.bottom = -20
  directionalLight.shadow.camera.updateProjectionMatrix()
  scene.add(directionalLight)
}

export function updateLightPos(camera: PerspectiveCamera) {
  directionalLight.position.set(camera.position.x - 3, camera.position.y + 7, camera.position.z - 3)
  directionalLight.target.position.set(camera.position.x, camera.position.y, camera.position.z)
  directionalLight.target.updateMatrixWorld()
}
