import { LinearFilter, LinearMipMapLinearFilter, MeshBasicMaterial, Scene, WebGLRenderer } from 'three'
import { convertMaterialToPhong } from './meshHelpers'

export function traverseGltf(gltf: any, renderer: WebGLRenderer, { castShadow = false, receiveShadow = false } = {}) {
  gltf.traverse((child: any) => {
    if (child.isMesh) {
      if (child.material.map) {
        child.material.map.minFilter = LinearMipMapLinearFilter
        child.material.map.magFilter = LinearFilter
        child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
      }
      if (child.material.normalMap) {
        child.material.normalMap.minFilter = LinearMipMapLinearFilter
        child.material.normalMap.magFilter = LinearFilter
        child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
      }

      if (child.material instanceof MeshBasicMaterial) {
        child.material = convertMaterialToPhong(child.material)
        child.castShadow = castShadow
        child.receiveShadow = receiveShadow
      }
    }
  })
}
