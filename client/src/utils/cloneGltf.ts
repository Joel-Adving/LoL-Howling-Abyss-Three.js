import { Skeleton } from 'three'

export function cloneGltf(gltf: any) {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true)
  }

  const skinnedMeshes = {} as any

  gltf.scene.traverse((node: any) => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node
    }
  })

  const cloneBones = {} as any
  const cloneSkinnedMeshes = {} as any

  clone.scene.traverse((node: any) => {
    if (node.isBone) {
      cloneBones[node.name] = node
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node
    }
  })

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name]
    let skeleton

    if (skinnedMesh.skeleton) {
      skeleton = skinnedMesh.skeleton
    }

    const cloneSkinnedMesh = cloneSkinnedMeshes[name]
    const orderedCloneBones = []

    if (skeleton) {
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }
    }

    cloneSkinnedMesh.bind(new Skeleton(orderedCloneBones, skeleton), cloneSkinnedMesh.matrixWorld)
  }

  return clone
}
