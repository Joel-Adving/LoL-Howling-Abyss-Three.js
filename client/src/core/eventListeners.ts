import { Raycaster, Vector2, Vector3 } from 'three'
import { Camera, cameraMaxZoom, resetCameraMovingDirection, setCameraLocked, setCameraMovingDirection } from './camera'
import { Renderer } from './renderer'
import { setIsPaused, started } from '../store'
import { Scene } from './scene'
import { Mouse, setMouseIsAtEdge, setMouseX, setMouseY } from './mouse'
import { Player } from './player'

export function initEventListeners({ container, startBtn }: { container: any; startBtn: any }) {
  const renderer = Renderer()
  const scene = Scene()
  const camera = Camera()
  const mouse = Mouse()
  const player = Player()

  addEventListener('wheel', handleScroll)
  addEventListener('click', handleClick)
  addEventListener('resize', handleResize)
  addEventListener('keydown', handleKeyDown)
  addEventListener('keyup', handleKeyUp)
  container!.addEventListener('mousemove', handleMouseMove)
  container!.addEventListener('pointerlockchange', handlePointerLockChange)

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsPaused((prev) => !prev)
    }
    if (e.key === ' ') {
      setCameraLocked(true)
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === ' ') {
      setCameraLocked(false)
    }
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function handlePointerLockChange(e: Event) {
    if (document.pointerLockElement !== container) {
      mouse.element.style.transform = 'translate(0, 0)'
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
      setMouseX(mouse.x + e.movementX * mouse.speed)
      setMouseY(mouse.y + e.movementY * mouse.speed)
      setMouseX(Math.min(Math.max(mouse.x, 0), container.clientWidth))
      setMouseY(Math.min(Math.max(mouse.y, 0), container.clientHeight))
      mouse.element.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`

      resetCameraMovingDirection()

      setMouseIsAtEdge(
        mouse.x <= mouse.edgeThreshold ||
          mouse.y <= mouse.edgeThreshold ||
          mouse.x >= container.clientWidth - mouse.edgeThreshold ||
          mouse.y >= container.clientHeight - mouse.edgeThreshold
      )

      if (!mouse.isAtEdge) return

      if (mouse.x <= 0) {
        setCameraMovingDirection('left', true)
      } else if (mouse.x >= container!.clientWidth) {
        setCameraMovingDirection('right', true)
      }

      if (mouse.y <= 0) {
        setCameraMovingDirection('forward', true)
      } else if (mouse.y >= container!.clientHeight) {
        setCameraMovingDirection('back', true)
      }
    }
  }

  function handleClick(e: MouseEvent) {
    if (e.target === startBtn || (e.target === renderer.domElement && started())) {
      if (document.pointerLockElement !== container) {
        container!.requestPointerLock()
      }
      setMouseX(e.clientX)
      setMouseY(e.clientY)
      mouse.element.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`
    }

    if (e.button === 2) {
      const raycaster = new Raycaster()
      const mouseVec2 = new Vector2()
      mouseVec2.x = (mouse.x / container!.clientWidth) * 2 - 1
      mouseVec2.y = -(mouse.y / container!.clientHeight) * 2 + 1
      raycaster.setFromCamera(mouseVec2, camera)

      const ground = scene.children.find((object) => object.name === 'ground')!
      const groundIntersects = raycaster.intersectObjects([ground])

      if (groundIntersects.length > 0) {
        const clickedPoint = groundIntersects[0].point
        const target = new Vector3()
        target.copy(clickedPoint)

        player.model.lookAt(target.x, player.model.position.y, target.z)
        player.target = target
      }
    }
  }
}
