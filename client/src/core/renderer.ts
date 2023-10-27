import { PCFSoftShadowMap, SRGBColorSpace, WebGLRenderer } from 'three'

let renderer: WebGLRenderer

export function Renderer() {
  if (!renderer) {
    renderer = new WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = 1
    renderer.toneMappingExposure = 2.5
  }
  return renderer
}
