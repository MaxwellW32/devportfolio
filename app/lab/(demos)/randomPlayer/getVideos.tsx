"use server"

const apiKey = process.env.YT_KEY

export type youtubeSearchResult = {
    id: { videoId: string }
    snippet: {
        title: string
        description: string
        channelTitle: string
        publishedAt: string
        thumbnails: { medium?: { url: string }, high?: { url: string } }
    }
}

export async function getVideos(searchNumber: number, searchString: string): Promise<youtubeSearchResult[]> {
    if (!apiKey) throw new Error("YT_KEY is not configured")

    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("maxResults", String(searchNumber))
    url.searchParams.set("q", searchString)
    url.searchParams.set("type", "video")
    url.searchParams.set("key", apiKey)

    const res = await fetch(url, { next: { revalidate: 600 } })
    if (!res.ok) throw new Error(`YouTube search request failed (${res.status})`)

    const data: { items?: youtubeSearchResult[] } = await res.json()
    return data.items ?? []
}
