"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import * as THREE from "three"

import styles from "./three.module.css"

/* ============================================================================
   BOIDS — three rules, one flock

   The goal I set myself: show that flocking needs no leader, no plan and no
   global state. Every bird follows the same three local rules, looking only at
   the neighbours within its own small radius:

     1. Separation — steer away from anyone too close
     2. Alignment  — steer toward the average heading of your neighbours
     3. Cohesion   — steer toward the average position of your neighbours

   The murmuration is not programmed anywhere. Drag each weight to zero and
   watch which part of the behaviour dies — that is the proof.
   ========================================================================= */

const COUNT = 260
const BOUNDS = 34

type weights = {
  separation: number
  alignment: number
  cohesion: number
}

const DEFAULT_WEIGHTS: weights = { separation: 1.6, alignment: 1, cohesion: 0.9 }

export default function Page() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  const [weights, weightsSet] = useState<weights>(DEFAULT_WEIGHTS)
  const weightsRef = useRef<weights>(DEFAULT_WEIGHTS)
  const [fps, fpsSet] = useState(0)

  // Keep the render loop reading current values without re-creating the scene
  useEffect(() => {
    weightsRef.current = weights
  }, [weights])

  useEffect(() => {
    const mount = mountRef.current
    if (mount === null) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x07090b, 0.014)

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400)
    camera.position.set(0, 6, 62)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    /* ---- Lighting ------------------------------------------------------ */
    scene.add(new THREE.AmbientLight(0xaebccc, 2))

    const key = new THREE.DirectionalLight(0xd4ff5a, 3)
    key.position.set(12, 20, 14)
    scene.add(key)

    const rim = new THREE.DirectionalLight(0x4fc3e8, 1.4)
    rim.position.set(-16, -8, -12)
    scene.add(rim)

    /* ---- The boundary, so the space reads as a volume ------------------ */
    const cage = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(BOUNDS * 2, BOUNDS * 2, BOUNDS * 2)),
      new THREE.LineBasicMaterial({ color: 0x2a3540, transparent: true, opacity: 0.5 }),
    )
    scene.add(cage)

    /* ---- The flock ------------------------------------------------------ */
    // A cone points down its +Y axis by default; rotating the geometry once
    // means every instance can aim with a simple lookAt-style quaternion.
    const bodyGeometry = new THREE.ConeGeometry(0.52, 2.3, 5)
    bodyGeometry.rotateX(Math.PI / 2)

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05,
      emissive: 0x121a10,
    })

    const flock = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, COUNT)
    flock.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(flock)

    // Per-instance colour: warm at the front of the flock, cool at the back
    const colour = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      colour.setHSL(0.23 + Math.random() * 0.1, 0.7, 0.62 + Math.random() * 0.18)
      flock.setColorAt(i, colour)
    }
    if (flock.instanceColor) flock.instanceColor.needsUpdate = true

    const positions: THREE.Vector3[] = []
    const velocities: THREE.Vector3[] = []

    for (let i = 0; i < COUNT; i++) {
      positions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * BOUNDS,
          (Math.random() - 0.5) * BOUNDS,
          (Math.random() - 0.5) * BOUNDS,
        ),
      )
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        ),
      )
    }

    /* ---- Scratch vectors, allocated once -------------------------------- */
    const separation = new THREE.Vector3()
    const alignment = new THREE.Vector3()
    const cohesion = new THREE.Vector3()
    const offset = new THREE.Vector3()
    const matrix = new THREE.Matrix4()
    const quaternion = new THREE.Quaternion()
    const forward = new THREE.Vector3(0, 0, 1)
    const scale = new THREE.Vector3(1, 1, 1)

    const NEIGHBOUR_RADIUS = 6
    const CROWD_RADIUS = 2.6
    const MAX_SPEED = 0.42
    const MIN_SPEED = 0.16

    /* ---- Pointer parallax ------------------------------------------------ */
    const pointer = { x: 0, y: 0 }
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    /* ---- Resize ---------------------------------------------------------- */
    const resize = () => {
      const rect = mount.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      renderer.setSize(rect.width, rect.height, false)
      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    /* ---- Loop ------------------------------------------------------------ */
    let frameId = 0
    let running = true
    let frames = 0
    let fpsClock = performance.now()

    const step = () => {
      const w = weightsRef.current

      for (let i = 0; i < COUNT; i++) {
        const position = positions[i]
        const velocity = velocities[i]

        separation.set(0, 0, 0)
        alignment.set(0, 0, 0)
        cohesion.set(0, 0, 0)

        let neighbours = 0
        let crowders = 0

        // Naive all-pairs: at 260 boids this is well inside frame budget, and
        // a spatial hash would cost more in complexity than it saves here.
        for (let j = 0; j < COUNT; j++) {
          if (i === j) continue

          offset.subVectors(position, positions[j])
          const distanceSquared = offset.lengthSq()

          if (distanceSquared > NEIGHBOUR_RADIUS * NEIGHBOUR_RADIUS) continue

          alignment.add(velocities[j])
          cohesion.add(positions[j])
          neighbours++

          if (distanceSquared < CROWD_RADIUS * CROWD_RADIUS && distanceSquared > 0.0001) {
            // Weight the push by closeness, so near misses shove harder
            separation.add(offset.divideScalar(distanceSquared))
            crowders++
          }
        }

        if (neighbours > 0) {
          alignment.divideScalar(neighbours).sub(velocity).multiplyScalar(0.05 * w.alignment)
          cohesion.divideScalar(neighbours).sub(position).multiplyScalar(0.0016 * w.cohesion)
          velocity.add(alignment).add(cohesion)
        }

        if (crowders > 0) {
          velocity.add(separation.multiplyScalar(0.035 * w.separation))
        }

        // --- soft turn back at the walls, rather than a hard bounce ---
        const limit = BOUNDS - 3
        if (position.x > limit) velocity.x -= 0.02
        else if (position.x < -limit) velocity.x += 0.02
        if (position.y > limit) velocity.y -= 0.02
        else if (position.y < -limit) velocity.y += 0.02
        if (position.z > limit) velocity.z -= 0.02
        else if (position.z < -limit) velocity.z += 0.02

        // --- clamp speed so the flock neither stalls nor runs away ---
        const speed = velocity.length()
        if (speed > MAX_SPEED) velocity.multiplyScalar(MAX_SPEED / speed)
        else if (speed < MIN_SPEED && speed > 0) velocity.multiplyScalar(MIN_SPEED / speed)

        position.add(velocity)

        // --- write the instance transform ---
        quaternion.setFromUnitVectors(forward, offset.copy(velocity).normalize())
        matrix.compose(position, quaternion, scale)
        flock.setMatrixAt(i, matrix)
      }

      flock.instanceMatrix.needsUpdate = true
    }

    const loop = () => {
      if (!running) return

      step()

      // Camera drifts with the pointer, easing rather than snapping
      camera.position.x += (pointer.x * 26 - camera.position.x) * 0.03
      camera.position.y += (-pointer.y * 18 + 6 - camera.position.y) * 0.03
      camera.lookAt(0, 0, 0)

      cage.rotation.y += 0.0006

      renderer.render(scene, camera)

      frames++
      const now = performance.now()
      if (now - fpsClock > 500) {
        fpsSet(Math.round((frames * 1000) / (now - fpsClock)))
        frames = 0
        fpsClock = now
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    // Stop entirely when the tab is hidden — no point simulating a flock nobody sees
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frameId)
      } else if (!running) {
        running = true
        fpsClock = performance.now()
        frames = 0
        frameId = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    /* ---- Teardown -------------------------------------------------------- */
    return () => {
      running = false
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("visibilitychange", onVisibility)

      bodyGeometry.dispose()
      bodyMaterial.dispose()
      cage.geometry.dispose()
      ;(cage.material as THREE.Material).dispose()
      renderer.dispose()

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  const rules: { key: keyof weights; name: string; description: string }[] = [
    { key: "separation", name: "Separation", description: "Steer away from anyone too close" },
    { key: "alignment", name: "Alignment", description: "Match your neighbours' heading" },
    { key: "cohesion", name: "Cohesion", description: "Move toward the group's centre" },
  ]

  return (
    <main className={styles.page}>
      <div ref={mountRef} className={styles.stage} />

      <header className={styles.topBar}>
        <Link href="/fun" className={styles.back}>← Playground</Link>

        <div className={styles.title}>
          <p className="label labelSignal">Emergence</p>
          <h1>Three rules, one flock</h1>
        </div>

        <p className={styles.fps}>
          <span className="readout">{COUNT}</span> boids
          <span className={styles.divider}>·</span>
          <span className="readout">{fps}</span> fps
        </p>
      </header>

      <aside className={styles.panel}>
        <p className={styles.panelIntro}>
          Nobody leads. Each boid sees only its neighbours within a small radius
          and obeys the same three rules. Take one to zero and watch which part
          of the murmuration disappears.
        </p>

        {rules.map(eachRule => (
          <label key={eachRule.key} className={styles.slider}>
            <span className={styles.sliderHead}>
              <span>{eachRule.name}</span>
              <span className="readout">{weights[eachRule.key].toFixed(2)}</span>
            </span>

            <input
              type="range"
              min={0}
              max={3}
              step={0.05}
              value={weights[eachRule.key]}
              onChange={e =>
                weightsSet(prev => ({ ...prev, [eachRule.key]: Number(e.target.value) }))
              }
            />

            <span className={styles.sliderNote}>{eachRule.description}</span>
          </label>
        ))}

        <button
          type="button"
          className="btn btnSm"
          onClick={() => weightsSet(DEFAULT_WEIGHTS)}
        >
          <span>Reset weights</span>
        </button>
      </aside>
    </main>
  )
}
