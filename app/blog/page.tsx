import type { Metadata } from "next"

import BlogPosts from "@/components/blogPosts/BlogPosts"
import styles from "./blog.module.css"

export const metadata: Metadata = {
  title: "Writing",
  description: "Short notes on the tools I use and what I picked up while learning them.",
}

export default function Page() {
  return (
    <main className={`shell ${styles.page}`}>
      <header className={styles.head}>
        <p className="label labelSignal">Writing</p>
        <h1 className={styles.title}>What I&apos;ve learned along the way.</h1>
        <p className={styles.lede}>
          Short notes on the tools I use and what I picked up while learning
          them.
        </p>
      </header>

      <BlogPosts inPreviewMode={true} />
    </main>
  )
}
