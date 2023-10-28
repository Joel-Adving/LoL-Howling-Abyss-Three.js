import * as CANNON from 'cannon-es'
import { BoxGeometry, Euler, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { Scene } from './scene'

export let physicsWorld: CANNON.World

export function PhysicsWorld() {
  if (!physicsWorld) {
    physicsWorld = newPhysicsWorld()
  }
  return physicsWorld
}

function newPhysicsWorld() {
  return new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })
}

export function initPhysicsScene() {
  const rot45Deg = new Euler(0, Math.PI / 4, 0)
  createColliderBox({ x: -4, y: 1.5, z: 0, width: 7, height: 6, depth: 0.1, rotation: rot45Deg })
  createColliderSphere({ x: 3, y: 0, z: -3.5, radius: 1.5 })
}

function createColliderBox({
  x,
  y,
  z,
  width,
  height,
  depth,
  rotation
}: {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  rotation?: Euler
}) {
  const box = new Mesh(new BoxGeometry(width, height, depth), new MeshBasicMaterial({ wireframe: true }))
  box.position.set(x, y, z)
  Scene().add(box)

  const halfExtents = new CANNON.Vec3(width / 2, height / 2, depth / 2)
  const boxShape = new CANNON.Box(halfExtents)
  const boxBody = new CANNON.Body({ mass: 0 }) // mass 0 makes it static
  boxBody.addShape(boxShape)
  boxBody.position.set(x, y, z)
  if (rotation) {
    boxBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z)
    box.rotation.set(rotation.x, rotation.y, rotation.z)
  }
  PhysicsWorld().addBody(boxBody)
}

function createColliderSphere({ x, y, z, radius }: { x: number; y: number; z: number; radius: number }) {
  const sphere = new Mesh(new SphereGeometry(radius, 16, 16), new MeshBasicMaterial({ wireframe: true }))
  sphere.position.set(x, y, z)
  Scene().add(sphere)

  const sphereShape = new CANNON.Sphere(radius)
  const sphereBody = new CANNON.Body({ mass: 0 }) // mass 0 makes it static
  sphereBody.addShape(sphereShape)
  sphereBody.position.set(x, y, z)
  PhysicsWorld().addBody(sphereBody)
}
