"use server"

const apiKey = process.env.YT_KEY

export async function getPlaylist(playlistId: string): Promise<string[]> {
    if (!apiKey) throw new Error("YT_KEY is not configured")

    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems")
    url.searchParams.set("part", "contentDetails")
    url.searchParams.set("playlistId", playlistId)
    url.searchParams.set("key", apiKey)
    url.searchParams.set("maxResults", "50")

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`YouTube playlist request failed (${res.status})`)

    const data: { items?: { contentDetails: { videoId: string } }[] } = await res.json()
    return (data.items ?? []).map(item => item.contentDetails.videoId)
}
