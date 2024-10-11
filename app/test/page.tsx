"use client"

import React, { useEffect, useRef } from 'react'
import styles from "./page.module.css"
import HideNav from '@/components/hideNav/HideNav'

export default function Page() {
    //just focus on pure functions please -- no matter ow annoying
    const canvasRef = useRef<HTMLDivElement | null>(null)
    type canvasRefType = typeof canvasRef

    type boxStatsType = {
        width: number,
        height: number,
        color: string,
        x: number,
        y: number,
        angle: number,
        ref: HTMLDivElement | null,
        speed: number
    }
    const boxStatsRef = useRef<boxStatsType>({
        width: 20,
        height: 20,
        color: "red",
        x: 0,
        y: 0,
        angle: degreesToRadians(-90), //rad
        ref: null,
        speed: 2
    })
    type boxStatsRefType = typeof boxStatsRef

    const gameClockIntervalRef = useRef<NodeJS.Timeout>()
    type gameClockIntervalRefType = typeof gameClockIntervalRef

    const gameClockLoopTimeRef = useRef(16)
    type gameClockLoopTimeRefType = typeof gameClockLoopTimeRef

    const mountedRef = useRef(false)

    const keysDownRef = useRef({
        up: false,
        down: false,
        left: false,
        right: false,
        turnLeft: false,
        turnRight: false,
    })
    type keysDownRefType = typeof keysDownRef


    //load and start
    useEffect(() => {
        if (mountedRef.current) return
        mountedRef.current = true

        manageGameClockLoop("start", gameClockIntervalRef, gameClockLoopTimeRef, runFrame)

        document.removeEventListener("keydown", handleKeyDown)
        document.addEventListener("keydown", handleKeyDown)

        document.removeEventListener("keyup", handleKeyUp)
        document.addEventListener("keyup", handleKeyUp)
    }, [])

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp") {
            keysDownRef.current.up = true
        }

        if (e.key === "ArrowDown") {
            keysDownRef.current.down = true
        }

        if (e.key === "ArrowLeft") {
            keysDownRef.current.left = true
        }

        if (e.key === "ArrowRight") {
            keysDownRef.current.right = true
        }

        if (e.key.toLowerCase() === "a") {
            keysDownRef.current.turnLeft = true
        }

        if (e.key.toLowerCase() === "d") {
            keysDownRef.current.turnRight = true
        }
    }

    function handleKeyUp(e: KeyboardEvent) {
        if (e.key === "ArrowUp") {
            keysDownRef.current.up = false
        }

        if (e.key === "ArrowDown") {
            keysDownRef.current.down = false
        }

        if (e.key === "ArrowLeft") {
            keysDownRef.current.left = false
        }

        if (e.key === "ArrowRight") {
            keysDownRef.current.right = false
        }

        if (e.key.toLowerCase() === "a") {
            keysDownRef.current.turnLeft = false
        }

        if (e.key.toLowerCase() === "d") {
            keysDownRef.current.turnRight = false
        }
    }

    function assignElementToBoxStatsRef(e: HTMLDivElement | null, boxStatsRef: boxStatsRefType) {
        if (e === null) return

        boxStatsRef.current.ref = e
    }

    function manageGameClockLoop(option: "start" | "edit" | "end", gameClockIntervalRef: gameClockIntervalRefType, gameClockLoopTimeRef: gameClockLoopTimeRefType, callbackFunction: () => void, newTime?: number) {
        if (option === "start") {
            if (gameClockIntervalRef.current) clearInterval(gameClockIntervalRef.current)
            gameClockIntervalRef.current = setInterval(() => {
                callbackFunction()
            }, gameClockLoopTimeRef.current)

        } else if (option === "edit") {
            if (newTime === undefined) return
            gameClockLoopTimeRef.current = newTime
            manageGameClockLoop("start", gameClockIntervalRef, gameClockLoopTimeRef, callbackFunction)
        } else if (option === "end") {
            if (gameClockIntervalRef.current) clearInterval(gameClockIntervalRef.current)
        }
    }

    function runFrame() {
        const newPos = move(boxStatsRef, keysDownRef, canvasRef)
        if (newPos === undefined || boxStatsRef.current.ref === null) return
        // console.log(`$newPos`, newPos);

        boxStatsRef.current.x = newPos.x
        boxStatsRef.current.y = newPos.y
        boxStatsRef.current.angle = newPos.rad

        boxStatsRef.current.ref.style.translate = `${boxStatsRef.current.x}px ${boxStatsRef.current.y}px`
        boxStatsRef.current.ref.style.rotate = `${boxStatsRef.current.angle}rad`

    }

    function degreesToRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    function move(boxStatsRef: boxStatsRefType, keysDownRef: keysDownRefType, canvasRef: canvasRefType) {
        if (canvasRef.current === null) return

        const originalX = boxStatsRef.current.x
        const originalY = boxStatsRef.current.y

        let x = boxStatsRef.current.x
        let y = boxStatsRef.current.y

        let rad = boxStatsRef.current.angle

        if (keysDownRef.current.turnLeft) {
            rad -= degreesToRadians(1)
        }

        if (keysDownRef.current.turnRight) {
            rad += degreesToRadians(1)
        }

        if (keysDownRef.current.up) { //forward
            x += boxStatsRef.current.speed * Math.cos(rad);
            y += boxStatsRef.current.speed * Math.sin(rad);
        }

        if (keysDownRef.current.down) { //backward
            x -= boxStatsRef.current.speed * Math.cos(rad);
            y -= boxStatsRef.current.speed * Math.sin(rad);
        }

        if (keysDownRef.current.left) { //left
            x += boxStatsRef.current.speed * Math.cos(rad - Math.PI / 2);
            y += boxStatsRef.current.speed * Math.sin(rad - Math.PI / 2);
        }

        if (keysDownRef.current.right) { //right
            x += boxStatsRef.current.speed * Math.cos(rad + Math.PI / 2);
            y += boxStatsRef.current.speed * Math.sin(rad + Math.PI / 2);
        }

        if (x < 0 || x > (canvasRef.current.clientWidth - boxStatsRef.current.width)) {
            x = originalX
        }

        if (y < 0 || y > (canvasRef.current.clientHeight - boxStatsRef.current.height)) {
            y = originalY
        }

        return { x, y, rad }
    }

    return (
        <HideNav>
            {/* gamefloor */}
            <div ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "purple", }}>

                {/* box */}
                <div ref={(e) => assignElementToBoxStatsRef(e, boxStatsRef)} style={{ position: "absolute", top: 0, left: 0, width: `${boxStatsRef.current.width}px`, height: `${boxStatsRef.current.height}px`, backgroundColor: `${boxStatsRef.current.color}`, transform: `rotate(${degreesToRadians(90)}rad)` }}>

                    {/* marker */}
                    <div style={{ width: "100%", height: "10%", backgroundColor: "yellow", position: "absolute", top: 0, left: 0 }}></div>
                </div>
            </div>
        </HideNav>
    )
}
