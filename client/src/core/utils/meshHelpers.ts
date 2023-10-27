import { MeshPhongMaterial, MultiplyOperation } from 'three'

export function convertMaterialToPhong(material: any) {
  return new MeshPhongMaterial({
    name: material.name,
    color: material.color,
    map: material.map,
    userData: material.userData,
    lightMap: material.lightMap,
    // depthFunc: material.depthFunc,
    // depthTest: material.depthTest,
    // depthWrite: material.depthWrite,
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
    shininess: 10,
    specular: 0x111111,
    emissive: 0x000000,
    reflectivity: material.reflectivity,
    refractionRatio: material.refractionRatio,
    combine: MultiplyOperation
  })
}
