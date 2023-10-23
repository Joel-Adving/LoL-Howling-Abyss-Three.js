import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { createSignal, onMount } from 'solid-js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createCursor } from '../utils/createMouseCursor'
import { convertMaterialToPhong } from '../utils/meshHelpers'
// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'

export default function Game() {
  const scene = new THREE.Scene()
  const gltfLoader = new GLTFLoader()
  const entities: THREE.Object3D[] = []
  const assets = new Map<string, any>()
  const mouseCursor = createCursor()

  const [isPaused, setIsPaused] = createSignal(true)
  const [hasLoaded, setHasLoaded] = createSignal(false)
  const [warning, setWarning] = createSignal<HTMLElement>()

  let container: HTMLElement | undefined = undefined
  let startBtn: HTMLElement | undefined = undefined

  let cameraSpeed = 0.125
  let cameraLocked = false
  let cameraMaxZoom = 1.85

  let mouseX = 0
  let mouseY = 0
  let mouseIsAtEdge = false

  let animFrameId = 0
  let lastFrameTime: null | number = null

  const cameraDirection: Record<string, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false
  }

  const worldBounds = {
    topLeftCorner: new THREE.Vector3(-2.7, 0, -51),
    topRightCorner: new THREE.Vector3(55.5, 0, 0),
    bottomLeftCorner: new THREE.Vector3(0, 0, 7.5),
    bottomRightCorner: new THREE.Vector3(0, 0, 30)
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = 1
  renderer.toneMappingExposure = 2.5
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true

  const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000.0)
  camera.zoom = cameraMaxZoom
  camera.updateProjectionMatrix()
  entities.push(camera)

  const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x008080, 1.5)
  entities.push(hemisphereLight)

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
  entities.push(directionalLight)

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 'red' }))
  box.position.set(0, 0.5, 0)
  box.castShadow = true
  box.receiveShadow = true
  entities.push(box)

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
  )
  plane.rotation.x = -Math.PI / 2
  plane.position.y = 0.2
  entities.push(plane)

  const stats = new Stats()
  entities.push(stats)

  function resetCameraDirection() {
    for (const key in cameraDirection) {
      cameraDirection[key] = false
    }
  }

  function setCameraPosition() {
    if (cameraDirection.up) {
      if (camera.position.z - cameraSpeed >= worldBounds.topLeftCorner.z) {
        camera.position.z -= cameraSpeed
      }
    }
    if (cameraDirection.down) {
      if (
        camera.position.z + cameraSpeed <=
        Math.min(worldBounds.bottomLeftCorner.z, worldBounds.bottomRightCorner.z)
      ) {
        camera.position.z += cameraSpeed
      }
    }
    if (cameraDirection.left) {
      if (camera.position.x - cameraSpeed >= worldBounds.topLeftCorner.x) {
        camera.position.x -= cameraSpeed
      }
    }
    if (cameraDirection.right) {
      if (camera.position.x + cameraSpeed <= worldBounds.topRightCorner.x) {
        camera.position.x += cameraSpeed
      }
    }
  }

  async function loadAssets() {
    const [aramMap] = await Promise.allSettled([gltfLoader.loadAsync('/assets/aram-map/aram.gltf')])
    assets.set('aram-map', aramMap)
    setHasLoaded(true)
  }

  async function setUpAssets() {
    await loadAssets()

    const aramMap = assets.get('aram-map')
    aramMap.value.scene.scale.set(0.005, 0.005, 0.005)
    aramMap.value.scene.scale.z *= -1
    aramMap.value.scene.position.set(-6.5, 1, 6.5)
    aramMap.value.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material = convertMaterialToPhong(child.material)
          child.castShadow = true
          child.receiveShadow = true
        }
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
      }
    })

    entities.push(aramMap.value.scene)
  }

  function updateLightPos() {
    directionalLight.position.set(camera.position.x - 3, camera.position.y + 7, camera.position.z - 3)
    directionalLight.target.position.set(camera.position.x, camera.position.y, camera.position.z)
    directionalLight.target.updateMatrixWorld()
  }

  function frame(time: number) {
    if (lastFrameTime === null) lastFrameTime = time
    const delta = time - lastFrameTime
    step(delta)
    lastFrameTime = time
    animFrameId = requestAnimationFrame(frame)
  }

  function step(delta: number) {
    if (mouseIsAtEdge) {
      setCameraPosition()
    }
    if (cameraLocked) {
      camera.position.x = box.position.x
      camera.position.z = box.position.z + 5
    }
    updateLightPos()
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
    entities.forEach((entity) => scene.add(entity))
    initialSceneState()
    if (WebGL.isWebGLAvailable()) {
      requestAnimationFrame(frame)
    } else {
      setWarning(WebGL.getWebGLErrorMessage())
    }
  }

  function stop() {
    cancelAnimationFrame(animFrameId)
    scene.clear()
    renderer.render(scene, camera)
    setIsPaused(true)
  }

  function handlePressStart() {
    start()
    setIsPaused(false)
  }

  function initEventListeners() {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        stop()
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
        if (camera.zoom <= cameraMaxZoom) return
        camera.zoom -= 0.2
      } else {
        if (camera.zoom > 4) return
        camera.zoom += 0.2
      }
      camera.updateProjectionMatrix()
    }

    function handleMouseMove(e: MouseEvent) {
      if (document.pointerLockElement === container) {
        mouseX += e.movementX
        mouseY += e.movementY
        mouseX = Math.min(Math.max(mouseX, 0), container.clientWidth)
        mouseY = Math.min(Math.max(mouseY, 0), container.clientHeight)
        mouseCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`

        resetCameraDirection()

        const edgeThreshold = 10
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

    function handleClick(e: MouseEvent) {
      if (e.target === startBtn || e.target === renderer.domElement) {
        if (document.pointerLockElement !== container) {
          container!.requestPointerLock()
        }
        mouseX = e.clientX
        mouseY = e.clientY
        mouseCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }

      if (e.button === 2) {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        // Use your custom cursor position values mouseX and mouseY
        mouse.x = (mouseX / container!.clientWidth) * 2 - 1
        mouse.y = -(mouseY / container!.clientHeight) * 2 + 1

        // Set the raycaster from the camera
        raycaster.setFromCamera(mouse, camera)

        // Get intersections
        const intersects = raycaster.intersectObject(plane)
        if (intersects.length > 0) {
          const intersect = intersects[0]
          const objectPosition = new THREE.Vector3() // The position where the object will be placed

          // Set object position based on the intersection point on the ground plane
          objectPosition.copy(intersect.point)

          // Adjust object position to account for the camera's angle and position
          const angleInDegrees = 56.75
          const angleInRadians = angleInDegrees * (Math.PI / 180)

          const cameraHeight = 8 // The height of the camera above the ground

          const offset = new THREE.Vector3(0, cameraHeight / Math.tan(angleInRadians), 0)
          objectPosition.add(offset)

          box.position.copy(objectPosition)
          box.position.y = 0.5
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
    setUpAssets()
    initEventListeners()
    document.body.appendChild(stats.dom)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container!.appendChild(mouseCursor)
    container!.appendChild(renderer.domElement)
  })

  return (
    <div class="h-screen w-screen overflow-hidden relative bg-black">
      {warning()}
      {isPaused() && (
        <div class="absolute inset-0 flex justify-center items-center z-10 bg-black">
          <div class="flex flex-col gap-6">
            <h1 class="text-white text-xl">Press F11 for best experiance</h1>
            <button
              ref={startBtn}
              disabled={!hasLoaded()}
              class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-[10rem] w-full mx-auto"
              onClick={handlePressStart}
            >
              {hasLoaded() ? 'Start' : 'Loading...'}
            </button>
          </div>
        </div>
      )}
      <div ref={container} class="absolute inset-0"></div>
    </div>
  )
}
