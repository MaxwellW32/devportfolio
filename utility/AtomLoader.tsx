"use client"

import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { screenSizeGlobal } from "./globalState"

/**
 * Keeps the global screen-size atom in sync with the viewport.
 * Layout should be driven by CSS wherever possible — this exists only for the
 * handful of components that genuinely need the breakpoint in JS.
 */
export default function AtomLoader() {
  const screenSizeSet = useSetAtom(screenSizeGlobal)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const tablet = window.matchMedia("(min-width: 501px) and (max-width: 1023px)")

    const sync = () => {
      screenSizeSet({
        desktop: desktop.matches,
        tablet: tablet.matches,
        phone: !desktop.matches && !tablet.matches,
      })
    }

    sync()
    desktop.addEventListener("change", sync)
    tablet.addEventListener("change", sync)

    return () => {
      desktop.removeEventListener("change", sync)
      tablet.removeEventListener("change", sync)
    }
  }, [screenSizeSet])

  return null
}
