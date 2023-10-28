export type Mouse = {
  x: number
  y: number
  speed: number
  isAtEdge: boolean
  edgeThreshold: number
  element: HTMLImageElement
}

let mouse: Mouse

export function Mouse() {
  if (!mouse) {
    mouse = initMouse()
  }
  return mouse
}

function initMouse() {
  const element = document.createElement('img')
  element.src = '/assets/cursor.webp'
  element.id = 'mouse'
  element.style.zIndex = '999'
  element.width = 40
  element.height = 40
  element.style.pointerEvents = 'none'
  element.style.position = 'absolute'
  element.style.width = '40px'
  element.style.height = '40px'

  return {
    x: 0,
    y: 0,
    speed: 1.25,
    isAtEdge: false,
    edgeThreshold: 10,
    element: element
  }
}

export function setMouseX(x: number) {
  mouse.x = x
}

export function setMouseY(y: number) {
  mouse.y = y
}

export function setMouseSpeed(speed: number) {
  mouse.speed = speed
}

export function setMouseIsAtEdge(isAtEdge: boolean) {
  mouse.isAtEdge = isAtEdge
}

export function setEdgeThreshold(threshold: number) {
  mouse.edgeThreshold = threshold
}
