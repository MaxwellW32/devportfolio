"use client"
import { useEffect, useMemo, useState } from "react"
import styles from "./style.module.css"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { funItems } from "@/lib/FunData"

export default function ViewProjects({ children, ...elProps }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname()

    const [navHidden, navHiddenSet] = useState(false)

    const [navHiddenOnce, navHiddenOnceSet] = useState(false)
    const [showingMenu, showingMenuSet] = useState(false)

    //hide navs
    useEffect(() => {
        controlNav("hide")

        navHiddenOnceSet(true)

        return () => {
            controlNav("show")
        }
    }, [])

    function controlNav(option: "hide" | "show") {
        const mainNav = document.getElementById(`mainNav`)
        const footerNav = document.getElementById(`footerNav`)

        if (option === "hide") {
            if (mainNav) {
                mainNav.classList.add("hide")
            }

            if (footerNav) {
                footerNav.classList.add("hide")
            }
            navHiddenSet(true)


        } else {
            if (mainNav) {
                mainNav.classList.remove("hide")
            }

            if (footerNav) {
                footerNav.classList.remove("hide")
            }
            navHiddenSet(false)
        }
    }

    const currentIndex = useMemo(() => {
        const pathnameSplit = pathname.split("/")
        const seenSlug = pathnameSplit[pathnameSplit.length - 1]

        let currentIndex = funItems.findIndex(eachFunItem => eachFunItem.slug === seenSlug)
        if (currentIndex < 0) currentIndex = 0

        return currentIndex
    }, [pathname])

    const next = () => {
        let newIndex = currentIndex + 1

        if (newIndex > funItems.length - 1) {
            newIndex = 0
        }

        return newIndex
    }

    const prev = () => {
        let newIndex = currentIndex - 1

        if (newIndex < 0) {
            newIndex = funItems.length - 1
        }

        return newIndex
    }

    return (
        <>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "#000", zIndex: 9999 }} className={`${navHiddenOnce ? styles.fadeOut : ""}`}></div>

            <div {...elProps} style={{ display: !navHiddenOnce ? "none" : "", position: "relative", ...elProps?.style }} >
                {children}

                <div className={styles.menu} style={{ position: "fixed", bottom: 0, left: "50%", translate: "-50%", width: showingMenu ? "100%" : "", display: "grid", justifyItems: "center", zIndex: 9999 }}>
                    <div className={styles.menuButton} style={{ opacity: showingMenu ? 1 : "", marginBottom: "1rem" }}
                        onClick={() => {
                            showingMenuSet(prev => !prev);
                            if (!navHidden) { controlNav("hide") }
                        }}>
                        <svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" /></svg>
                    </div>

                    {showingMenu && (
                        <div style={{ backgroundColor: "#000", color: "#fff", padding: "1rem", display: "grid", gap: ".5rem", justifyItems: "center", width: "min(800px, 100%)" }}>
                            <div style={{ justifySelf: "flex-end" }}
                                onClick={() => {
                                    if (navHidden) {
                                        controlNav("show")
                                    } else {
                                        controlNav("hide")
                                    }
                                }}>
                                <svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
                            </div>

                            <h1 style={{ textAlign: "center" }}>{funItems[currentIndex].title}</h1>

                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: ".5rem" }}>
                                <Link href={`/fun/${funItems[prev()].slug}`}>
                                    <button className="mainButton">Show Prev</button>
                                </Link>

                                <Link href={`/fun/${funItems[next()].slug}`}>
                                    <button className="mainButton">Show Next</button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
