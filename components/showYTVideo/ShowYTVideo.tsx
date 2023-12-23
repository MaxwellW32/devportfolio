import YoutubeUrlParse from '@/useful/YoutubeUrlParse'
import React from 'react'

export default function ShowYTVideo({ url }: { url: string }) {
    return (
        <iframe
            style={{ width: "100%", height: "100%" }}
            src={`https://www.youtube.com/embed/${YoutubeUrlParse(url)}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    )
}
