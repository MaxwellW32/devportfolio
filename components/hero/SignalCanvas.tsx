"use client"

import { useEffect, useRef } from "react"

/**
 * The hero's live plot: a random walk with a slower moving average drawn over
 * it, the same shape as the market tapes the trading bots read.
 *
 * Cursor height sets volatility, so the line answers the pointer without
 * anything as literal as a follow effect. Pauses when scrolled out of view or
 * when the tab is hidden, and renders one static frame under reduced-motion.
 */
export default function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext("2d")
    if (ctx === null) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const POINTS = 170
    const AVG_WINDOW = 22

    let width = 0
    let height = 0
    let frame = 0
    let running = true

    // The walk itself, seeded so the first paint already looks like a tape
    const series: number[] = []
    let value = 0.5
    let drift = 0
    for (let i = 0; i < POINTS; i++) {
      drift = drift * 0.94 + (Math.random() - 0.5) * 0.02 + (0.5 - value) * 0.012
      value = Math.min(0.92, Math.max(0.08, value + drift))
      series.push(value)
    }

    // 0 = calm, 1 = wild. Driven by pointer height, eased toward its target.
    let volatility = 0.35
    let volatilityTarget = 0.35

    function resize() {
      if (canvas === null) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function step() {
      drift = drift * 0.92 + (Math.random() - 0.5) * (0.006 + volatility * 0.05)

      // Mean reversion. Without it the walk wanders to an edge and pins there,
      // which is both ugly and a poor picture of a real tape.
      drift += (0.5 - value) * 0.012

      value = value + drift

      // Soft reflection at the edges keeps the walk in frame without clipping
      if (value > 0.92) {
        value = 0.92
        drift = -Math.abs(drift) * 0.5
      }
      if (value < 0.08) {
        value = 0.08
        drift = Math.abs(drift) * 0.5
      }

      series.push(value)
      series.shift()
    }

    function movingAverage(index: number) {
      const start = Math.max(0, index - AVG_WINDOW + 1)
      let total = 0
      for (let i = start; i <= index; i++) total += series[i]
      return total / (index - start + 1)
    }

    function toX(index: number) {
      return (index / (POINTS - 1)) * width
    }

    function toY(v: number) {
      // Inset so the stroke and glow never touch the edges
      return height - (v * (height - 24) + 12)
    }

    function draw() {
      if (ctx === null) return

      ctx.clearRect(0, 0, width, height)

      // --- moving average: the calm reference line ---
      ctx.beginPath()
      for (let i = 0; i < POINTS; i++) {
        const x = toX(i)
        const y = toY(movingAverage(i))
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = "oklch(55% 0.009 240 / 0.55)"
      ctx.lineWidth = 1
      ctx.setLineDash([3, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // --- the signal itself ---
      ctx.beginPath()
      for (let i = 0; i < POINTS; i++) {
        const x = toX(i)
        const y = toY(series[i])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      // Fill under the curve, fading downward
      const fill = ctx.createLinearGradient(0, 0, 0, height)
      fill.addColorStop(0, "oklch(88% 0.21 122 / 0.16)")
      fill.addColorStop(1, "oklch(88% 0.21 122 / 0)")

      ctx.save()
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.restore()

      ctx.strokeStyle = "oklch(88% 0.21 122)"
      ctx.lineWidth = 1.5
      ctx.lineJoin = "round"
      ctx.stroke()

      // --- leading marker ---
      const headX = toX(POINTS - 1)
      const headY = toY(series[POINTS - 1])

      ctx.beginPath()
      ctx.arc(headX, headY, 3, 0, Math.PI * 2)
      ctx.fillStyle = "oklch(88% 0.21 122)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(headX, headY, 8, 0, Math.PI * 2)
      ctx.strokeStyle = "oklch(88% 0.21 122 / 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    function loop() {
      if (!running) return

      volatility += (volatilityTarget - volatility) * 0.05

      // Advance every third frame — a tape, not a blur
      frame++
      if (frame % 3 === 0) step()

      draw()
      animationId = requestAnimationFrame(loop)
    }

    function onPointerMove(e: PointerEvent) {
      if (canvas === null) return
      const rect = canvas.getBoundingClientRect()
      const relative = 1 - (e.clientY - rect.top) / rect.height
      volatilityTarget = Math.min(1, Math.max(0.05, relative))
    }

    let animationId = 0

    resize()
    window.addEventListener("resize", resize)

    if (reducedMotion) {
      draw()
      return () => window.removeEventListener("resize", resize)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })

    // Only animate while actually on screen
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && !running) {
            running = true
            animationId = requestAnimationFrame(loop)
          } else if (!entry.isIntersecting) {
            running = false
            cancelAnimationFrame(animationId)
          }
        }
      },
      { threshold: 0 },
    )
    observer.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(animationId)
      } else if (!running) {
        running = true
        animationId = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    animationId = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      observer.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }} />
}
