"use client"

import { useSyncExternalStore } from "react"

/* ============================================================================
   SPRITE STORE

   Whether the character is out and about is one boolean, and three unrelated
   places need it: the runtime itself, the button on /fun, and the button in
   the footer. It is deliberately not React state — the character outlives
   every route change, so putting it in a provider would mean re-mounting him
   whenever the tree above him re-rendered.

   It persists, so he follows you across a reload the same way he follows you
   across a navigation.
   ========================================================================= */

const STORAGE_KEY = "sprite:awake"

let awake = false
let hydrated = false

const listeners = new Set<() => void>()

function emit() {
  for (const eachListener of listeners) eachListener()
}

/** Reads the stored value once, lazily, so nothing touches storage on the server. */
function hydrate() {
  if (hydrated) return
  hydrated = true

  try {
    awake = window.localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    // Private mode, storage disabled — he simply starts asleep.
    awake = false
  }
}

export function setSpriteAwake(next: boolean) {
  hydrate()
  if (awake === next) return

  awake = next

  try {
    window.localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    // Not being able to remember it is not a reason to refuse to do it.
  }

  emit()
}

export function getSpriteAwake() {
  hydrate()
  return awake
}

export function toggleSpriteAwake() {
  hydrate()
  setSpriteAwake(!awake)
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function getSnapshot() {
  hydrate()
  return awake
}

/* The server has no idea and must not guess — he always renders asleep and
   appears on hydration if that is what the browser remembered. */
function getServerSnapshot() {
  return false
}

export function useSpriteAwake() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
