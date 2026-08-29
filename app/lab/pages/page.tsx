import Image from "next/image"
import Link from "next/link"

import { landingPageExamples } from "@/lib/landingPageExamplesData"
import styles from "./pagesIndex.module.css"

export default function Page() {
    return (
        <main className={styles.page}>
            <header className={styles.head}>
                <Link href="/lab" className={styles.back}>← Lab</Link>
                <h1>Landing-page studies</h1>
                <p>Each one chases a different mood with a different technique.</p>
            </header>

            <div className={styles.grid}>
                {landingPageExamples.map(eachExample => (
                    <Link key={eachExample.link} href={eachExample.link} className={styles.card}>
                        <div className={styles.thumb}>
                            <Image
                                src={eachExample.image}
                                alt={`${eachExample.title} preview`}
                                width={800}
                                height={500}
                                sizes="(max-width: 700px) 100vw, 400px"
                            />
                        </div>

                        <div className={styles.meta}>
                            <p className="label labelPlain">{eachExample.category}</p>
                            <h2>{eachExample.title}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    )
}
