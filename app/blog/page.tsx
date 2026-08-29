import type { Metadata } from "next"

import BlogPosts from "@/components/blogPosts/BlogPosts"
import styles from "./blog.module.css"

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on building — what worked, what did not, and what the evidence said.",
}

export default function Page() {
  return (
    <main className={`shell ${styles.page}`}>
      <header className={styles.head}>
        <p className="label labelSignal">Writing</p>
        <h1 className={styles.title}>Notes from the build.</h1>
        <p className={styles.lede}>
          What worked, what did not, and what the evidence actually said.
        </p>
      </header>

      <BlogPosts inPreviewMode={true} />
    </main>
  )
}
