"use client"
import HideNav from '@/components/hideNav/HideNav'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./musicBox.module.css"
import { boxStats } from './musicTypes'


export default function MusicBox({ container, boxStatsStarter = { boxWidth: 10, xPosition: 0, yPosition: 0, xDirection: 1, yDirection: 1, speed: 1, hue: 360, horizantalBounce: 0.5 }, beatSwitch }: { container: HTMLDivElement, boxStatsStarter?: boxStats, beatSwitch: boolean }) {
    const boxRef = useRef<HTMLDivElement>(null!)
    const boxStats = useRef<boxStats>(boxStatsStarter)

    //start off all
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        startAll()
    }, [])

    //react to beatswitch
    useEffect(() => {
        reactToBeatSwitch(boxStats.current, container)
    }, [beatSwitch])

    function startAll() {
        startMoveLoop()
    }


    function reactToBeatSwitch(boxStatsPassed: boxStats, containerPassed: HTMLDivElement) {
        const randomFlip = Math.random() > boxStatsPassed.horizantalBounce ? "x" : "y"

        //flip direction
        if (randomFlip === "x") {
            //determine left or right hit
            if (boxStatsPassed.xDirection > 0) {
                // console.log(`$hit right`);
                makeReactiveCube("right", containerPassed, boxStatsPassed)
            } else {
                // console.log(`$hit left`);
                makeReactiveCube("left", containerPassed, boxStatsPassed)
            }
            boxStatsPassed.xDirection *= -1
        } else {
            if (boxStatsPassed.yDirection > 0) {
                // console.log(`$hit bottom`);
                makeReactiveCube("bottom", containerPassed, boxStatsPassed)
            } else {
                // console.log(`$hit up`);
                makeReactiveCube("top", containerPassed, boxStatsPassed)
            }
            boxStatsPassed.yDirection *= -1
        }
    }

    function makeReactiveCube(direction: "top" | "bottom" | "left" | "right", containerPassed: HTMLDivElement, boxStatsPassed: boxStats) {
        const newCube = document.createElement("div")

        let cubeWidth = Math.floor(Math.random() * (boxStatsPassed.boxWidth * 5)) + 20
        let cubeHueVariation = Math.floor(Math.random() * 30) + 2
        let cubeX = boxStatsPassed.xPosition
        let cubeY = boxStatsPassed.yPosition

        if (direction === "top") {
            cubeX -= cubeWidth / 2
            cubeY -= cubeWidth
            newCube.classList.add(styles.moveTop)
        } else if (direction === "bottom") {
            cubeX -= cubeWidth / 2
            cubeY += boxStatsPassed.boxWidth
            newCube.classList.add(styles.moveBottom)

        } else if (direction === "left") {
            cubeX -= cubeWidth
            cubeY -= cubeWidth / 2
            newCube.classList.add(styles.moveLeft)

        } else if (direction === "right") {
            cubeX += boxStatsPassed.boxWidth
            cubeY -= cubeWidth / 2
            newCube.classList.add(styles.moveRight)
        }

        newCube.style.backgroundColor = `hsl(${boxStatsPassed.hue + cubeHueVariation},100%, 50%)`
        newCube.style.left = `${cubeX}px`
        newCube.style.top = `${cubeY}px`
        newCube.style.width = `${cubeWidth}px`
        newCube.classList.add(styles.reactiveCube)

        containerPassed.appendChild(newCube)

        setTimeout(() => {
            newCube.remove()
        }, 15000);
    }

    function startMoveLoop() {
        requestAnimationFrame(startMoveLoop)
        moveBox(boxStats.current, container, boxRef.current)
    }

    function moveBox(boxStatsPassed: boxStats, containerPassed: HTMLDivElement, boxRefPassed: HTMLDivElement) {
        let currentPosX = boxStatsPassed.xPosition
        let currentPosY = boxStatsPassed.yPosition

        let newPosX = currentPosX + (boxStatsPassed.xDirection * boxStatsPassed.speed)
        let newPosY = currentPosY + (boxStatsPassed.yDirection * boxStatsPassed.speed)

        const maxWidth = containerPassed.offsetWidth - boxStatsPassed.boxWidth
        const maxHeight = containerPassed.offsetHeight - boxStatsPassed.boxWidth

        if (newPosX < 0 || newPosX > maxWidth) {
            boxStatsPassed.xDirection *= -1
            newPosX = currentPosX
        }

        if (newPosY < 0 || newPosY > maxHeight) {
            boxStatsPassed.yDirection *= -1
            newPosY = currentPosY
        }

        boxStatsPassed.xPosition = newPosX
        boxStatsPassed.yPosition = newPosY
        boxRefPassed.style.translate = `${boxStatsPassed.xPosition}px ${boxStatsPassed.yPosition}px`
    }

    return (
        <div ref={boxRef} className={styles.box} style={{ width: `${boxStats.current.boxWidth}px`, backgroundColor: `hsl(${boxStats.current.hue},100%,50%)` }}></div>
    )
}
