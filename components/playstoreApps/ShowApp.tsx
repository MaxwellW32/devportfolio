import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function ShowApp({ image, title, link, categories, imageContWidth = "min(400px, 80vw)" }: { image: string, title: string, link: string, categories: string, imageContWidth?: string }) {

    return (
        <Link href={link} target='blank_' style={{ display: "grid", gap: "1rem", gridTemplateRows: "auto 1fr auto", scrollSnapAlign: "start" }}>
            <div style={{ position: "relative", aspectRatio: "1/1", width: imageContWidth }}>
                <Image alt={`${title}'s cover image`} fill={true} src={image} style={{ objectFit: "cover" }} />
            </div>
            <h1>{title}{!link && " - Coming Soon"}</h1>

            <p>{categories}</p>
        </Link>
    )
}