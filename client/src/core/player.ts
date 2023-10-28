import * as CANNON from 'cannon-es'
import { Mesh, Vector3 } from 'three'
import { Camera } from './camera'
import { PhysicsWorld } from './physics'
import { animations, currentAnimation, setCurrentAnimation } from './animations'

export type PlayerType = {
  model: Mesh
  collider: CANNON.Body
  movementSpeed: number
  isMoving: boolean
  target: Vector3 | null
  intermediatePos: Vector3
}

let player: PlayerType

export function Player() {
  if (!player) {
    player = newPlayer()
  }
  return player
}

export function newPlayer() {
  const collider = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(0.5),
    material: new CANNON.Material()
  })
  collider.position.set(0, 0.5, 0)
  collider.linearDamping = 0
  PhysicsWorld().addBody(collider)

  //   Uncomment to see collider
  //
  //   const sphere = new Mesh(new SphereGeometry(0.5, 32, 32), new MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
  //   Scene().add(sphere)
  //   addToLoop(() => {
  //     sphere.position.set(collider.position.x, collider.position.y, collider.position.z)
  //   })

  return {
    model: new Mesh(),
    collider,
    movementSpeed: 0.0017,
    isMoving: false,
    target: null,
    intermediatePos: new Vector3()
  }
}

export function lockCameraToPlayerPosition() {
  const player = Player()
  const camera = Camera()
  camera.position.x = player.model.position.x
  camera.position.z = player.model.position.z + 5
}

export function playerUpdate() {
  const player = Player()

  if (player.target) {
    const dir = new CANNON.Vec3(
      player.target.x - player.collider.position.x,
      player.target.y - player.collider.position.y,
      player.target.z - player.collider.position.z
    ).unit()

    const distanceToTarget = player.target.distanceTo(
      new Vector3(player.collider.position.x, 0, player.collider.position.z)
    )

    if (distanceToTarget < 0.4) {
      player.collider.velocity.set(0, 0, 0)
      player.target = null
      if (currentAnimation === 'run') {
        animations.get('idle')?.reset().play()
        animations.get('run')?.fadeOut(0.2)
        setCurrentAnimation('idle')
      }
    } else {
      const moveSpeed = player.movementSpeed * 1000
      player.collider.velocity.set(dir.x * moveSpeed, dir.y * moveSpeed, dir.z * moveSpeed)
      if (currentAnimation === 'idle') {
        animations.get('run')?.reset().play()
        animations.get('idle')?.fadeOut(0.2)
        setCurrentAnimation('run')
      }
    }
  } else {
    player.collider.velocity.set(0, 0, 0)
    if (currentAnimation === 'run') {
      animations.get('idle')?.reset().play()
      animations.get('run')?.fadeOut(0.2)
      setCurrentAnimation('idle')
    }
  }

  player.model.position.set(player.collider.position.x, player.collider.position.y - 0.5, player.collider.position.z)
}
