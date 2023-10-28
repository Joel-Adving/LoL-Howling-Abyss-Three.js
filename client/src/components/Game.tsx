// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { onMount } from 'solid-js'
import { Mouse } from '../core/mouse'
import { Renderer } from '../core/renderer'
import { initScene } from '../core/scene'
import { loadAssets } from '../core/assets'
import { initAnimations } from '../core/animations'
import { initEventListeners } from '../core/eventListeners'
import { ambience, soundtrack } from '../core/audio'
import { addToLoop, startRenderLoop } from '../core/renderLoop'
import { hasLoaded, isPaused, setIsPaused, setStarted, setWarning, started, warning } from '../store'
import { initPhysicsScene } from '../core/physics'

export default function Game() {
  let startBtn: HTMLElement | undefined = undefined
  let container: HTMLElement | undefined = undefined

  onMount(async () => {
    await loadAssets()

    const stats = new Stats()

    addToLoop(() => stats.update())
    initScene()
    initPhysicsScene()
    initAnimations()
    initEventListeners({ container, startBtn })

    document.body.appendChild(stats.dom)
    Renderer().setSize(window.innerWidth, window.innerHeight)
    container!.appendChild(Mouse().element)
    container!.appendChild(Renderer().domElement)
  })

  function handleStart() {
    if (!started()) {
      if (WebGL.isWebGLAvailable()) {
        startRenderLoop()
      } else {
        setWarning(WebGL.getWebGLErrorMessage())
      }
      setStarted(true)
      ambience.play()
      soundtrack.play()
    }
    setIsPaused(false)
  }

  return (
    <div class="h-screen w-screen overflow-hidden relative bg-black text-xl font-BeaufortBold">
      {warning()}
      {isPaused() && (
        <div class="absolute inset-0 flex justify-center items-center">
          <div class="flex flex-col gap-6 z-30">
            <h1 class="text-white text-5xl">Howling Abyss</h1>
            <button
              id="start-btn"
              ref={startBtn}
              disabled={!hasLoaded()}
              class="bg-blue-500 text-white py-2 rounded-lg shadow-xl max-w-fit px-6 w-full mx-auto"
              onClick={handleStart}
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
