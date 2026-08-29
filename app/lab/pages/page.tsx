import React from 'react'
import styles from "./page.module.css"
import { landingPageExamples } from '@/lib/landingPageExamplesData'
import ShowHomePageExample from '@/components/showHomePageExample/ShowHomePageExample'

export default function Page() {
    return (
        <main>
            <section>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(400px, 100%), 1fr))", gap: "1rem" }}>
                    {landingPageExamples.map((eachHomePageExample, eachHomePageExampleIndex) => {
                        return (
                            <ShowHomePageExample {...eachHomePageExample} key={eachHomePageExampleIndex} />
                        )
                    })}
                </div>
            </section>
        </main>
    )
}
