"use client"

import { useEffect, useRef } from "react"
import styles from "./player.module.css"

/* ============================================================================
   THE PLATFORMER CHARACTER

   Every heading on this page is a one-way platform. Run along them, jump
   between them, and press S to drop through the one you are standing on.

   Notes on what makes this behave, since the naive version does not:

   - Platform rectangles are stored in PAGE coordinates (rect + scrollY), not
     viewport coordinates. Otherwise everything shifts the moment you scroll.
   - Collision is one-way and resolved on the DOWNWARD crossing only: you land
     when your feet cross a platform's top edge this frame having been above it
     last frame. That is what lets you jump up through a heading and still land
     on it coming down.
   - Movement is delta-timed off requestAnimationFrame, so the character moves
     at the same speed regardless of refresh rate.
   - Coyote time and jump buffering are in here because without them the jump
     feels broken even though the physics are "correct".
   ========================================================================= */

const WIDTH = 42
const HEIGHT = 64

const GRAVITY = 2600
const MOVE_SPEED = 320
const JUMP_VELOCITY = -820
const MAX_FALL = 1400
const COYOTE_TIME = 0.1
const JUMP_BUFFER = 0.12
const DROP_THROUGH_GRACE = 0.22

type platform = { left: number; right: number; top: number }

export default function Player() {
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (element === null) return

    // A keyboard platformer is not usable on touch, and it has no business
    // animating for someone who asked for reduced motion. Both are also hidden
    // in CSS, so nothing renders in those cases either.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    /* ---- State --------------------------------------------------------- */
    const state = {
      x: 40,
      y: 0,
      vx: 0,
      vy: 0,
      facing: 1 as 1 | -1,
      grounded: false,
      running: false,
      coyote: 0,
      jumpBuffer: 0,
      dropThrough: 0,
      awake: false,
    }

    const keys = { left: false, right: false, down: false }
    let platforms: platform[] = []

    /* ---- Platforms ------------------------------------------------------ */
    const measurePlatforms = () => {
      const found: platform[] = []
      const nodes = document.querySelectorAll<HTMLElement>("[data-platform-enabled]")

      nodes.forEach(eachNode => {
        const rect = eachNode.getBoundingClientRect()
        if (rect.width < 24 || rect.height === 0) return

        // Page coordinates, so scrolling does not invalidate them
        found.push({
          left: rect.left + window.scrollX,
          right: rect.right + window.scrollX,
          top: rect.top + window.scrollY,
        })
      })

      platforms = found
    }

    measurePlatforms()

    // Re-measure when the layout actually changes, not on every scroll frame
    const resizeObserver = new ResizeObserver(measurePlatforms)
    resizeObserver.observe(document.body)

    /* ---- Input ---------------------------------------------------------- */
    const wake = () => {
      if (state.awake) return
      state.awake = true

      // Drop in from the top of the current view the first time it is used
      state.x = window.scrollX + 60
      state.y = window.scrollY + 40
      measurePlatforms()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      // Never hijack typing
      const target = e.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      const key = e.key.toLowerCase()

      if (key === "a" || key === "arrowleft") {
        wake()
        keys.left = true
      } else if (key === "d" || key === "arrowright") {
        wake()
        keys.right = true
      } else if (key === "s" || key === "arrowdown") {
        wake()
        keys.down = true
      } else if (key === "w" || key === "arrowup" || key === " ") {
        wake()
        state.jumpBuffer = JUMP_BUFFER
        // Space and arrows scroll the page otherwise
        if (key === " " || key === "arrowup") e.preventDefault()
      } else {
        return
      }

      if (key === "arrowleft" || key === "arrowright" || key === "arrowdown") {
        e.preventDefault()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if (key === "a" || key === "arrowleft") keys.left = false
      else if (key === "d" || key === "arrowright") keys.right = false
      else if (key === "s" || key === "arrowdown") keys.down = false
      else if (key === "w" || key === "arrowup" || key === " ") {
        // Short hop: releasing early cuts the rise
        if (state.vy < 0) state.vy *= 0.45
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    /* ---- Loop ----------------------------------------------------------- */
    let frameId = 0
    let lastTime = performance.now()

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.032)
      lastTime = now

      if (!state.awake) {
        frameId = requestAnimationFrame(loop)
        return
      }

      const previousBottom = state.y + HEIGHT

      /* --- horizontal --- */
      const direction = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
      state.vx = direction * MOVE_SPEED
      if (direction !== 0) state.facing = direction as 1 | -1
      state.running = direction !== 0 && state.grounded

      state.x += state.vx * delta

      const pageWidth = document.documentElement.scrollWidth
      state.x = Math.max(0, Math.min(state.x, pageWidth - WIDTH))

      /* --- timers --- */
      if (state.jumpBuffer > 0) state.jumpBuffer -= delta
      if (state.coyote > 0) state.coyote -= delta
      if (state.dropThrough > 0) state.dropThrough -= delta

      /* --- jump --- */
      if (state.jumpBuffer > 0 && (state.grounded || state.coyote > 0)) {
        state.vy = JUMP_VELOCITY
        state.grounded = false
        state.coyote = 0
        state.jumpBuffer = 0
      }

      /* --- drop through the platform underfoot --- */
      if (keys.down && state.grounded) {
        state.dropThrough = DROP_THROUGH_GRACE
        state.grounded = false
        state.y += 2
      }

      /* --- vertical --- */
      state.vy = Math.min(state.vy + GRAVITY * delta, MAX_FALL)
      state.y += state.vy * delta

      const nextBottom = state.y + HEIGHT

      /* --- land on a platform, one way only ---
         Only while falling, and only when the feet crossed the top edge this
         frame. Rising through a heading is therefore always allowed. */
      let landed = false

      if (state.vy >= 0 && state.dropThrough <= 0) {
        for (const eachPlatform of platforms) {
          const overlapsX = state.x + WIDTH > eachPlatform.left && state.x < eachPlatform.right
          if (!overlapsX) continue

          const crossed = previousBottom <= eachPlatform.top + 1 && nextBottom >= eachPlatform.top

          if (crossed) {
            state.y = eachPlatform.top - HEIGHT
            state.vy = 0
            landed = true
            break
          }
        }
      }

      /* --- the bottom of the document is solid ground --- */
      const floor = document.documentElement.scrollHeight - HEIGHT - 4
      if (state.y >= floor) {
        state.y = floor
        state.vy = 0
        landed = true
      }

      if (landed) {
        state.grounded = true
        state.coyote = COYOTE_TIME
      } else {
        if (state.grounded) state.coyote = COYOTE_TIME
        state.grounded = false
      }

      /* --- paint --- */
      element.style.transform =
        `translate3d(${Math.round(state.x)}px, ${Math.round(state.y)}px, 0) scaleX(${state.facing})`
      element.dataset.grounded = String(state.grounded)
      element.dataset.running = String(state.running)

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    /* ---- Teardown ------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  return (
    <>
      <div
        ref={elementRef}
        className={styles.player}
        style={{ width: WIDTH, height: HEIGHT }}
        aria-hidden="true"
      />

      <p className={styles.hint}>
        <span className="label labelPlain labelSignal">Try this</span>
        <kbd>A</kbd><kbd>D</kbd> run
        <span>·</span>
        <kbd>W</kbd> jump
        <span>·</span>
        <kbd>S</kbd> drop through
        <span>·</span>
        every heading is a platform
      </p>
    </>
  )
}
