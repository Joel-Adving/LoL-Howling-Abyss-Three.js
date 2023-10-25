// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'
// @ts-ignore
import TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { Snowfall } from '../utils/snowParticles'
import { createSignal, onMount } from 'solid-js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createCursor } from '../utils/createMouseCursor'
import { convertMaterialToPhong } from '../utils/meshHelpers'
import { cloneGltf } from '../utils/cloneGltf'

export type CameraBounds = {
  topLeftCorner: THREE.Vector3
  topRightCorner: THREE.Vector3
  bottomLeftCorner: THREE.Vector3
  bottomRightCorner: THREE.Vector3
}

export default function Game() {
  const scene = new THREE.Scene()
  const gltfLoader = new GLTFLoader()
  const cubeTextureLoader = new THREE.CubeTextureLoader()
  const assets = new Map<string, any>()
  const mouseCursor = createCursor()
  const animations = new Map<string, THREE.AnimationAction>()
  const stats = new Stats()

  const [isPaused, setIsPaused] = createSignal(true)
  const [hasLoaded, setHasLoaded] = createSignal(false)
  const [warning, setWarning] = createSignal<HTMLElement>()
  const [started, setStarted] = createSignal(false)

  let container: HTMLElement | undefined = undefined
  let startBtn: HTMLElement | undefined = undefined
  let mixer: THREE.AnimationMixer | undefined = undefined

  let cameraSpeed = 0.125
  let cameraLocked = false
  let cameraMaxZoom = 1.85 // 1.715

  let mouseX = 0
  let mouseY = 0
  let mouseSpeed = 1.3
  let mouseIsAtEdge = false
  let edgeThreshold = 10

  let movementSpeed = 0.0017
  let isMoving = false

  let animFrameId = 0
  let lastFrameTime: null | number = null

  let playerChampion: any = null
  let currentTween: any = null

  const cameraDirection = {
    up: false,
    down: false,
    left: false,
    right: false
  }

  const cameraBounds = {
    topLeftCorner: new THREE.Vector3(-2.7, 0, -51),
    topRightCorner: new THREE.Vector3(55.5, 0, 0),
    bottomLeftCorner: new THREE.Vector3(0, 0, 7.5),
    bottomRightCorner: new THREE.Vector3(0, 0, 30)
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = 1
  renderer.toneMappingExposure = 2.5

  const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000.0)
  camera.zoom = cameraMaxZoom
  camera.updateProjectionMatrix()
  scene.add(camera)

  const snowfall = new Snowfall(3500, cameraBounds)
  scene.add(snowfall.particles)

  const hemisphereLight = new THREE.HemisphereLight('#0a9df2', 'black', 2)
  scene.add(hemisphereLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
  directionalLight.shadow.mapSize.set(1024, 1024)
  directionalLight.castShadow = true
  directionalLight.position.set(-3, 7, -3)
  directionalLight.shadow.normalBias = 0.05
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 1000
  directionalLight.shadow.camera.left = -20
  directionalLight.shadow.camera.right = 20
  directionalLight.shadow.camera.top = 20
  directionalLight.shadow.camera.bottom = -20
  directionalLight.shadow.camera.updateProjectionMatrix()
  scene.add(directionalLight)

  const transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  const mainPlane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), transparentMaterial)
  mainPlane.rotation.x = -Math.PI / 2
  mainPlane.position.y = 0.2
  scene.add(mainPlane)

  const rotation = new THREE.Euler(-Math.PI / 2, 0, Math.PI / 4.09)
  const walkablePlane = new THREE.Mesh(new THREE.PlaneGeometry(80, 7.9), transparentMaterial)
  walkablePlane.position.set(25.2, 0.1, -25)
  walkablePlane.rotation.set(rotation.x, rotation.y, rotation.z)
  walkablePlane.name = 'WalkableArea'
  scene.add(walkablePlane)

  const walkablePlane2 = new THREE.Mesh(new THREE.PlaneGeometry(17, 16), transparentMaterial)
  walkablePlane2.position.set(4, 0.1, -4)
  walkablePlane2.rotation.set(rotation.x, rotation.y, rotation.z)
  walkablePlane2.name = 'WalkableArea'
  scene.add(walkablePlane2)

  const walkablePlane3 = new THREE.Mesh(new THREE.PlaneGeometry(17, 16), transparentMaterial)
  walkablePlane3.position.set(46.5, 0.1, -46)
  walkablePlane3.rotation.set(rotation.x, rotation.y, rotation.z)
  walkablePlane3.name = 'WalkableArea'
  scene.add(walkablePlane3)

  const nonWalkablePlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), transparentMaterial)
  nonWalkablePlane.position.set(3, 0.2, -3.5)
  nonWalkablePlane.rotation.set(rotation.x, rotation.y, rotation.z)
  nonWalkablePlane.name = 'NonWalkableArea'
  scene.add(nonWalkablePlane)

  const ambience = new Audio('/assets/sounds/ambience.mp3')
  const soundtrack = new Audio('/assets/sounds/soundtrack.mp3')
  ambience.loop = true
  ambience.volume = 0.25
  soundtrack.loop = true
  soundtrack.volume = 0.09

  async function loadAssets() {
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

  async function setupScene() {
    await loadAssets()

    playerChampion = assets.get('nidalee')
    const champScene = playerChampion.value.scene
    champScene.scale.set(0.007, 0.007, 0.007)
    champScene.position.set(0, 0.3, 0)
    traverseGltf(champScene, { castShadow: true, receiveShadow: true })
    scene.add(champScene)

    mixer = new THREE.AnimationMixer(champScene)
    const runClip = THREE.AnimationClip.findByName(playerChampion.value.animations, 'Run')
    const idleClip = THREE.AnimationClip.findByName(playerChampion.value.animations, 'idle1.pie_c_11_9')
    const runAction = mixer.clipAction(runClip)
    const idleAction = mixer.clipAction(idleClip)
    animations.set('run', runAction)
    animations.set('idle', idleAction)
    idleAction.play()

    const envMap = assets.get('cube-map')
    scene.background = envMap.value
    scene.environment = envMap.value
    scene.fog = new THREE.FogExp2('#3a77bd', 0.009)

    const nexus = assets.get('nexus').value.scene as THREE.Mesh
    nexus.scale.set(0.005, 0.005, 0.005)
    nexus.position.set(3, 0, -3.5)
    nexus.scale.z *= -1
    traverseGltf(nexus, { castShadow: true, receiveShadow: true })
    scene.add(nexus)

    const inhib = assets.get('inhib').value.scene as THREE.Mesh
    inhib.scale.set(0.005, 0.005, 0.005)
    inhib.position.set(9.1, 0, -9.5)
    inhib.rotation.y = Math.PI / 0.31
    inhib.scale.z *= -1
    traverseGltf(inhib, { castShadow: true, receiveShadow: true })
    scene.add(inhib)

    const turret = assets.get('orderTurret').value
    turret.scene.scale.set(4, 4, 4)
    turret.scene.scale.z *= -1
    turret.scene.rotation.y = Math.PI / 0.57
    traverseGltf(turret.scene, { castShadow: true, receiveShadow: true })

    const spawnTurret1 = cloneGltf(turret).scene
    spawnTurret1.position.set(-3.3, 0, 2.6)
    const nexusTurret1 = cloneGltf(turret).scene
    nexusTurret1.position.set(3.7, 0, -6.4)
    const nexusTurret2 = cloneGltf(turret).scene
    nexusTurret2.position.set(5.95, 0, -4.1)
    const laneTurret1 = cloneGltf(turret).scene
    laneTurret1.position.set(12.55, 0, -12.8)
    const laneTurret2 = cloneGltf(turret).scene
    laneTurret2.position.set(18.1, 0, -18.15)
    scene.add(spawnTurret1, nexusTurret1, nexusTurret2, laneTurret1, laneTurret2)

    const aramMap = assets.get('aram-map')
    aramMap.value.scene.scale.set(0.005, 0.005, 0.005)
    aramMap.value.scene.scale.z *= -1
    aramMap.value.scene.position.set(-6.5, 1, 6.5)
    traverseGltf(aramMap.value.scene, { receiveShadow: true })
    scene.add(aramMap.value.scene)
  }

  function traverseGltf(scene: any, { castShadow = false, receiveShadow = false } = {}) {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material.map) {
          child.material.map.minFilter = THREE.LinearMipMapLinearFilter
          child.material.map.magFilter = THREE.LinearFilter
          child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
        }
        if (child.material.normalMap) {
          child.material.normalMap.minFilter = THREE.LinearMipMapLinearFilter
          child.material.normalMap.magFilter = THREE.LinearFilter
          child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
        }

        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material = convertMaterialToPhong(child.material)
          child.castShadow = castShadow
          child.receiveShadow = receiveShadow
        }
      }
    })
  }

  function setCameraPosition() {
    if (cameraDirection.up) {
      if (camera.position.z - cameraSpeed >= cameraBounds.topLeftCorner.z) {
        camera.position.z -= cameraSpeed
      }
    }
    if (cameraDirection.down) {
      if (
        camera.position.z + cameraSpeed <=
        Math.min(cameraBounds.bottomLeftCorner.z, cameraBounds.bottomRightCorner.z)
      ) {
        camera.position.z += cameraSpeed
      }
    }
    if (cameraDirection.left) {
      if (camera.position.x - cameraSpeed >= cameraBounds.topLeftCorner.x) {
        camera.position.x -= cameraSpeed
      }
    }
    if (cameraDirection.right) {
      if (camera.position.x + cameraSpeed <= cameraBounds.topRightCorner.x) {
        camera.position.x += cameraSpeed
      }
    }
  }

  function resetCameraDirection() {
    cameraDirection.up = false
    cameraDirection.down = false
    cameraDirection.left = false
    cameraDirection.right = false
  }

  function updateLightPos() {
    directionalLight.position.set(camera.position.x - 3, camera.position.y + 7, camera.position.z - 3)
    directionalLight.target.position.set(camera.position.x, camera.position.y, camera.position.z)
    directionalLight.target.updateMatrixWorld()
  }

  function frame(time: number) {
    if (lastFrameTime === null) lastFrameTime = time
    const delta = (time - lastFrameTime) / 1000
    step(delta)
    lastFrameTime = time
    animFrameId = requestAnimationFrame(frame)
  }

  function step(delta: number) {
    if (mouseIsAtEdge) {
      setCameraPosition()
    }
    if (cameraLocked) {
      camera.position.x = playerChampion.value.scene.position.x
      camera.position.z = playerChampion.value.scene.position.z + 5
    }
    TWEEN.update()
    snowfall.update()
    updateLightPos()
    mixer?.update(delta * (movementSpeed * 500))
    renderer.render(scene, camera)
    stats.update()
  }

  function initialSceneState() {
    const angleInDegrees = 56.75
    const angleInRadians = angleInDegrees * (Math.PI / 180)
    camera.rotation.x = -angleInRadians
    camera.position.set(0, 8, 5)
    lastFrameTime = null
  }

  function start() {
    initialSceneState()
    if (WebGL.isWebGLAvailable()) {
      requestAnimationFrame(frame)
    } else {
      setWarning(WebGL.getWebGLErrorMessage())
    }
  }

  function handlePressStart() {
    if (!started()) {
      start()
      setStarted(true)
      ambience.play()
      soundtrack.play()
    }
    setIsPaused(false)
  }

  function initEventListeners() {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPaused((prev) => !prev)
      }
      if (e.key === ' ') {
        cameraLocked = true
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === ' ') {
        cameraLocked = false
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function handlePointerLockChange(e: Event) {
      if (document.pointerLockElement !== container) {
        mouseCursor.style.transform = 'translate(0, 0)'
      }
    }

    function handleScroll(e: WheelEvent) {
      if (e.deltaY > 0) {
        if (camera.zoom <= cameraMaxZoom + 0.1) return
        camera.zoom -= 0.2
      } else {
        if (camera.zoom > 4) return
        camera.zoom += 0.2
      }
      camera.updateProjectionMatrix()
    }

    function handleMouseMove(e: MouseEvent) {
      if (document.pointerLockElement === container) {
        mouseX += e.movementX * mouseSpeed
        mouseY += e.movementY * mouseSpeed
        mouseX = Math.min(Math.max(mouseX, 0), container.clientWidth)
        mouseY = Math.min(Math.max(mouseY, 0), container.clientHeight)
        mouseCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`

        resetCameraDirection()

        mouseIsAtEdge =
          mouseX <= edgeThreshold ||
          mouseY <= edgeThreshold ||
          mouseX >= container.clientWidth - edgeThreshold ||
          mouseY >= container.clientHeight - edgeThreshold

        if (!mouseIsAtEdge) return

        if (mouseX <= 0) {
          cameraDirection.left = true
        } else if (mouseX >= container!.clientWidth) {
          cameraDirection.right = true
        }

        if (mouseY <= 0) {
          cameraDirection.up = true
        } else if (mouseY >= container!.clientHeight) {
          cameraDirection.down = true
        }
      }
    }

    const walkableObjects = scene.children.filter((object) => object.name === 'WalkableArea')

    function handleClick(e: MouseEvent) {
      if (e.target === startBtn || (e.target === renderer.domElement && started())) {
        if (document.pointerLockElement !== container) {
          container!.requestPointerLock()
        }
        mouseX = e.clientX
        mouseY = e.clientY
        mouseCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }

      if (e.button === 2) {
        if (currentTween) {
          currentTween.stop()
        }

        const idleAction = animations.get('idle')
        const runAction = animations.get('run')
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        mouse.x = (mouseX / container!.clientWidth) * 2 - 1
        mouse.y = -(mouseY / container!.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)

        const walkableIntersects = raycaster.intersectObjects(walkableObjects)
        const mainPlaneIntersects = raycaster.intersectObjects([mainPlane])

        if (walkableIntersects.length > 0) {
          const intersect = walkableIntersects[0]
          const objectPosition = new THREE.Vector3()
          objectPosition.copy(intersect.point)
          objectPosition.y = 0.08
          playerChampion.value.scene.lookAt(objectPosition)
          const distance = objectPosition.distanceTo(playerChampion.value.scene.position)
          const duration = distance / movementSpeed

          currentTween = new TWEEN.Tween(playerChampion.value.scene.position)
            .to(objectPosition, duration)
            .onUpdate((objectPosition: any) => {
              playerChampion.value.scene.position.copy(objectPosition)
            })
            .onComplete(() => {
              currentTween = null
              isMoving = false
              idleAction?.reset().play()
              runAction?.fadeOut(0.2)
            })
            .start()

          if (!isMoving) {
            isMoving = true
            runAction?.reset().play()
            idleAction?.fadeOut(0.2)
          }
        } else {
          const objectPosition = new THREE.Vector3()
          objectPosition.copy(mainPlaneIntersects[0].point)
          objectPosition.y = 0.08
          playerChampion.value.scene.lookAt(objectPosition)
          currentTween = null
          isMoving = false
          idleAction?.reset().play()
          runAction?.fadeOut(0.2)
        }
      }
    }

    addEventListener('wheel', handleScroll)
    addEventListener('click', handleClick)
    addEventListener('resize', handleResize)
    addEventListener('keydown', handleKeyDown)
    addEventListener('keyup', handleKeyUp)
    container!.addEventListener('mousemove', handleMouseMove)
    container!.addEventListener('pointerlockchange', handlePointerLockChange)
  }

  onMount(() => {
    setupScene()
    initEventListeners()
    document.body.appendChild(stats.dom)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container!.appendChild(mouseCursor)
    container!.appendChild(renderer.domElement)
  })

  return (
    <div class="h-screen w-screen overflow-hidden relative bg-black text-xl font-BeaufortBold">
      {warning()}
      {isPaused() && (
        <div class="absolute inset-0 flex justify-center items-center">
          <div class="flex flex-col gap-6 z-30">
            <h1 class="text-white text-5xl">Howling Abyss</h1>
            <button
              ref={startBtn}
              disabled={!hasLoaded()}
              class="bg-blue-500 text-white py-2 rounded-lg shadow-xl max-w-fit px-6 w-full mx-auto"
              onClick={handlePressStart}
            >
              {hasLoaded() ? 'Play' : 'Loading...'}
            </button>
          </div>
          <img
            src="/assets/bg.webp"
            alt=""
            class="absolute inset-0 w-full h-full object-cover object-center opacity-70 blur-[7px] select-none"
          />
        </div>
      )}
      <div ref={container} class="absolute inset-0"></div>
    </div>
  )
}
