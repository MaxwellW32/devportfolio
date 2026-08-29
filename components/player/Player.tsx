"use client"

import { useEffect, useRef, useState } from "react"

import { setSpriteAwake, toggleSpriteAwake, useSpriteAwake } from "./spriteStore"
import styles from "./player.module.css"

/* ============================================================================
   THE CHARACTER

   He lives in the root layout, so he is not a feature of /fun any more — he
   walks the whole site.

   Two modes:

     WALK   gravity, A/D to run, W to jump, S to drop through the thing you
            are standing on. Headings, cards and buttons are one-way platforms.

     FLOAT  gravity off. WASD moves him in any direction and he simply stops
            where you leave him. While floating he is a cursor: whatever is
            under his chest gets outlined, and E follows it.

   Three things make this behave where the naive version does not:

   1. HE LIVES IN A FIXED, CLIPPED OVERLAY.
      The first version was absolutely positioned in the page, so walking right
      grew the document's scrollWidth, which grew the bound he was clamped to,
      which let him walk further right — the page extended forever and he fell
      off the bottom of it. Painting him inside `position: fixed; overflow:
      clip` means he cannot contribute to the scroll size at all, so the bounds
      are stable and the clamp actually holds.

   2. POSITION IS PAGE COORDINATES, PAINTED IN VIEWPORT COORDINATES.
      Platforms are measured as rect + scroll, so scrolling does not invalidate
      them. He is drawn at position-minus-scroll.

   3. COLLISION IS RESOLVED ON THE DOWNWARD CROSSING ONLY.
      You land when your feet cross a platform's top edge this frame having
      been above it last frame — which is what lets you jump up through a
      heading and still land on it coming down.
   ========================================================================= */

const WIDTH = 26
const HEIGHT = 40

const GRAVITY = 2300
const RUN_SPEED = 250
const FLOAT_SPEED = 330
const JUMP_VELOCITY = -690
const MAX_FALL = 1250
const COYOTE_TIME = 0.1
const JUMP_BUFFER = 0.12
const DROP_THROUGH_GRACE = 0.22

/** How often the platform list is rebuilt while he is awake. */
const REMEASURE_INTERVAL = 400

/** Anything matching this is a one-way platform. */
const PLATFORM_SELECTOR = [
  "[data-platform-enabled]",
  ".platform",
  "#main h1",
  "#main h2",
  "#main h3",
  "#main .card",
  "#main .btn",
].join(", ")

/** Anything matching this can be followed with E while floating. */
const TARGET_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "summary",
  '[role="button"]',
  "[data-sprite-target]",
].join(", ")

type platform = { left: number; right: number; top: number }

type mode = "walk" | "float"

export default function Player() {
  const awake = useSpriteAwake()

  // Shift+P summons or dismisses him from anywhere, including from asleep —
  // so this listener lives outside the runtime that only exists while awake.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.code !== "KeyP") return
      if (isTyping(e.target)) return

      e.preventDefault()
      toggleSpriteAwake()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  if (!awake) return null

  return <PlayerRuntime />
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

function PlayerRuntime() {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const spriteRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  // Only things a human reads live in React state — the loop never sets state.
  const [mode, modeSet] = useState<mode>("walk")
  const [targetLabel, targetLabelSet] = useState<string | null>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const sprite = spriteRef.current
    const ring = ringRef.current
    if (overlay === null || sprite === null || ring === null) return

    // A keyboard character is not usable on touch, and has no business
    // animating for someone who asked for reduced motion. The overlay is also
    // display:none in both cases, so nothing paints either.
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    /* ---- State --------------------------------------------------------- */
    const state = {
      x: window.scrollX + 64,
      y: window.scrollY + 24,
      vx: 0,
      vy: 0,
      facing: 1 as 1 | -1,
      grounded: false,
      running: false,
      coyote: 0,
      jumpBuffer: 0,
      dropThrough: 0,
      mode: "walk" as mode,
      /** Set while the page is a full-screen toy that wants the keyboard. */
      suspended: document.body.dataset.immersive === "true",
    }

    const keys = { left: false, right: false, up: false, down: false }
    let platforms: platform[] = []
    let target: Element | null = null
    let targetShownAs: string | null = null

    /* ---- Bounds -------------------------------------------------------- */
    // clientWidth excludes the scrollbar, which is exactly the walkable width.
    const pageWidth = () => document.documentElement.clientWidth
    const pageHeight = () =>
      Math.max(document.documentElement.scrollHeight, window.innerHeight)

    /* ---- Platforms ----------------------------------------------------- */
    const measurePlatforms = () => {
      const found: platform[] = []
      const nodes = document.querySelectorAll<HTMLElement>(PLATFORM_SELECTOR)

      nodes.forEach(eachNode => {
        if (eachNode.closest("[data-platform-disabled]") !== null) return
        if (overlay.contains(eachNode)) return

        const rect = eachNode.getBoundingClientRect()
        if (rect.width < 28 || rect.height === 0) return

        found.push({
          left: rect.left + window.scrollX,
          right: rect.right + window.scrollX,
          top: rect.top + window.scrollY,
        })
      })

      platforms = found
    }

    measurePlatforms()

    const resizeObserver = new ResizeObserver(measurePlatforms)
    resizeObserver.observe(document.body)

    // Reveal animations and route changes move things without resizing the
    // body, so a slow tick keeps the list honest without watching every node.
    const remeasureTimer = window.setInterval(() => {
      if (!state.suspended) measurePlatforms()
    }, REMEASURE_INTERVAL)

    /* ---- Immersive pages take the keyboard back ------------------------ */
    const bodyObserver = new MutationObserver(() => {
      state.suspended = document.body.dataset.immersive === "true"
      overlay.dataset.suspended = String(state.suspended)
      if (state.suspended) clearTarget()
    })

    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-immersive"] })
    overlay.dataset.suspended = String(state.suspended)

    /* ---- Targeting ----------------------------------------------------- */
    const clearTarget = () => {
      target = null
      ring.dataset.on = "false"
      if (targetShownAs !== null) {
        targetShownAs = null
        targetLabelSet(null)
      }
    }

    const updateTarget = () => {
      if (state.mode !== "float" || state.suspended) {
        clearTarget()
        return
      }

      const pointX = state.x - window.scrollX + WIDTH / 2
      const pointY = state.y - window.scrollY + HEIGHT * 0.4

      if (
        pointX < 0 ||
        pointY < 0 ||
        pointX > window.innerWidth ||
        pointY > window.innerHeight
      ) {
        clearTarget()
        return
      }

      // The overlay is pointer-events: none, but elementsFromPoint ignores
      // that, so its own nodes have to be skipped explicitly.
      const stack = document.elementsFromPoint(pointX, pointY)
      let found: Element | null = null

      for (const eachElement of stack) {
        if (overlay.contains(eachElement)) continue
        const hit = eachElement.closest(TARGET_SELECTOR)
        if (hit !== null) {
          found = hit
          break
        }
      }

      if (found === null) {
        clearTarget()
        return
      }

      target = found

      const rect = found.getBoundingClientRect()
      ring.dataset.on = "true"
      ring.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`
      ring.style.width = `${rect.width}px`
      ring.style.height = `${rect.height}px`

      const label = describeTarget(found)
      if (label !== targetShownAs) {
        targetShownAs = label
        targetLabelSet(label)
      }
    }

    const follow = () => {
      if (target === null) return

      if (target instanceof HTMLElement || target instanceof SVGElement) {
        // A real click, so a Next.js <Link> intercepts it and the navigation
        // stays client-side instead of reloading the document.
        ;(target as HTMLElement).click()
      }
    }

    /* ---- Input --------------------------------------------------------- */
    const onKeyDown = (e: KeyboardEvent) => {
      if (state.suspended || isTyping(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          keys.left = true
          break

        case "KeyD":
        case "ArrowRight":
          keys.right = true
          break

        case "KeyS":
        case "ArrowDown":
          keys.down = true
          break

        case "KeyW":
        case "ArrowUp":
        case "Space":
          keys.up = true
          state.jumpBuffer = JUMP_BUFFER
          break

        case "KeyF":
          state.mode = state.mode === "float" ? "walk" : "float"
          state.vy = 0
          state.grounded = false
          modeSet(state.mode)
          if (state.mode === "walk") clearTarget()
          break

        case "KeyE":
        case "Enter":
          if (state.mode === "float" && target !== null) {
            e.preventDefault()
            follow()
          }
          return

        case "Escape":
          setSpriteAwake(false)
          return

        default:
          return
      }

      // Arrows and space scroll the page, which fights the character
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          keys.left = false
          break

        case "KeyD":
        case "ArrowRight":
          keys.right = false
          break

        case "KeyS":
        case "ArrowDown":
          keys.down = false
          break

        case "KeyW":
        case "ArrowUp":
        case "Space":
          keys.up = false
          // Short hop: releasing early cuts the rise
          if (state.mode === "walk" && state.vy < 0) state.vy *= 0.45
          break
      }
    }

    // Held keys would stick down forever if focus left mid-press
    const releaseAll = () => {
      keys.left = false
      keys.right = false
      keys.up = false
      keys.down = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", releaseAll)

    /* ---- Camera -------------------------------------------------------- */
    // He is only worth following while he is actually moving. Otherwise the
    // page would yank itself back every time you tried to scroll past him.
    const followCamera = () => {
      const viewTop = state.y - window.scrollY
      const margin = Math.min(180, window.innerHeight * 0.3)

      let delta = 0
      if (viewTop < margin) delta = viewTop - margin
      else if (viewTop + HEIGHT > window.innerHeight - margin) {
        delta = viewTop + HEIGHT - (window.innerHeight - margin)
      }

      if (delta !== 0) {
        window.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior })
      }
    }

    /* ---- Loop ---------------------------------------------------------- */
    let frameId = 0
    let lastTime = performance.now()

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.032)
      lastTime = now
      frameId = requestAnimationFrame(loop)

      if (state.suspended) return

      const previousBottom = state.y + HEIGHT

      /* --- horizontal --- */
      const horizontal = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
      const speed = state.mode === "float" ? FLOAT_SPEED : RUN_SPEED

      state.vx = horizontal * speed
      if (horizontal !== 0) state.facing = horizontal as 1 | -1
      state.x += state.vx * delta

      /* --- timers --- */
      if (state.jumpBuffer > 0) state.jumpBuffer -= delta
      if (state.coyote > 0) state.coyote -= delta
      if (state.dropThrough > 0) state.dropThrough -= delta

      /* --- vertical --- */
      if (state.mode === "float") {
        // No gravity: he goes where you point him and stays there.
        const vertical = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
        state.vy = vertical * FLOAT_SPEED
        state.grounded = false
        state.running = horizontal !== 0
        state.y += state.vy * delta
      } else {
        if (state.jumpBuffer > 0 && (state.grounded || state.coyote > 0)) {
          state.vy = JUMP_VELOCITY
          state.grounded = false
          state.coyote = 0
          state.jumpBuffer = 0
        }

        // Drop through the platform underfoot
        if (keys.down && state.grounded) {
          state.dropThrough = DROP_THROUGH_GRACE
          state.grounded = false
          state.y += 2
        }

        state.running = horizontal !== 0 && state.grounded
        state.vy = Math.min(state.vy + GRAVITY * delta, MAX_FALL)
        state.y += state.vy * delta

        /* --- land on a platform, one way only --- */
        const nextBottom = state.y + HEIGHT
        let landingTop: number | null = null

        if (state.vy >= 0 && state.dropThrough <= 0) {
          for (const eachPlatform of platforms) {
            const overlapsX =
              state.x + WIDTH > eachPlatform.left && state.x < eachPlatform.right
            if (!overlapsX) continue

            const crossed =
              previousBottom <= eachPlatform.top + 1 && nextBottom >= eachPlatform.top
            if (!crossed) continue

            // Several platforms can be crossed in one frame — the surface he
            // actually meets is the highest of them.
            if (landingTop === null || eachPlatform.top < landingTop) {
              landingTop = eachPlatform.top
            }
          }
        }

        if (landingTop !== null) {
          state.y = landingTop - HEIGHT
          state.vy = 0
          state.grounded = true
          state.coyote = COYOTE_TIME
        } else {
          if (state.grounded) state.coyote = COYOTE_TIME
          state.grounded = false
        }
      }

      /* --- the page is a box, and he stays inside it --- */
      const maxX = Math.max(0, pageWidth() - WIDTH)
      const maxY = Math.max(0, pageHeight() - HEIGHT - 2)

      if (state.x < 0) state.x = 0
      else if (state.x > maxX) state.x = maxX

      if (state.y < 0) {
        state.y = 0
        if (state.vy < 0) state.vy = 0
      } else if (state.y > maxY) {
        state.y = maxY
        state.vy = 0
        if (state.mode === "walk") {
          state.grounded = true
          state.coyote = COYOTE_TIME
        }
      }

      /* --- camera --- */
      if (state.vx !== 0 || state.vy !== 0) followCamera()

      /* --- paint --- */
      const drawX = Math.round(state.x - window.scrollX)
      const drawY = Math.round(state.y - window.scrollY)

      sprite.style.transform = `translate3d(${drawX}px, ${drawY}px, 0)`
      sprite.dataset.facing = state.facing === 1 ? "right" : "left"
      sprite.dataset.grounded = String(state.grounded)
      sprite.dataset.running = String(state.running)
      sprite.dataset.mode = state.mode

      updateTarget()
    }

    frameId = requestAnimationFrame(loop)

    /* ---- Teardown ------------------------------------------------------ */
    return () => {
      cancelAnimationFrame(frameId)
      window.clearInterval(remeasureTimer)
      resizeObserver.disconnect()
      bodyObserver.disconnect()
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", releaseAll)
    }
  }, [])

  return (
    <div ref={overlayRef} className={styles.overlay} data-sprite-overlay>
      <div ref={ringRef} className={styles.ring} data-on="false" aria-hidden="true" />

      <div
        ref={spriteRef}
        className={styles.sprite}
        style={{ width: WIDTH, height: HEIGHT }}
        data-mode="walk"
        aria-hidden="true"
      />

      <div className={styles.hud} data-mode={mode}>
        <span className={styles.hudMode}>{mode === "float" ? "Floating" : "Walking"}</span>

        <span className={styles.hudKeys}>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          {mode === "float" ? " move" : " run · jump · drop"}
        </span>

        <span className={styles.hudSep}>·</span>

        <span className={styles.hudKeys}>
          <kbd>F</kbd> {mode === "float" ? "land" : "float"}
        </span>

        {mode === "float" && (
          <>
            <span className={styles.hudSep}>·</span>
            <span className={styles.hudKeys} data-armed={targetLabel !== null}>
              <kbd>E</kbd> {targetLabel === null ? "nothing under him" : targetLabel}
            </span>
          </>
        )}

        <span className={styles.hudSep}>·</span>

        <button
          type="button"
          className={styles.hudClose}
          onClick={() => setSpriteAwake(false)}
        >
          <kbd>Esc</kbd> dismiss
        </button>
      </div>
    </div>
  )
}

/** A short, human name for whatever he is hovering. */
function describeTarget(element: Element) {
  // A card link's textContent runs its label, heading and blurb together into
  // one unreadable string, so a heading inside it is the better name.
  const heading = element.querySelector("h1, h2, h3, h4")

  const raw =
    element.getAttribute("aria-label") ??
    element.getAttribute("title") ??
    heading?.textContent ??
    element.textContent ??
    ""

  const text = raw.replace(/\s+/g, " ").trim()
  if (text === "") return "follow"

  return text.length > 30 ? `${text.slice(0, 29)}…` : text
}
