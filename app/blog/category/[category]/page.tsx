import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import Blog from "@/components/blog/Blog"
import { blogs } from "@/lib/BlogData"
import styles from "../../blog.module.css"

export function generateStaticParams() {
  const categories = new Set(blogs.map(eachBlog => eachBlog.category))
  return [...categories].map(category => ({ category }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  return { title: `${category} — Writing` }
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const matching = blogs.filter(eachBlog => eachBlog.category === category)

  if (matching.length === 0) notFound()

  return (
    <main className={`shell ${styles.page}`}>
      <header className={styles.head}>
        <Link href="/blog" className="label labelPlain">← All writing</Link>
        <h1 className={styles.title} style={{ textTransform: "capitalize" }}>{category}</h1>
        <p className={styles.lede}>
          {matching.length} post{matching.length === 1 ? "" : "s"} in this category.
        </p>
      </header>

      <div style={{ display: "grid", gap: "1rem" }}>
        {matching.map(eachBlog => (
          <Blog key={eachBlog.slug} {...eachBlog} inPreview={true} />
        ))}
      </div>
    </main>
  )
}
