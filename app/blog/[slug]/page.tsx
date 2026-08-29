import Blog from '@/components/blog/Blog';
import { blogs } from '@/lib/BlogData';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const foundBlog = blogs.find(eachBlog => eachBlog.slug === slug)

    if (!foundBlog) return <p>Blog Not Found</p>

    return (
        <Blog {...foundBlog} />
    )
}
