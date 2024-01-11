import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function ShowHomePageExample({ image, title, category, link }: { image: string, category: string, title: string, link: string }) {
    return (
        <Link href={link} style={{ display: "flex", flexDirection: "column", gap: "1rem", scrollSnapAlign: "start" }}>
            <div style={{ position: "relative", aspectRatio: "1/1" }}>
                <Image alt={`homePage example ${title}'s cover image`} fill={true} src={image} style={{ objectFit: "cover" }} />
            </div>

            <h3>{title}</h3>

            <p style={{ fontSize: "var(--smallFontSize)" }}>{category}</p>
        </Link>
    )
}
