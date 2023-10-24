import * as THREE from 'three'
import type { CameraBounds } from '../components/Game'

export class Snowfall {
  particleCount: number
  particles: THREE.Group
  cameraBounds: CameraBounds

  constructor(particleCount: number, cameraBounds: CameraBounds) {
    this.cameraBounds = cameraBounds
    this.particleCount = particleCount
    this.particles = new THREE.Group()
    this.createParticles()
  }

  createParticles() {
    const snowflakeGeometry = new THREE.BufferGeometry()
    const snowflakeMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.0225
    })

    const positions = new Float32Array(this.particleCount * 3)
    const velocities = new Float32Array(this.particleCount * 3)

    for (let i = 0; i < this.particleCount; i++) {
      const x =
        Math.random() * (this.cameraBounds.topRightCorner.x - this.cameraBounds.topLeftCorner.x) +
        this.cameraBounds.topLeftCorner.x
      const y = Math.random() * 8
      const z =
        Math.random() * (this.cameraBounds.bottomLeftCorner.z - this.cameraBounds.topLeftCorner.z) +
        this.cameraBounds.topLeftCorner.z

      const index = i * 3
      positions[index] = x
      positions[index + 1] = y
      positions[index + 2] = z

      // Add random horizontal movement (drift)
      velocities[index] = Math.random() * 0.01 - 0.005
      velocities[index + 1] = 0 // No initial vertical velocity
      velocities[index + 2] = Math.random() * 0.01 - 0.005
    }

    snowflakeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    snowflakeGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

    this.particles.add(new THREE.Points(snowflakeGeometry, snowflakeMaterial))
  }

  update() {
    const snowflakes = this.particles.children[0] as THREE.Points
    const positions = snowflakes.geometry.attributes.position.array
    const velocities = snowflakes.geometry.attributes.velocity.array

    for (let i = 0; i < positions.length; i += 3) {
      // Update Y position (falling) and ensure it doesn't go below 0
      positions[i + 1] -= 0.005 // Adjust the snowfall speed as needed
      positions[i + 1] = Math.max(0, positions[i + 1])

      // Add random horizontal movement (drift)
      positions[i] += velocities[i]
      positions[i + 2] += velocities[i + 2]

      // Check if the snowflake is outside camera bounds, and reset it to the top
      if (
        positions[i] < this.cameraBounds.topLeftCorner.x ||
        positions[i] > this.cameraBounds.topRightCorner.x ||
        positions[i + 2] < this.cameraBounds.topLeftCorner.z ||
        positions[i + 2] > this.cameraBounds.bottomLeftCorner.z
      ) {
        positions[i] =
          Math.random() * (this.cameraBounds.topRightCorner.x - this.cameraBounds.topLeftCorner.x) +
          this.cameraBounds.topLeftCorner.x
        positions[i + 1] = 8
        positions[i + 2] =
          Math.random() * (this.cameraBounds.bottomLeftCorner.z - this.cameraBounds.topLeftCorner.z) +
          this.cameraBounds.topLeftCorner.z
      }
    }

    snowflakes.geometry.attributes.position.needsUpdate = true
  }
}
