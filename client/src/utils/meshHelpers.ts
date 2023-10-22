import { MeshPhongMaterial, MultiplyOperation } from 'three'

export function convertMaterialToPhong(material: any) {
  return new MeshPhongMaterial({
    name: material.name,
    color: material.color,
    map: material.map,
    reflectivity: material.reflectivity,
    refractionRatio: material.refractionRatio,
    depthFunc: material.depthFunc,
    depthTest: material.depthTest,
    depthWrite: material.depthWrite,
    colorWrite: material.colorWrite,
    stencilWrite: material.stencilWrite,
    stencilWriteMask: material.stencilWriteMask,
    stencilFunc: material.stencilFunc,
    stencilRef: material.stencilRef,
    stencilFuncMask: material.stencilFuncMask,
    stencilFail: material.stencilFail,
    stencilZFail: material.stencilZFail,
    stencilZPass: material.stencilZPass,
    alphaTest: material.alphaTest,
    userData: material.userData,
    shininess: 10,
    specular: 0x111111,
    emissive: 0x000000,
    emissiveIntensity: 0,
    combine: MultiplyOperation
  })
}
