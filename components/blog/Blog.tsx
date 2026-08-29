import Image from "next/image"
import type { StaticImageData } from "next/image"
import Link from "next/link"
import styles from "./blog.module.css"

export default function Blog({
  image,
  category,
  datePosted,
  title,
  messages,
  slug,
  inPreview,
}: {
  image: StaticImageData
  category: string
  datePosted: Date
  title: string
  messages?: React.JSX.Element[]
  slug: string
  inPreview?: boolean
}) {
  const formattedDate = datePosted.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  /* ---- Listing card --------------------------------------------------- */
  if (inPreview) {
    return (
      <article className={`card ${styles.card}`}>
        <Link href={`/blog/${slug}`} className={styles.hit} aria-label={title}>
          <span />
        </Link>

        <div className={styles.thumb}>
          <Image
            alt=""
            width={400}
            height={400}
            src={image}
            sizes="(max-width: 700px) 100vw, 220px"
          />
        </div>

        <div className={styles.cardBody}>
          <p className="label labelPlain">
            <Link href={`/blog/category/${category}`} className={styles.category}>
              {category}
            </Link>
            <span className={styles.dot}>·</span>
            <time dateTime={datePosted.toISOString()}>{formattedDate}</time>
          </p>

          <h2 className={styles.cardTitle}>{title}</h2>

          <p className={styles.cue}>
            Read
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        </div>
      </article>
    )
  }

  /* ---- Full post ------------------------------------------------------- */
  return (
    <article className={styles.post}>
      <header className={styles.postHead}>
        <Link href="/blog" className={styles.back}>← All writing</Link>

        <p className="label labelPlain">
          <Link href={`/blog/category/${category}`} className={styles.category}>
            {category}
          </Link>
          <span className={styles.dot}>·</span>
          <time dateTime={datePosted.toISOString()}>{formattedDate}</time>
        </p>

        <h1 className={styles.postTitle}>{title}</h1>
      </header>

      <div className={styles.hero}>
        <Image alt="" width={1200} height={600} src={image} sizes="100vw" priority />
      </div>

      {messages !== undefined && (
        <div className={`prose ${styles.body}`}>
          {messages.map((eachMessage, eachMessageIndex) => (
            <div key={eachMessageIndex}>{eachMessage}</div>
          ))}
        </div>
      )}
    </article>
  )
}
