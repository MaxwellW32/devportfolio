"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from "./style.module.css"

//row one is color
//row two is objects
//row three is frequency
//row four is animation

const seedOptions = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
const seedLetterToNumber: { [key: string]: number } = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
    k: 11,
    l: 12,
    m: 13,
    n: 14,
    o: 15,
    p: 16,
    q: 17,
    r: 18,
    s: 19,
    t: 20,
    u: 21,
    v: 22,
    w: 23,
    x: 24,
    y: 25,
    z: 26,
};

export default function Page() {
    const mainContRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const markerRef = useRef<HTMLDivElement | null>(null)

    const [viewingSettings, viewingSettingsSet] = useState(false)

    type keys = {
        up: boolean,
        down: boolean,
        left: boolean,
        right: boolean,
    }

    const keysDown = useRef<keys>({
        up: false,
        down: false,
        left: false,
        right: false,
    })

    type playerType = {
        x: number,
        y: number,
        size: number,
        color: string,
        speed: number,
        element: HTMLDivElement | null
    }
    const seedArray = useRef("abcdefghijklmnop-macdefghijklmnop-abcfhfghijklmnop-abcdefggojklmnop".split("-"))
    const canvasSize = useRef(10_000_000)

    type biomeType = {
        x: number,
        y: number,
        el: HTMLDivElement,
    }
    const biomeSize = useRef(canvasSize.current / 5_000)
    const biomes = useRef<biomeType[]>([])
    const closestBiomeId = useRef("")

    const playerStats = useRef<playerType>({
        x: 0,
        y: 0,
        size: 10,
        color: "green",
        speed: 10,
        element: null
    })

    //start Off
    useEffect(() => {
        if (mainContRef.current === null || canvasRef.current === null || playerStats.current.element === null) return

        //initial fit to screen
        fitElementToScreen(mainContRef.current)

        //event listender to always fit screen
        window.addEventListener("resize", () => mainContRef.current !== null && fitElementToScreen(mainContRef.current))

        //initial set canvas to correct size
        canvasRef.current.style.height = `${canvasSize.current}px`
        canvasRef.current.style.width = `${canvasSize.current}px`

        playerStats.current.element.style.height = `${playerStats.current.size}px`
        playerStats.current.element.style.width = `${playerStats.current.size}px`
        playerStats.current.element.style.backgroundColor = playerStats.current.color

        //center player on screen
        playerStats.current.x = canvasRef.current.clientWidth / 2 - playerStats.current.size / 2
        playerStats.current.y = canvasRef.current.clientHeight / 2 - playerStats.current.size / 2
        playerStats.current.element.style.translate = `${playerStats.current.x}px ${playerStats.current.y}px`

        generateBiomes()

        //add event listeners to move player
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        //loop to display world
        setInterval(handleFrame, 20);

        return () => {
            window.removeEventListener("resize", () => mainContRef.current !== null && fitElementToScreen(mainContRef.current))
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])

    function fitElementToScreen(element: HTMLElement) {
        element.style.height = `${window.innerHeight}px`
        element.style.width = `${window.innerWidth}px`
    }

    function generateBiomes(radius = 1) {
        // Clear previous biomes and canvas
        biomes.current.forEach(eachBiome => {
            eachBiome.el.remove()
        })
        biomes.current = [];

        // Get closest biome border
        const nearestBorderX = roundToNearestInteger(playerStats.current.x, biomeSize.current);
        const nearestBorderY = roundToNearestInteger(playerStats.current.y, biomeSize.current);
        closestBiomeId.current = `${nearestBorderX}${nearestBorderY}`

        // console.log(`Player position:`, playerStats.x, playerStats.y);
        // console.log(`Nearest whole number:`, nearestBorderX, nearestBorderY);

        // Loop through the surrounding squares
        for (let xOffset = -radius; xOffset <= radius; xOffset++) {
            for (let yOffset = -radius; yOffset <= radius; yOffset++) {
                // Skip if both offsets are 0 (the center biome)
                if (xOffset === 0 && yOffset === 0) continue;

                // Calculate biome position
                const biomeX = nearestBorderX + xOffset * biomeSize.current;
                const biomeY = nearestBorderY + yOffset * biomeSize.current;

                // Generate the biome
                generateBiome(biomeX, biomeY);
            }
        }

        // Generate the center biome
        generateBiome(nearestBorderX, nearestBorderY);
    }

    function generateBiome(x: number, y: number) {
        //consider the biomes location...
        //then consider the seed...
        //start with 
        //color...
        //elements
        //frequency of elements
        //rotations
        //gradient

        if (canvasRef.current === null) return

        const newBiome: biomeType = {
            x: x,
            y: y,
            el: document.createElement("div")
        }

        newBiome.el.style.width = `${biomeSize.current}px`
        newBiome.el.style.height = `${biomeSize.current}px`
        newBiome.el.style.translate = `${x}px ${y}px`
        newBiome.el.classList.add(styles.biome)

        //modifiers declaration
        const colorModification = seedLetterToNumber[seedArray.current[0][0]] * 100
        const elementsModification = seedLetterToNumber[seedArray.current[1][0]] * 100

        //custom biome settings
        const biomeTotalPosition = x + y
        const biomeColor = (biomeTotalPosition + colorModification) % 360

        newBiome.el.style.backgroundColor = `hsl(${biomeColor},100%, 50%)`

        biomes.current.push(newBiome)
        canvasRef.current.appendChild(newBiome.el)
    }

    function centerPlayerOnScreen(x: number, y: number, parentElement: HTMLElement) {
        parentElement.scrollTop = y - parentElement.clientHeight / 2
        parentElement.scrollLeft = x - parentElement.clientWidth / 2
    }

    function handleKeyDown(e: KeyboardEvent) {
        const seenKey = e.key.toLowerCase()

        if (seenKey === "arrowup" || seenKey === "w") {
            keysDown.current.up = true
        }

        if (seenKey === "arrowdown" || seenKey === "s") {
            keysDown.current.down = true
        }

        if (seenKey === "arrowleft" || seenKey === "a") {
            keysDown.current.left = true
        }

        if (seenKey === "arrowright" || seenKey === "d") {
            keysDown.current.right = true
        }

    }

    function handleKeyUp(e: KeyboardEvent) {
        const seenKey = e.key.toLowerCase()

        if (seenKey === "arrowup" || seenKey === "w") {
            keysDown.current.up = false
        }

        if (seenKey === "arrowdown" || seenKey === "s") {
            keysDown.current.down = false
        }

        if (seenKey === "arrowleft" || seenKey === "a") {
            keysDown.current.left = false
        }

        if (seenKey === "arrowright" || seenKey === "d") {
            keysDown.current.right = false
        }

    }

    function movePlayer() {
        if (playerStats.current.element === null) return

        if (keysDown.current.up) {
            playerStats.current.y -= playerStats.current.speed
        }
        if (keysDown.current.down) {
            playerStats.current.y += playerStats.current.speed
        }
        if (keysDown.current.left) {
            playerStats.current.x -= playerStats.current.speed
        }
        if (keysDown.current.right) {
            playerStats.current.x += playerStats.current.speed
        }

        playerStats.current.element.style.translate = `${playerStats.current.x}px ${playerStats.current.y}px`
    }

    function handleFrame() {
        if (mainContRef.current === null) return

        movePlayer()

        //center canvas around player
        centerPlayerOnScreen(playerStats.current.x, playerStats.current.y, mainContRef.current)

        //get closest biome
        const nearestBorderX = roundToNearestInteger(playerStats.current.x, biomeSize.current);
        const nearestBorderY = roundToNearestInteger(playerStats.current.y, biomeSize.current);
        const currentClosestBiomeId = `${nearestBorderX}${nearestBorderY}`

        if (currentClosestBiomeId !== closestBiomeId.current) {
            generateBiomes()
        }
    }

    function roundToNearestInteger(num: number, degree: number) {
        return Math.round(num / degree) * degree
    }

    function assignRefToPlayerStats(e: HTMLDivElement | null) {
        if (e === null) return

        playerStats.current.element = e
    }

    return (
        <main ref={mainContRef} className={styles.mainCont}>
            <div ref={canvasRef} className={styles.canvas}>
                <div ref={assignRefToPlayerStats} className={styles.player}></div>
                <div ref={markerRef} className={styles.marker}></div>
            </div>

            <div style={{ position: "absolute", top: 0, right: 0 }}>
                <button
                    onClick={() => {
                        viewingSettingsSet(prev => !prev)
                    }}
                >settings</button>

                <div style={{ padding: "1rem", border: "1px solid #000", display: !viewingSettings ? "none" : "" }}>
                    <input type="text" placeholder="Enter a seed a-z 0-9" />
                    <button
                        onClick={() => {

                        }}
                    >Generate</button>
                </div>
            </div>
        </main>
    )
}
