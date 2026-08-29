import Image from "next/image"
import styles from "./projectShot.module.css"

/** Stable small integer from a string, so a slug always draws the same figure. */
function hashSlug(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * The fallback when a project has no screenshot: a generated plot figure
 * unique to the slug, drawn in the site palette. Deterministic, so it never
 * changes between builds.
 */
function Placeholder({ slug, title }: { slug: string; title: string }) {
  const hash = hashSlug(slug)
  const columns = 11

  const bars = Array.from({ length: columns }, (_, i) => {
    // Two out-of-phase waves keep neighbouring projects looking distinct
    const a = Math.sin((hash % 97) * 0.11 + i * 0.72)
    const b = Math.cos((hash % 53) * 0.19 + i * 0.41)
    return 0.25 + Math.abs(a * 0.45 + b * 0.3) * 0.7
  })

  const barWidth = 220 / columns

  // Two words give their initials; a single word gives its first two letters,
  // because one lone capital reads as a mistake rather than a mark.
  const words = title.split(/\s+/).filter(Boolean)
  const initials = (
    words.length > 1
      ? words.slice(0, 2).map(word => word[0]).join("")
      : title.slice(0, 2)
  ).toUpperCase()

  return (
    <div className={styles.placeholder} aria-hidden="true">
      <svg viewBox="0 0 220 130" preserveAspectRatio="none" className={styles.figure}>
        {bars.map((eachHeight, eachIndex) => (
          <rect
            key={eachIndex}
            x={eachIndex * barWidth + barWidth * 0.22}
            y={122 - eachHeight * 108}
            width={barWidth * 0.56}
            height={eachHeight * 108}
            rx="1"
            fill="currentColor"
            opacity={0.16 + (eachIndex % 3) * 0.12}
          />
        ))}

        <polyline
          points={bars
            .map((eachHeight, eachIndex) =>
              `${eachIndex * barWidth + barWidth / 2},${122 - eachHeight * 108}`)
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>

      <span className={styles.initials}>{initials}</span>
    </div>
  )
}

type projectShotProps = {
  slug: string
  title: string
  /** Resolved by lib/shots.ts on the server. Null renders the placeholder. */
  src: string | null
  priority?: boolean
  sizes?: string
}

export default function ProjectShot({ slug, title, src, priority = false, sizes }: projectShotProps) {
  if (src === null) return <Placeholder slug={slug} title={title} />

  return (
    <Image
      src={src}
      alt={`${title} — screenshot`}
      width={1280}
      height={800}
      priority={priority}
      sizes={sizes ?? "(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 600px"}
      className={styles.image}
    />
  )
}
