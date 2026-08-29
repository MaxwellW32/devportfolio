"use client"

import { useEffect, useRef, useState } from "react"

type revealTag = "div" | "section" | "article" | "li" | "header"

type revealProps = {
  children: React.ReactNode
  /** Stagger in ms — pass an index times ~70 for a list. */
  delay?: number
  as?: revealTag
  className?: string
}

/**
 * Fades and lifts its children in once, the first time they enter the viewport.
 * Honours prefers-reduced-motion through the .reveal class in globals.css.
 */
export default function Reveal({ children, delay = 0, as = "div", className }: revealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, visibleSet] = useState(false)

  // A callback ref lets one component back several different element types
  const attachRef = (node: HTMLElement | null) => {
    ref.current = node
  }

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    // Anything already on screen at mount should not wait for a scroll event
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSet(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const shared = {
    ref: attachRef,
    className: className ? `reveal ${className}` : "reveal",
    "data-visible": visible,
    style: { "--reveal-delay": `${delay}ms` } as React.CSSProperties,
  }

  // Written out rather than computed so the JSX stays properly typed
  if (as === "section") return <section {...shared}>{children}</section>
  if (as === "article") return <article {...shared}>{children}</article>
  if (as === "li") return <li {...shared}>{children}</li>
  if (as === "header") return <header {...shared}>{children}</header>

  return <div {...shared}>{children}</div>
}
