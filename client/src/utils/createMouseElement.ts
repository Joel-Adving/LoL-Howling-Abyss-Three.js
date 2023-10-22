export function createMouseElement() {
  const mouseElement = document.createElement('img')
  mouseElement.src = '/assets/cursor.webp'
  mouseElement.id = 'mouse'
  mouseElement.style.zIndex = '999'
  mouseElement.width = 40
  mouseElement.height = 40
  mouseElement.style.pointerEvents = 'none'
  mouseElement.style.position = 'absolute'
  mouseElement.style.width = '40px'
  mouseElement.style.height = '40px'
  return mouseElement
}
