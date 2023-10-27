import { createSignal } from 'solid-js'

export const [isPaused, setIsPaused] = createSignal(true)
export const [hasLoaded, setHasLoaded] = createSignal(false)
export const [warning, setWarning] = createSignal<HTMLElement>()
export const [started, setStarted] = createSignal(false)
