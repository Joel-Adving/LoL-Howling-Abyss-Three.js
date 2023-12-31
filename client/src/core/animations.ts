import { AnimationClip, AnimationMixer } from 'three'
import { assets } from './assets'

export const animations = new Map<string, THREE.AnimationAction>()
export let animationMixer: AnimationMixer

export function initAnimations() {
  const playerChampion = assets.get('nidalee')
  const champScene = playerChampion.value.scene
  animationMixer = new AnimationMixer(champScene)
  const runClip = AnimationClip.findByName(playerChampion.value.animations, 'Run')
  const idleClip = AnimationClip.findByName(playerChampion.value.animations, 'idle1.pie_c_11_9')
  const runAction = animationMixer.clipAction(runClip)
  const idleAction = animationMixer.clipAction(idleClip)

  animations.set('run', runAction)
  animations.set('idle', idleAction)
  idleAction.play()
}

export let currentAnimation: 'idle' | 'run' = 'idle'

export function setCurrentAnimation(animation: 'idle' | 'run') {
  currentAnimation = animation
}
