"use client"

import { useEffect, useState } from "react"


export default function HideNav({
    children,
}: {
    children: React.ReactNode
}) {
    const [navHidden, navHiddenSet] = useState(false)

    const [navHiddenOnce, navHiddenOnceSet] = useState(false)

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
        const musicBox = document.querySelector(`.musicCont`)

        if (option === "hide") {
            if (mainNav) {
                mainNav.classList.add("hide")
            }

            if (footerNav) {
                footerNav.classList.add("hide")
            }

            if (musicBox) {
                musicBox.classList.add("hide")
            }
            navHiddenSet(true)


        } else {
            if (mainNav) {
                mainNav.classList.remove("hide")
            }

            if (footerNav) {
                footerNav.classList.remove("hide")
            }

            if (musicBox) {
                musicBox.classList.remove("hide")
            }
            navHiddenSet(false)
        }
    }

    return (
        <div className="blackFadeIn" style={{ "--animationPlaystate": navHiddenOnce ? "running" : "paused" } as React.CSSProperties}>
            {children}

            <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "fixed", width: "1.5rem", bottom: 0, right: 0, margin: "1rem", zIndex: 999 }}
                onClick={() => {
                    if (navHidden) {
                        controlNav("show")
                    } else {
                        controlNav("hide")
                    }
                }}
                viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
        </div>
    )
}
