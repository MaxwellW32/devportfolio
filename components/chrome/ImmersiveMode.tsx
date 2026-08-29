"use client"

import { useEffect, useState } from "react"
import styles from "./immersive.module.css"

/**
 * Full-bleed pages (games, generators, landing-page demos) hide the site
 * chrome so they get the whole viewport. The nav and footer are hidden by a
 * data attribute on <body> rather than by reaching in and mutating their
 * classes, so this keeps working if the chrome is ever rewritten.
 *
 * Pass showToggle={false} where the page already offers its own way back.
 */
export default function ImmersiveMode({
  children,
  showToggle = true,
}: {
  children: React.ReactNode
  showToggle?: boolean
}) {
  const [hidden, hiddenSet] = useState(true)

  useEffect(() => {
    document.body.dataset.immersive = String(hidden)

    return () => {
      delete document.body.dataset.immersive
    }
  }, [hidden])

  return (
    <div className={styles.wrap}>
      {children}

      {showToggle && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => hiddenSet(prev => !prev)}
          aria-pressed={!hidden}
        >
          {hidden ? "Show site nav" : "Hide site nav"}
        </button>
      )}
    </div>
  )
}
