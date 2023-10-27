import { CapsuleGeometry, Mesh, MeshBasicMaterial, Vector3, type Object3DEventMap, Euler } from 'three'

export class Player {
  collider: Mesh<CapsuleGeometry, MeshBasicMaterial, Object3DEventMap>
  veolocity: Vector3
  direction: Vector3
  position: Vector3
  rotation: Euler
  playerRotationOder: string

  constructor() {
    this.collider = this.createCollider()
    this.veolocity = new Vector3()
    this.direction = new Vector3()
    this.position = new Vector3()
    this.rotation = new Euler()
    this.playerRotationOder = 'YXZ'
  }

  createCollider() {
    const geometry = new CapsuleGeometry(1, 1, 4, 8)
    const material = new MeshBasicMaterial({ color: 0x00ff00 })
    const capsule = new Mesh(geometry, material)
    return capsule
  }

  update() {}
}
