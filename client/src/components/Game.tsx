import { createSignal, onMount } from 'solid-js'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'
import { createMouseElement } from '../utils/createMouseElement'

export default function Game() {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  const fontLoder = new FontLoader()
  const gltfLoader = new GLTFLoader()
  const entities: THREE.Object3D[] = []
  const assets = new Map<string, any>()

  const [isPaused, setIsPaused] = createSignal(true)
  const [hasLoaded, setHasLoaded] = createSignal(false)
  const [warning, setWarning] = createSignal<HTMLElement>()

  const mouseElement = createMouseElement()
  const cameraSpeed = 0.12
  let mouseIsAtEdge = false
  let mouseX = 0
  let mouseY = 0

  let container: HTMLElement | undefined = undefined
  let startBtn: HTMLElement | undefined = undefined

  let animFrameId = 0
  let lastFrameTime: null | number = null

  const cameraDirection: Record<string, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false
  }

  const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000.0)
  entities.push(camera)
  camera.zoom = 1.715
  camera.updateProjectionMatrix()

  //   const gridHelper = new THREE.GridHelper(20, 20)
  //   const axesHelper = new THREE.AxesHelper(5)
  //   entities.push(gridHelper, axesHelper)
  const stats = new Stats()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
  const dirLight = new THREE.DirectionalLight(0xffffff, 2)
  dirLight.position.set(0, 0, 1)
  entities.push(dirLight, ambientLight)

  function resetCameraDirection() {
    for (const key in cameraDirection) {
      cameraDirection[key] = false
    }
  }

  function setCameraPosition() {
    if (cameraDirection.up) {
      camera.position.z -= cameraSpeed
    }
    if (cameraDirection.down) {
      camera.position.z += cameraSpeed
    }
    if (cameraDirection.left) {
      camera.position.x -= cameraSpeed
    }
    if (cameraDirection.right) {
      camera.position.x += cameraSpeed
    }
  }

  async function loadAssets() {
    const [aramMap, font] = await Promise.allSettled([
      gltfLoader.loadAsync('/assets/aram-map/aram.gltf'),
      fontLoder.loadAsync(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json'
      )
    ])
    assets.set('aram-map', aramMap)
    assets.set('font', font)
    setHasLoaded(true)
  }

  async function addAssetsToScene() {
    await loadAssets()
    const aramMap = assets.get('aram-map')
    aramMap.value.scene.scale.set(0.005, 0.005, 0.005)
    // aramMap.value.scene.rotation.y = -Math.PI / 2
    // aramMap.value.scene.position.set(50, 0.1, -50)
    // mirror the map
    aramMap.value.scene.scale.z *= -1
    aramMap.value.scene.position.set(-6, 1, 9)
    entities.push(aramMap.value.scene)
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

  function pause() {
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
        pause()
      }
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function updateCustomCursor(e: MouseEvent) {
      if (document.pointerLockElement === container) {
        mouseX += e.movementX
        mouseY += e.movementY
        mouseX = Math.min(Math.max(mouseX, 0), container.clientWidth)
        mouseY = Math.min(Math.max(mouseY, 0), container.clientHeight)
        mouseElement.style.transform = `translate(${mouseX}px, ${mouseY}px)`

        resetCameraDirection()

        const edgeThreshold = 10
        mouseIsAtEdge =
          mouseX <= edgeThreshold ||
          mouseY <= edgeThreshold ||
          mouseX >= container.clientWidth - edgeThreshold ||
          mouseY >= container.clientHeight - edgeThreshold
      }

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

    function handlePointerLockChange(e: Event) {
      if (document.pointerLockElement !== container) {
        mouseElement.style.transform = 'translate(0, 0)'
      }
    }

    function handleClick(e: MouseEvent) {
      if (e.target === startBtn || e.target === renderer.domElement) {
        container!.requestPointerLock()
        mouseX = e.clientX
        mouseY = e.clientY
        mouseElement.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    addEventListener('wheel', (e) => {})
    addEventListener('click', handleClick)
    addEventListener('resize', handleResize)
    addEventListener('keydown', handleKeyDown)
    container!.addEventListener('mousemove', updateCustomCursor)
    container!.addEventListener('pointerlockchange', handlePointerLockChange)
  }

  onMount(() => {
    addAssetsToScene()
    initEventListeners()
    document.body.appendChild(stats.dom)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container!.appendChild(mouseElement)
    container!.appendChild(renderer.domElement)
  })

  return (
    <div class="h-screen w-screen overflow-hidden relative bg-black">
      {warning()}
      {isPaused() && (
        <div class="absolute inset-0 flex justify-center items-center z-10 bg-black">
          <button
            ref={startBtn}
            disabled={!hasLoaded()}
            class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
            onClick={handlePressStart}
          >
            {hasLoaded() ? 'Start' : 'Loading...'}
          </button>
        </div>
      )}
      <div ref={container} class="absolute inset-0"></div>
    </div>
  )
}
