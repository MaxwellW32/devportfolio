import { blogs } from "@/lib/BlogData"
import Blog from "../blog/Blog"
import Reveal from "../ui/Reveal"
import styles from "./blogposts.module.css"

export default function BlogPosts({
  inPreviewMode = false,
  limit,
}: {
  inPreviewMode?: boolean
  limit?: number
}) {
  const shown = limit === undefined ? blogs : blogs.slice(0, limit)

  return (
    <div className={styles.list}>
      {shown.map((eachBlog, eachBlogIndex) => (
        <Reveal key={eachBlog.slug} delay={eachBlogIndex * 70}>
          <Blog {...eachBlog} inPreview={inPreviewMode} />
        </Reveal>
      ))}
    </div>
  )
}
