"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./styles.module.css"
import { Roboto_Mono, Comic_Neue } from 'next/font/google'


const comin_nue = Comic_Neue({
    subsets: ['latin'],
    variable: '--font-comic-nue',
    weight: ["300", "400", "700"],
    display: 'swap',
})

const roboto_mono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-roboto-mono',
    display: 'swap',
})


export type boardInfoType = {
    maxWidth: number,
    maxHeight: number,
    mouseX: number | undefined,
    mouseY: number | undefined,
}

export default function Page() {
    const boardInfo = useRef<boardInfoType | undefined>({
        maxHeight: 0,
        maxWidth: 0,
        mouseX: undefined,
        mouseY: undefined,
    })

    useEffect(() => {
        boardInfo.current!.maxHeight = wormParent.current!.clientHeight
        boardInfo.current!.maxWidth = wormParent.current!.clientWidth
    }, [])

    const wormParent = useRef<HTMLDivElement>(null)
    const scrollCont = useRef<HTMLDivElement>(null)

    return (
        <div ref={scrollCont} className={`${styles.starsMainDiv} ${roboto_mono.variable} ${comin_nue.variable}`} style={{ backgroundColor: "#000", overflowY: "auto", display: "grid", gridAutoRows: "80vh", }}>
            <div ref={wormParent} style={{ overflow: "hidden", position: "relative", backgroundImage: `url(${require("@/public/landingPageExamples/stars/mountain.png").default.src})`, backgroundSize: "cover", display: "grid", gridTemplateRows: "1fr" }}
                onMouseMove={(e) => {
                    boardInfo.current!.mouseX = e.clientX - wormParent.current!.offsetLeft
                    boardInfo.current!.mouseY = (e.pageY - wormParent.current!.offsetTop) + scrollCont.current!.scrollTop
                }}

                onMouseLeave={() => {
                    boardInfo.current!.mouseX = undefined
                    boardInfo.current!.mouseY = undefined
                    boardInfo.current!.maxWidth = wormParent.current!.offsetWidth
                    boardInfo.current!.maxHeight = wormParent.current!.offsetHeight
                }}>
                {boardInfo.current && new Array(20).fill(0).map((eachItem, eachItemIndex) => {
                    return <Worm key={eachItemIndex} boardInfo={boardInfo.current} />
                })}
            </div>
        </div>
    )
}



function Worm({ boardInfo }: { boardInfo: boardInfoType | undefined }) {
    const wormRef = useRef<HTMLDivElement>(null)
    const [canShow, canShowSet] = useState(false)
    const [currentPos, currentPosSet] = useState({ x: 0, y: 0 })
    const [animationTime, animationTimeSet] = useState(getRandomNumber(2000, 1000))
    const wormHeight = 2
    const seenCloseToMouse = useRef(false)

    function getRandomNumber(range: number, lowestVal: number = 0) {
        return Math.floor(Math.random() * range) + lowestVal
    }

    useEffect(() => {
        start()

        return () => {
            if (movingInterval.current) {
                clearInterval(movingInterval.current)
            }
        }
    }, [])

    const movingInterval = useRef<undefined | NodeJS.Timeout>()
    function start() {
        setTimeout(() => {
            canShowSet(true)
        }, animationTime * 2)

        movingInterval.current = setInterval(() => {
            move()
        }, animationTime)
    }

    function move() {
        if (!boardInfo) return
        const maxHeight = boardInfo!.maxHeight
        const maxWidth = boardInfo!.maxWidth

        const limit = 50
        const mouseX = boardInfo!.mouseX
        const mouseY = boardInfo!.mouseY

        if (boardInfo.mouseX === undefined || boardInfo.mouseY === undefined) {
            seenCloseToMouse.current = false
            wormRef.current!.classList.remove(styles.highlightedWorm)
        }

        let randX = 0
        let randY = 0

        if (seenCloseToMouse.current) {
            let smallLimit = 30
            let changeMulti = 1

            if (Math.random() * 1 > .5) changeMulti *= -1
            randX = mouseX! + (Math.floor(Math.random() * smallLimit) * changeMulti)
            randY = mouseY! + (Math.floor(Math.random() * smallLimit) * changeMulti)

        } else {
            randX = Math.floor(Math.random() * maxWidth!)
            randY = Math.floor(Math.random() * maxHeight!)
        }

        if (mouseX !== undefined && mouseY !== undefined && (randX > mouseX - limit && randX < mouseX + limit)) {
            if (randY > mouseY - limit && randY < mouseY + limit) {
                seenCloseToMouse.current = true
                setTimeout(() => {
                    wormRef.current!.classList.add(styles.highlightedWorm)
                }, animationTime / 3)
            }
        } else {
            wormRef.current!.classList.remove(styles.highlightedWorm)
        }

        currentPosSet({ x: randX, y: randY })
    }

    return (
        <div ref={wormRef} style={{ backgroundColor: "#fff", position: "absolute", width: `${wormHeight}px`, aspectRatio: "1/1", top: 0, left: 0, translate: `${currentPos.x}px ${currentPos.y}px`, rotate: `${0}deg`, opacity: canShow ? 1 : 0, transition: `translate ${animationTime}ms, opacity ${animationTime}ms`, pointerEvents: "none", userSelect: "none" }}></div>
    )

}