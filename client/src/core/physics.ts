import * as CANNON from 'cannon-es'
import { BoxGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { Scene } from './scene'
import { Player } from './player'

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
  const groundMaterial = new CANNON.Material()
  const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), material: groundMaterial })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  groundBody.position.set(25, 0.05, -25)
  physicsWorld.addBody(groundBody)

  const playerGroundContact = new CANNON.ContactMaterial(Player().collider.material!, groundMaterial, {
    friction: 1.0,
    restitution: 0.0
  })
  physicsWorld.addContactMaterial(playerGroundContact)

  const baseRotatin = new Euler(0, Math.PI / 4.09, 0)

  const turretDimension = {
    y: 1.7,
    width: 0.8,
    depth: 0.8,
    height: 3,
    rotation: baseRotatin
  }

  // spawn platform
  createColliderBox({ x: -1, y: 0, z: 0.5, width: 5, height: 0.55, depth: 3.25, rotation: baseRotatin })
  // spawn platform 2
  createColliderBox({ x: -0.7, y: 0, z: 0.1, width: 6, height: 0.35, depth: 4, rotation: baseRotatin })
  // fontain back wall
  createColliderBox({ x: -3, y: 1.5, z: 3, width: 0.1, height: 6, depth: 5, rotation: baseRotatin })
  // fontain right diagonal wall
  createColliderBox({ x: 2, y: 1.5, z: 4, width: 0.1, height: 6, depth: 10, rotation: new Euler(0, Math.PI / 2.09, 0) })
  // fontain left wall
  createColliderBox({ x: -4, y: 1.5, z: 0, width: 7, height: 6, depth: 0.1, rotation: baseRotatin })
  // fontain left diagonal wall
  createColliderBox({
    x: -1.8,
    y: 1.5,
    z: -6.2,
    width: 7.5,
    height: 6,
    depth: 0.1,
    rotation: new Euler(0, Math.PI / 1.9, 0)
  })

  // base left wall
  createColliderBox({ x: 1, y: 1.5, z: -12, width: 8, height: 6, depth: 0.1, rotation: baseRotatin })
  // base left diagonal wall
  createColliderBox({
    x: 5,
    y: 1.5,
    z: -14,
    width: 5,
    height: 6,
    depth: 0.1,
    rotation: new Euler(0, Math.PI / 1.05, 0)
  })

  // base right wall
  createColliderBox({ x: 11, y: 1.5, z: 0, width: 12, height: 6, depth: 0.1, rotation: baseRotatin })
  // base right diagonal wall
  createColliderBox({
    x: 14,
    y: 1.5,
    z: -5,
    width: 5,
    height: 6,
    depth: 0.1,
    rotation: new Euler(0, Math.PI / -2.4, 0)
  })

  // nexus
  createColliderSphere({ x: 3, y: 1, z: -3.5, radius: 1.45 })
  // inhibs
  createColliderSphere({ x: 9.1, y: 1, z: -9.5, radius: 1 })
  // turrets
  createColliderBox({ x: -3.3, z: 2.6, ...turretDimension })
  createColliderBox({ x: 3.7, z: -6.4, ...turretDimension })
  createColliderBox({ x: 5.95, z: -4.1, ...turretDimension })
  createColliderBox({ x: 12.55, z: -12.8, ...turretDimension })
  createColliderBox({ x: 18.1, z: -18.15, ...turretDimension })

  // lane right wall
  createColliderBox({ x: 28, y: 1.5, z: -22, width: 41, height: 6, depth: 0.1, rotation: baseRotatin })
  // lane left wall
  createColliderBox({ x: 22.2, y: 1.5, z: -27.8, width: 41, height: 6, depth: 0.1, rotation: baseRotatin })
}

type ColliderProps = {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  rotation?: Euler
}

const material = new MeshBasicMaterial({ color: 0xff0000, wireframe: false, transparent: true, opacity: 0 })

function createColliderBox({ x, y, z, width, height, depth, rotation }: ColliderProps) {
  const box = new Mesh(new BoxGeometry(width, height, depth), material)
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
  const sphere = new Mesh(new SphereGeometry(radius, 16, 16), material)
  sphere.position.set(x, y, z)
  Scene().add(sphere)

  const sphereShape = new CANNON.Sphere(radius)
  const sphereBody = new CANNON.Body({ mass: 0 }) // mass 0 makes it static
  sphereBody.addShape(sphereShape)
  sphereBody.position.set(x, y, z)
  PhysicsWorld().addBody(sphereBody)
}

function createColliderCylinder({
  x,
  y,
  z,
  radius,
  height
}: {
  x: number
  y: number
  z: number
  radius: number
  height: number
}) {
  const cylinder = new Mesh(new CylinderGeometry(radius, radius, height, 16), material)
  cylinder.position.set(x, y, z)
  Scene().add(cylinder)

  const cylinderShape = new CANNON.Cylinder(radius, radius, height, 16)
  const cylinderBody = new CANNON.Body({ mass: 0 })
  cylinderBody.addShape(cylinderShape)
  cylinderBody.position.set(x, y, z)
  PhysicsWorld().addBody(cylinderBody)
}
