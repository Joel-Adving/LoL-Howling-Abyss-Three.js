import * as CANNON from 'cannon-es'
import {
  BoxGeometry,
  Euler,
  FogExp2,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  Scene as THREE_Scene
} from 'three'
import { assets } from './assets'
import { cloneGltf } from './utils/cloneGltf'
import { traverseGltf } from './utils/traverseGltf'
import { Renderer } from './renderer'
import { Snowfall } from './particles/snowParticles'
import { Camera, cameraBounds } from './camera'
import { addToLoop } from './renderLoop'
import { initLighting } from './lighting'
import { Player } from './player'
import { PhysicsWorld } from './physics'

let scene: THREE_Scene

export function Scene() {
  if (!scene) {
    scene = new THREE_Scene()
  }
  return scene
}

export function initScene() {
  const scene = Scene()
  const renderer = Renderer()
  const physicsWorld = PhysicsWorld()
  const camera = Camera()
  scene.add(camera)

  initLighting()

  const player = Player()
  const playerGltf = assets.get('nidalee').value.scene
  traverseGltf(playerGltf, renderer, { castShadow: true, receiveShadow: true })
  player.model = playerGltf
  player.model.scale.set(0.007, 0.007, 0.007)
  player.model.position.set(0, 0.3, 0)
  scene.add(player.model)

  const snowfall = new Snowfall(3500, cameraBounds)
  addToLoop(() => snowfall.update())
  scene.add(snowfall.particles)

  const transparentMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0 })
  const mainPlane = new Mesh(new PlaneGeometry(80, 80), transparentMaterial)
  mainPlane.rotation.x = -Math.PI / 2
  mainPlane.position.set(25, 0.2, -25)
  mainPlane.name = 'ground'
  scene.add(mainPlane)

  const groundMaterial = new CANNON.Material()
  const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), material: groundMaterial })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  groundBody.position.set(25, 0, -25)
  physicsWorld.addBody(groundBody)

  const playerGroundContact = new CANNON.ContactMaterial(player.collider.material!, groundMaterial, {
    friction: 1.0, // High friction
    restitution: 0.0 // No bounciness
  })
  physicsWorld.addContactMaterial(playerGroundContact)

  const envMap = assets.get('cube-map')
  scene.background = envMap.value
  scene.environment = envMap.value
  scene.fog = new FogExp2('#3a77bd', 0.009)

  const nexus = assets.get('nexus').value.scene as THREE.Mesh
  nexus.scale.set(0.005, 0.005, 0.005)
  nexus.position.set(3, 0, -3.5)
  nexus.scale.z *= -1
  traverseGltf(nexus, renderer, { castShadow: true, receiveShadow: true })
  scene.add(nexus)

  const inhib = assets.get('inhib').value.scene as THREE.Mesh
  inhib.scale.set(0.005, 0.005, 0.005)
  inhib.position.set(9.1, 0, -9.5)
  inhib.rotation.y = Math.PI / 0.31
  inhib.scale.z *= -1
  traverseGltf(inhib, renderer, { castShadow: true, receiveShadow: true })
  scene.add(inhib)

  const turret = assets.get('orderTurret').value
  turret.scene.scale.set(4, 4, 4)
  turret.scene.scale.z *= -1
  turret.scene.rotation.y = Math.PI / 0.57
  traverseGltf(turret.scene, renderer, { castShadow: true, receiveShadow: true })

  const spawnTurret1 = cloneGltf(turret).scene
  spawnTurret1.position.set(-3.3, 0, 2.6)
  const nexusTurret1 = cloneGltf(turret).scene
  nexusTurret1.position.set(3.7, 0, -6.4)
  const nexusTurret2 = cloneGltf(turret).scene
  nexusTurret2.position.set(5.95, 0, -4.1)
  const laneTurret1 = cloneGltf(turret).scene
  laneTurret1.position.set(12.55, 0, -12.8)
  const laneTurret2 = cloneGltf(turret).scene
  laneTurret2.position.set(18.1, 0, -18.15)
  scene.add(spawnTurret1, nexusTurret1, nexusTurret2, laneTurret1, laneTurret2)

  const aramMap = assets.get('aram-map')
  aramMap.value.scene.scale.set(0.005, 0.005, 0.005)
  aramMap.value.scene.scale.z *= -1
  aramMap.value.scene.position.set(-6.5, 1, 6.5)
  traverseGltf(aramMap.value.scene, renderer, { receiveShadow: true })
  scene.add(aramMap.value.scene)
}
