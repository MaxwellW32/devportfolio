import Eye from '@/components/eye/Eye'
import Player from '@/components/player/Player'
import { funItems } from '@/lib/FunData'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Page() {
    return (
        <div>
            <Player />

            <section style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
                <h1>Welcome to some Fun</h1>

                <Eye />
            </section>

            <section>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%),1fr))" }}>
                    {funItems.map(eachFunItem => {
                        return (
                            <Link key={eachFunItem.slug} href={`/fun/${eachFunItem.slug}`} style={{ backgroundColor: "var(--backgroundColor)", display: "grid", gridTemplateRows: "1fr auto", }}>
                                <div style={{ overflow: "hidden", width: "100%", aspectRatio: "1/1" }}>
                                    <Image alt={`${eachFunItem.title}'s image`} src={eachFunItem.image} width={500} height={500} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                </div>

                                <div style={{ padding: "1rem", color: "#fff", display: "grid", gap: ".5rem", whiteSpace: "nowrap", }}>
                                    <h3 data-platform-enabled="true" style={{ justifySelf: "flex-start" }}>{eachFunItem.title}</h3>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
