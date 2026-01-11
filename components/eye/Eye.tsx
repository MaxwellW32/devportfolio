"use client"
import styles from "./style.module.css"
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import eye from "@/public/eye/eyecool.png"
import eyeShadow from "@/public/eye/eye shadow.png"
import eyeOutline from "@/public/eye/eye outline only.png"

export default function Eye() {
    const eyeContRef = useRef<HTMLDivElement>(null!)
    const realEyeRef = useRef<HTMLImageElement>(null!)
    const anchorRef = useRef<HTMLDivElement>(null!)

    useEffect(() => {
        //move eye with cursor
        let eyeMiddleFocused = false
        const angle = (cx: number, cy: number, ex: number, ey: number) => {
            const dy = ey - cy
            const dx = ex - cx
            const rad = Math.atan2(dy, dx)
            const deg = rad * 180 / Math.PI
            return deg
        }

        const moveEyes = (event: MouseEvent) => {
            const { clientX, clientY } = event

            const rekt = anchorRef.current.getBoundingClientRect()
            const anchorX = rekt.left + rekt.width / 2
            const anchorY = rekt.top + rekt.height / 2

            let distanceX = anchorX - clientX
            let distanceY = anchorY - clientY

            if (distanceX < 0) {
                distanceX *= -1
            }

            if (distanceY < 0) {
                distanceY *= -1
            }

            let limit = 70
            if (distanceX < limit && distanceY < limit) {
                eyeMiddleFocused = true

                realEyeRef.current.style.transition = `translate 1s`
                realEyeRef.current.style.translate = `0%`

            } else {

                if (eyeMiddleFocused) {
                    realEyeRef.current.style.translate = `-5%`

                    setTimeout(() => {
                        realEyeRef.current.style.transition = `translate 400ms`
                    }, 1000)

                    eyeMiddleFocused = false
                }

                const angleDeg = angle(clientX, clientY, anchorX, anchorY)

                realEyeRef.current.style.rotate = `${-angleDeg}deg`
                eyeContRef.current.style.rotate = `${angleDeg}deg`
            }

        }

        document.addEventListener("mousemove", moveEyes)

        return () => document.removeEventListener("mousemove", moveEyes)
    }, [])

    return (
        <div className={styles.eyeMainDiv} ref={anchorRef} style={{ width: "300px", aspectRatio: "1/1", position: "relative", overflow: "hidden" }}>
            <div ref={eyeContRef} style={{ position: "absolute", aspectRatio: "1/1", width: "100%", top: 0, left: 0 }}>
                <Image ref={realEyeRef} alt="eye" src={eye} style={{ position: "relative", aspectRatio: "1/1", width: "100%", objectFit: "cover", top: 0, left: 0 }} />
            </div>
            <Image style={{ position: "absolute", aspectRatio: "1/1", width: "100%", objectFit: "cover", top: 0, left: 0 }} alt="eyeshadow" src={eyeShadow} />
            <Image style={{ position: "absolute", aspectRatio: "1/1", width: "100%", objectFit: "cover", top: 0, left: 0 }} alt="eyeoutline" src={eyeOutline} />
        </div>
    );
}