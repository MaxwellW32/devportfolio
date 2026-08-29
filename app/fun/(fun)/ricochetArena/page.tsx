"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

import styles from "./arena.module.css"

/* ============================================================================
   TANK — ricochet arena

   The goal I set myself: shells that bounce correctly off walls, and enemies
   that lead their shots instead of aiming where you already were.

   Two bits of real geometry make the whole thing work:

     1. Reflection. When a shell crosses a wall, flip the velocity component on
        that axis only. Angle in equals angle out, and a bank shot round a
        corner becomes possible rather than lucky.

     2. Interception. To hit a moving target, an enemy solves for where the
        target *will* be — a quadratic in time-to-impact. Firing at the
        target's current position misses every time it is moving.
   ========================================================================= */

const ARENA = { width: 960, height: 620 }
const TANK_RADIUS = 13
const SHELL_RADIUS = 3.2
const SHELL_SPEED = 320
const MAX_BOUNCES = 3
const SHELL_LIFETIME = 5
const RELOAD = 0.45
const ENEMY_RELOAD = 3.1

type vector = { x: number; y: number }

type wall = { x: number; y: number; width: number; height: number }

type shell = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  bounces: number
  age: number
  friendly: boolean
  trail: vector[]
}

type tank = {
  id: number
  x: number
  y: number
  angle: number
  turret: number
  cooldown: number
  alive: boolean
  /** Enemies only: where they are currently heading. */
  wanderAngle: number
}

type phase = "ready" | "playing" | "won" | "lost"

/** The arena layout — outer border is implicit, these are the inner blocks. */
const walls: wall[] = [
  { x: 150, y: 90, width: 26, height: 160 },
  { x: 150, y: 370, width: 26, height: 160 },
  { x: 784, y: 90, width: 26, height: 160 },
  { x: 784, y: 370, width: 26, height: 160 },
  { x: 300, y: 250, width: 170, height: 26 },
  { x: 490, y: 344, width: 170, height: 26 },
  { x: 440, y: 90, width: 26, height: 110 },
  { x: 494, y: 420, width: 26, height: 110 },
  { x: 300, y: 470, width: 130, height: 26 },
  { x: 530, y: 124, width: 130, height: 26 },
]

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value
}

/** Circle-versus-axis-aligned-rectangle overlap, returning the push-out vector. */
function resolveCircleRect(cx: number, cy: number, radius: number, rect: wall): vector | null {
  const nearestX = clamp(cx, rect.x, rect.x + rect.width)
  const nearestY = clamp(cy, rect.y, rect.y + rect.height)

  const dx = cx - nearestX
  const dy = cy - nearestY
  const distanceSquared = dx * dx + dy * dy

  if (distanceSquared >= radius * radius) return null

  const distance = Math.sqrt(distanceSquared)

  // Dead centre: push out along the shallowest axis rather than dividing by zero
  if (distance === 0) {
    const leftGap = cx - rect.x
    const rightGap = rect.x + rect.width - cx
    const topGap = cy - rect.y
    const bottomGap = rect.y + rect.height - cy
    const smallest = Math.min(leftGap, rightGap, topGap, bottomGap)

    if (smallest === leftGap) return { x: -(leftGap + radius), y: 0 }
    if (smallest === rightGap) return { x: rightGap + radius, y: 0 }
    if (smallest === topGap) return { x: 0, y: -(topGap + radius) }
    return { x: 0, y: bottomGap + radius }
  }

  const overlap = radius - distance
  return { x: (dx / distance) * overlap, y: (dy / distance) * overlap }
}

/**
 * Where should a shell be aimed to intercept a moving target?
 * Solves |target + v·t − origin| = speed·t for the smallest positive t.
 * Returns null when the target simply cannot be caught.
 */
function interceptAngle(origin: vector, target: vector, targetVelocity: vector, shellSpeed: number) {
  const dx = target.x - origin.x
  const dy = target.y - origin.y

  const a = targetVelocity.x * targetVelocity.x + targetVelocity.y * targetVelocity.y - shellSpeed * shellSpeed
  const b = 2 * (dx * targetVelocity.x + dy * targetVelocity.y)
  const c = dx * dx + dy * dy

  let time: number

  if (Math.abs(a) < 1e-6) {
    // Target moving at exactly shell speed — the quadratic degenerates
    if (Math.abs(b) < 1e-6) return null
    time = -c / b
  } else {
    const discriminant = b * b - 4 * a * c
    if (discriminant < 0) return null

    const root = Math.sqrt(discriminant)
    const t1 = (-b + root) / (2 * a)
    const t2 = (-b - root) / (2 * a)

    const candidates = [t1, t2].filter(t => t > 0)
    if (candidates.length === 0) return null
    time = Math.min(...candidates)
  }

  if (time <= 0) return null

  return Math.atan2(dy + targetVelocity.y * time, dx + targetVelocity.x * time)
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const [phase, phaseSet] = useState<phase>("ready")
  const [score, scoreSet] = useState(0)
  const [enemiesLeft, enemiesLeftSet] = useState(0)
  const [wave, waveSet] = useState(1)

  const phaseRef = useRef<phase>("ready")
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const player = useRef<tank>({
    id: 0, x: 90, y: ARENA.height / 2, angle: 0, turret: 0, cooldown: 0, alive: true, wanderAngle: 0,
  })
  const playerVelocity = useRef<vector>({ x: 0, y: 0 })
  const enemies = useRef<tank[]>([])
  const shells = useRef<shell[]>([])
  const keys = useRef<Record<string, boolean>>({})
  const pointer = useRef<vector>({ x: ARENA.width / 2, y: ARENA.height / 2 })
  const shellId = useRef(0)
  const waveRef = useRef(1)

  /* ---- Spawning --------------------------------------------------------- */
  const spawnWave = useCallback((waveNumber: number) => {
    const count = Math.min(2 + waveNumber, 6)
    const spawned: tank[] = []

    for (let i = 0; i < count; i++) {
      // Spread spawns down the right-hand side, clear of the wall blocks
      const y = 90 + ((ARENA.height - 180) / Math.max(count - 1, 1)) * i
      spawned.push({
        id: i + 1,
        x: ARENA.width - 90,
        y,
        angle: Math.PI,
        turret: Math.PI,
        // Staggered, with a grace period so a wave never opens with a volley
        cooldown: 2.2 + i * 0.5,
        alive: true,
        wanderAngle: Math.PI,
      })
    }

    enemies.current = spawned
    enemiesLeftSet(count)
  }, [])

  const startGame = useCallback(() => {
    player.current = {
      id: 0, x: 90, y: ARENA.height / 2, angle: 0, turret: 0, cooldown: 0, alive: true, wanderAngle: 0,
    }
    playerVelocity.current = { x: 0, y: 0 }
    shells.current = []
    waveRef.current = 1
    waveSet(1)
    scoreSet(0)
    spawnWave(1)
    phaseSet("playing")
  }, [spawnWave])

  /* ---- Input ------------------------------------------------------------ */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true

      if (e.key === " ") e.preventDefault()
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  /* ---- Simulation + render --------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (canvas === null || wrap === null) return

    const ctx = canvas.getContext("2d")
    if (ctx === null) return

    // The arena is a fixed logical size, scaled to fit whatever space it gets
    let scale = 1
    let offsetX = 0
    let offsetY = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)

      scale = Math.min(rect.width / ARENA.width, rect.height / ARENA.height)
      offsetX = (rect.width - ARENA.width * scale) / 2
      offsetY = (rect.height - ARENA.height * scale) / 2

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const toArena = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.current = toArena(e.clientX, e.clientY)
    }

    const fire = (from: tank, angle: number, friendly: boolean) => {
      shells.current.push({
        id: shellId.current++,
        x: from.x + Math.cos(angle) * (TANK_RADIUS + 6),
        y: from.y + Math.sin(angle) * (TANK_RADIUS + 6),
        vx: Math.cos(angle) * SHELL_SPEED,
        vy: Math.sin(angle) * SHELL_SPEED,
        bounces: 0,
        age: 0,
        friendly,
        trail: [],
      })
    }

    const onPointerDown = (e: PointerEvent) => {
      if (phaseRef.current !== "playing") return
      pointer.current = toArena(e.clientX, e.clientY)

      if (player.current.cooldown <= 0 && player.current.alive) {
        fire(player.current, player.current.turret, true)
        player.current.cooldown = RELOAD
      }
    }

    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerdown", onPointerDown)

    let frameId = 0
    let lastTime = performance.now()

    const update = (delta: number) => {
      if (phaseRef.current !== "playing") return

      /* --- player movement --- */
      const self = player.current
      const speed = 168

      let moveX = 0
      let moveY = 0
      if (keys.current["w"] || keys.current["arrowup"]) moveY -= 1
      if (keys.current["s"] || keys.current["arrowdown"]) moveY += 1
      if (keys.current["a"] || keys.current["arrowleft"]) moveX -= 1
      if (keys.current["d"] || keys.current["arrowright"]) moveX += 1

      const magnitude = Math.hypot(moveX, moveY)
      if (magnitude > 0) {
        moveX /= magnitude
        moveY /= magnitude
        self.angle = Math.atan2(moveY, moveX)
      }

      playerVelocity.current = { x: moveX * speed, y: moveY * speed }

      self.x += moveX * speed * delta
      self.y += moveY * speed * delta

      self.turret = Math.atan2(pointer.current.y - self.y, pointer.current.x - self.x)

      if (self.cooldown > 0) self.cooldown -= delta

      // Space fires too, for anyone who would rather not use the mouse
      if (keys.current[" "] && self.cooldown <= 0) {
        fire(self, self.turret, true)
        self.cooldown = RELOAD
      }

      /* --- keep tanks out of walls and inside the arena --- */
      const constrain = (unit: tank) => {
        unit.x = clamp(unit.x, TANK_RADIUS, ARENA.width - TANK_RADIUS)
        unit.y = clamp(unit.y, TANK_RADIUS, ARENA.height - TANK_RADIUS)

        for (const eachWall of walls) {
          const push = resolveCircleRect(unit.x, unit.y, TANK_RADIUS, eachWall)
          if (push !== null) {
            unit.x += push.x
            unit.y += push.y
          }
        }
      }

      constrain(self)

      /* --- enemies --- */
      for (const enemy of enemies.current) {
        if (!enemy.alive) continue

        const toPlayerX = self.x - enemy.x
        const toPlayerY = self.y - enemy.y
        const distance = Math.hypot(toPlayerX, toPlayerY)

        // Close the distance, but hold station once inside firing range
        const desired = distance > 260 ? Math.atan2(toPlayerY, toPlayerX) : enemy.wanderAngle

        if (distance <= 260) {
          // Strafe rather than sit still, so they are not free target practice
          enemy.wanderAngle += (Math.random() - 0.5) * 1.6 * delta
        }

        const enemySpeed = distance > 260 ? 82 : 54
        enemy.x += Math.cos(desired) * enemySpeed * delta
        enemy.y += Math.sin(desired) * enemySpeed * delta
        enemy.angle = desired

        constrain(enemy)

        // Aim where the player is going, not where they are
        const lead = interceptAngle(
          { x: enemy.x, y: enemy.y },
          { x: self.x, y: self.y },
          playerVelocity.current,
          SHELL_SPEED,
        )
        enemy.turret = lead ?? Math.atan2(toPlayerY, toPlayerX)

        enemy.cooldown -= delta
        if (enemy.cooldown <= 0 && distance < 400) {
          // A little spread, so perfect prediction does not make them unfair
          // Perfect prediction would be unplayable; the spread is what makes
          // dodging possible without making the lead calculation pointless.
          fire(enemy, enemy.turret + (Math.random() - 0.5) * 0.22, false)
          enemy.cooldown = ENEMY_RELOAD + Math.random() * 1.2
        }
      }

      /* --- shells --- */
      const survivors: shell[] = []

      for (const eachShell of shells.current) {
        eachShell.age += delta
        if (eachShell.age > SHELL_LIFETIME) continue

        // Substep so a fast shell cannot tunnel through a thin wall
        const steps = 4
        const stepDelta = delta / steps
        let dead = false

        for (let s = 0; s < steps && !dead; s++) {
          eachShell.x += eachShell.vx * stepDelta
          eachShell.y += eachShell.vy * stepDelta

          // --- arena edges ---
          if (eachShell.x < SHELL_RADIUS || eachShell.x > ARENA.width - SHELL_RADIUS) {
            eachShell.x = clamp(eachShell.x, SHELL_RADIUS, ARENA.width - SHELL_RADIUS)
            eachShell.vx *= -1
            eachShell.bounces++
          }
          if (eachShell.y < SHELL_RADIUS || eachShell.y > ARENA.height - SHELL_RADIUS) {
            eachShell.y = clamp(eachShell.y, SHELL_RADIUS, ARENA.height - SHELL_RADIUS)
            eachShell.vy *= -1
            eachShell.bounces++
          }

          // --- inner walls: reflect on whichever axis was crossed ---
          for (const eachWall of walls) {
            const push = resolveCircleRect(eachShell.x, eachShell.y, SHELL_RADIUS, eachWall)
            if (push === null) continue

            eachShell.x += push.x
            eachShell.y += push.y

            // The push-out vector points along the face that was hit
            if (Math.abs(push.x) > Math.abs(push.y)) eachShell.vx *= -1
            else eachShell.vy *= -1

            eachShell.bounces++
            break
          }

          if (eachShell.bounces > MAX_BOUNCES) {
            dead = true
            break
          }

          // --- hits ---
          if (eachShell.friendly) {
            for (const enemy of enemies.current) {
              if (!enemy.alive) continue
              if (Math.hypot(enemy.x - eachShell.x, enemy.y - eachShell.y) < TANK_RADIUS + SHELL_RADIUS) {
                enemy.alive = false
                dead = true
                scoreSet(prev => prev + 100)
                enemiesLeftSet(prev => Math.max(0, prev - 1))
                break
              }
            }
          } else if (
            self.alive &&
            Math.hypot(self.x - eachShell.x, self.y - eachShell.y) < TANK_RADIUS + SHELL_RADIUS
          ) {
            self.alive = false
            dead = true
            phaseSet("lost")
          }
        }

        if (!dead) {
          eachShell.trail.push({ x: eachShell.x, y: eachShell.y })
          if (eachShell.trail.length > 9) eachShell.trail.shift()
          survivors.push(eachShell)
        }
      }

      shells.current = survivors

      /* --- wave complete --- */
      if (self.alive && enemies.current.length > 0 && enemies.current.every(e => !e.alive)) {
        if (waveRef.current >= 4) {
          phaseSet("won")
        } else {
          waveRef.current++
          waveSet(waveRef.current)
          spawnWave(waveRef.current)
        }
      }
    }

    /* ---- Drawing --------------------------------------------------------- */
    const drawTank = (unit: tank, friendly: boolean) => {
      ctx.save()
      ctx.translate(unit.x, unit.y)

      // shadow
      ctx.beginPath()
      ctx.arc(1.5, 2.5, TANK_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      ctx.fill()

      // hull
      ctx.save()
      ctx.rotate(unit.angle)
      ctx.fillStyle = friendly ? "oklch(70% 0.17 122)" : "oklch(58% 0.16 25)"
      ctx.fillRect(-TANK_RADIUS, -TANK_RADIUS + 2, TANK_RADIUS * 2, TANK_RADIUS * 2 - 4)

      ctx.fillStyle = "rgba(0,0,0,0.25)"
      ctx.fillRect(-TANK_RADIUS, -TANK_RADIUS + 2, TANK_RADIUS * 2, 3)
      ctx.fillRect(-TANK_RADIUS, TANK_RADIUS - 5, TANK_RADIUS * 2, 3)
      ctx.restore()

      // turret
      ctx.save()
      ctx.rotate(unit.turret)
      ctx.fillStyle = friendly ? "oklch(88% 0.21 122)" : "oklch(70% 0.19 25)"
      ctx.fillRect(0, -2.5, TANK_RADIUS + 9, 5)
      ctx.beginPath()
      ctx.arc(0, 0, TANK_RADIUS * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.restore()
    }

    const render = () => {
      const rect = wrap.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)

      // floor
      ctx.fillStyle = "oklch(19% 0.01 240)"
      ctx.fillRect(0, 0, ARENA.width, ARENA.height)

      // grid
      ctx.strokeStyle = "oklch(24% 0.012 240)"
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 40; x < ARENA.width; x += 40) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, ARENA.height)
      }
      for (let y = 40; y < ARENA.height; y += 40) {
        ctx.moveTo(0, y)
        ctx.lineTo(ARENA.width, y)
      }
      ctx.stroke()

      // walls
      for (const eachWall of walls) {
        ctx.fillStyle = "oklch(30% 0.014 240)"
        ctx.fillRect(eachWall.x, eachWall.y, eachWall.width, eachWall.height)
        ctx.strokeStyle = "oklch(38% 0.015 240)"
        ctx.strokeRect(eachWall.x + 0.5, eachWall.y + 0.5, eachWall.width - 1, eachWall.height - 1)
      }

      // border
      ctx.strokeStyle = "oklch(38% 0.015 240)"
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, ARENA.width - 2, ARENA.height - 2)

      // aim line, showing the first bounce
      if (phaseRef.current === "playing" && player.current.alive) {
        ctx.setLineDash([4, 6])
        ctx.strokeStyle = "oklch(88% 0.21 122 / 0.22)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(player.current.x, player.current.y)
        ctx.lineTo(pointer.current.x, pointer.current.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // shells
      for (const eachShell of shells.current) {
        const colour = eachShell.friendly ? "oklch(88% 0.21 122" : "oklch(70% 0.19 25"

        eachShell.trail.forEach((eachPoint, eachIndex) => {
          const alpha = (eachIndex / eachShell.trail.length) * 0.4
          ctx.beginPath()
          ctx.arc(eachPoint.x, eachPoint.y, SHELL_RADIUS * 0.7, 0, Math.PI * 2)
          ctx.fillStyle = `${colour} / ${alpha})`
          ctx.fill()
        })

        ctx.beginPath()
        ctx.arc(eachShell.x, eachShell.y, SHELL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `${colour})`
        ctx.fill()
      }

      for (const enemy of enemies.current) {
        if (enemy.alive) drawTank(enemy, false)
      }

      if (player.current.alive) drawTank(player.current, true)

      ctx.restore()
    }

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now

      update(delta)
      render()

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerdown", onPointerDown)
    }
  }, [spawnWave])

  return (
    <main className={styles.page}>
      <header className={styles.bar}>
        <Link href="/fun" className={styles.back}>← Playground</Link>

        <div className={styles.stats}>
          <span>Wave <b className="readout">{wave}</b></span>
          <span>Enemies <b className="readout">{enemiesLeft}</b></span>
          <span>Score <b className="readout">{score}</b></span>
        </div>
      </header>

      <div ref={wrapRef} className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {phase !== "playing" && (
          <div className={styles.overlay}>
            <div className={styles.card}>
              <p className="label labelSignal">
                {phase === "ready" ? "Ricochet arena" : phase === "won" ? "Cleared" : "Destroyed"}
              </p>

              <h1>
                {phase === "ready" && "Bank your shots."}
                {phase === "won" && "All four waves down."}
                {phase === "lost" && "They led the shot."}
              </h1>

              <p className={styles.cardBody}>
                {phase === "ready" && (
                  <>
                    Shells reflect off walls up to {MAX_BOUNCES} times — angle in
                    equals angle out, so corners are cover for them and a route
                    for you. Enemies solve for where you are going, not where
                    you are, so keep changing direction.
                  </>
                )}
                {phase === "won" && `Four waves cleared with ${score} points.`}
                {phase === "lost" && `You made it to wave ${wave} with ${score} points.`}
              </p>

              <p className={styles.controls}>
                <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move
                <span>·</span>
                Mouse aims
                <span>·</span>
                <kbd>Click</kbd> or <kbd>Space</kbd> fires
              </p>

              <button type="button" className="btn btnPrimary" onClick={startGame}>
                <span>{phase === "ready" ? "Start" : "Play again"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
