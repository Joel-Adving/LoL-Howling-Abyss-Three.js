import { setHasLoaded } from '../store'
import { cubeTextureLoader, gltfLoader } from './utils/loaders'

export const assets = new Map<string, any>()

export async function loadAssets() {
  const [cubeMap, aramMap, nexus, orderTurret, inhib, nidalee] = await Promise.allSettled([
    cubeTextureLoader
      .setPath('/assets/cube-maps/1/')
      .loadAsync(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']),
    gltfLoader.loadAsync('/assets/objects/aram-map/aram.gltf'),
    gltfLoader.loadAsync('/assets/objects/nexus/nexus.gltf'),
    gltfLoader.loadAsync('/assets/objects/turret/order/turret.gltf'),
    gltfLoader.loadAsync('/assets/objects/inhib/inhib.gltf'),
    gltfLoader.loadAsync('/assets/objects/champs/nidalee/nidalee.glb')
  ])
  assets.set('cube-map', cubeMap)
  assets.set('aram-map', aramMap)
  assets.set('nexus', nexus)
  assets.set('orderTurret', orderTurret)
  assets.set('inhib', inhib)
  assets.set('nidalee', nidalee)
  setHasLoaded(true)
}
