"use client"

import { toggleSpriteAwake, useSpriteAwake } from "./spriteStore"
import styles from "./spriteToggle.module.css"

/**
 * Summons or dismisses the character. Deliberately available in more than one
 * place — the playground hero, where you meet him, and the footer, where you
 * end up if you have forgotten he exists.
 */
export default function SpriteToggle({
  variant = "button",
  className,
}: {
  variant?: "button" | "link"
  className?: string
}) {
  const awake = useSpriteAwake()

  const label = awake ? "Send him home" : "Wake the sprite"

  return (
    <button
      type="button"
      onClick={toggleSpriteAwake}
      aria-pressed={awake}
      className={[
        variant === "button" ? "btn" : "link",
        variant === "button" ? styles.button : styles.linkish,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.dot} data-on={awake} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
