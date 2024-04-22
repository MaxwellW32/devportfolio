"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./page.module.css"
import HideNav from '@/components/hideNav/HideNav'
import { shellStats, generalInfo, keysCurrentlyPressed, tankStats } from './roomTypes'
import InfoMarker from '@/components/infoMarker/InfoMarker'
import { v4 as uuidV4 } from "uuid"

export default function Page() {
    const tankRef = useRef<HTMLDivElement>(null!)
    const canvasRef = useRef<HTMLDivElement>(null!)
    const rooms = useRef<HTMLDivElement[]>([])
    const shells = useRef<shellStats[]>([])
    const generalInfo = useRef<generalInfo>({
        roomWidth: 1000,
        amountOfLanes: 10
    })
    const keysCurrentlyPressed = useRef<keysCurrentlyPressed>({
        up: false,
        down: false,
        left: false,
        right: false,
        blast: false
    })
    const tankStats = useRef<tankStats>({
        id: "max",
        width: 20,
        x: 0,
        y: 0,
        speed: 2,
        directionFacing: "down-right"
    })
    const animationFrameId = useRef<number>()
    const shellAnimationFrameId = useRef<number>()

    //start off
    const ranOnce = useRef(false)
    useEffect(() => {
        if (ranOnce.current) return
        ranOnce.current = true

        startOff()
    }, [])

    function startOff() {
        //place tank in right position
        tankStats.current.x = generalInfo.current.roomWidth / 2 - tankStats.current.width / 2
        tankStats.current.y = generalInfo.current.roomWidth / 2 - tankStats.current.width / 2

        //generate rooms
        for (let index = 0; index < 4; index++) {
            addRoom(generalInfo.current, rooms.current, canvasRef.current)
        }

        //remove prev listeners
        document.body.removeEventListener("keydown", (e) => detectKeys(e, "keydown", keysCurrentlyPressed.current))
        document.body.removeEventListener("keyup", (e) => detectKeys(e, "keyup", keysCurrentlyPressed.current))

        //add key listener to move tank
        document.body.addEventListener("keydown", (e) => detectKeys(e, "keydown", keysCurrentlyPressed.current))
        document.body.addEventListener("keyup", (e) => detectKeys(e, "keyup", keysCurrentlyPressed.current))

        //start movement loop
        //ensure animation loop starts fresh
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
        continuousMovementLoop()

        if (shellAnimationFrameId.current) cancelAnimationFrame(shellAnimationFrameId.current)
        continuousMoveShellLoop(shells.current)
    }

    function addRoom(generalInfoLocal: generalInfo, roomsLocal: HTMLDivElement[], canvasRefLocal: HTMLDivElement) {
        const randR = Math.floor(Math.random() * 256)
        const randG = Math.floor(Math.random() * 256)
        const randB = Math.floor(Math.random() * 256)

        const newRoom = document.createElement("div")

        newRoom.classList.add(styles.room)
        newRoom.style.width = `${generalInfoLocal.roomWidth}px`
        newRoom.style.backgroundColor = `rgba(${randR},${randG},${randB},0.2)`

        roomsLocal.push(newRoom)
        canvasRefLocal.append(newRoom)

        const newestRoomAdded = roomsLocal[roomsLocal.length - 1]


        //generate maze
        const singleLaneWidth = generalInfoLocal.roomWidth / generalInfoLocal.amountOfLanes

        const makePath = (option: "vertical" | "horizantal") => {
            if (option === "horizantal") {
                const newHorizantalPath = document.createElement("div")
                const pathHeight = singleLaneWidth
                const pathWidth = newestRoomAdded.offsetWidth
                const pathLeft = newestRoomAdded.offsetLeft
                const pathTop = (newestRoomAdded.clientHeight / 2) - (pathHeight / 2)

                newHorizantalPath.style.height = `${pathHeight}px`
                newHorizantalPath.style.width = `${pathWidth}px`
                newHorizantalPath.style.top = `${pathTop}px`
                newHorizantalPath.style.left = `${pathLeft}px`
                newHorizantalPath.classList.add(styles.path)

                newestRoomAdded.append(newHorizantalPath)

            } else {
                const newVerticalPath = document.createElement("div")
                const pathHeight = newestRoomAdded.clientHeight
                const pathWidth = singleLaneWidth
                const pathLeft = (newestRoomAdded.offsetLeft + (newestRoomAdded.clientWidth / 2)) - pathWidth / 2
                const pathTop = newestRoomAdded.clientTop

                newVerticalPath.style.height = `${pathHeight}px`
                newVerticalPath.style.width = `${pathWidth}px`
                newVerticalPath.style.top = `${pathTop}px`
                newVerticalPath.style.left = `${pathLeft}px`
                newVerticalPath.classList.add(styles.path)

                newestRoomAdded.append(newVerticalPath)
            }
        }
        makePath("horizantal")
        makePath("vertical")
    }

    function detectKeys(e: KeyboardEvent, option: "keydown" | "keyup", keysCurrentlyPressedLocal: keysCurrentlyPressed) {
        const seenKey = e.key.toLowerCase()

        if (seenKey === "arrowup" || seenKey === "w") {
            keysCurrentlyPressedLocal.up = option === "keydown" ? true : false
        }
        if (seenKey === "arrowdown" || seenKey === "s") {
            keysCurrentlyPressedLocal.down = option === "keydown" ? true : false
        }
        if (seenKey === "arrowleft" || seenKey === "a") {
            keysCurrentlyPressedLocal.left = option === "keydown" ? true : false
        }
        if (seenKey === "arrowright" || seenKey === "d") {
            keysCurrentlyPressedLocal.right = option === "keydown" ? true : false
        }
        if (seenKey === "x") {
            keysCurrentlyPressedLocal.blast = option === "keydown" ? true : false
            if (keysCurrentlyPressedLocal.blast) {
                console.log(`$fired`);
                blastFromTank()
            }
        }
    }

    function continuousMovementLoop() {
        animationFrameId.current = requestAnimationFrame(continuousMovementLoop)

        //moveTank Loop
        const newTankPos = moveTankPosition(keysCurrentlyPressed.current, tankStats.current, rooms.current)
        tankStats.current.x = newTankPos.newXPos
        tankStats.current.y = newTankPos.newYPos
        placeTankAtLocation({ x: tankStats.current.x, y: tankStats.current.y }, tankRef.current)

        //center screen
        centerCanvas(tankStats.current.x, tankStats.current.y, canvasRef.current)

        //run room check - ensure infinite rooms
        ensureInfiniteRooms(rooms.current, tankStats.current, generalInfo.current, canvasRef.current)
    }

    function moveTankPosition(keysCurrentlyPressedLocal: keysCurrentlyPressed, tankStatsLocal: tankStats, roomsLocal: HTMLDivElement[],) {
        let newXPos = tankStatsLocal.x
        let newYPos = tankStatsLocal.y

        let currentRoomIndex = 0 //assign box to correct room
        roomsLocal.forEach((eachRoom, eachRoomIndex) => {
            if (newXPos > eachRoom.offsetLeft) {
                currentRoomIndex = eachRoomIndex
                return
            }
        })

        const notOnLastRoom = currentRoomIndex !== roomsLocal.length - 1
        const usingPrevRoom = currentRoomIndex !== 0
        const usingNextRoom = notOnLastRoom

        const pathsInPrevRoom = usingPrevRoom ? roomsLocal[currentRoomIndex - 1].childNodes : [];
        const pathsInCurrentRoom = roomsLocal[currentRoomIndex].childNodes;
        const pathsInNextRoom = usingNextRoom ? roomsLocal[currentRoomIndex + 1].childNodes : [];

        const allPaths: HTMLDivElement[] = []

        pathsInPrevRoom.forEach(eachPath => {
            allPaths.push(eachPath as HTMLDivElement)
        })//add all paths to allpaths array
        pathsInCurrentRoom.forEach(eachPath => {
            allPaths.push(eachPath as HTMLDivElement)
        })
        pathsInNextRoom.forEach(eachPath => {
            allPaths.push(eachPath as HTMLDivElement)
        })

        if (keysCurrentlyPressedLocal.up) {//change position
            newYPos -= tankStatsLocal.speed
        }
        if (keysCurrentlyPressedLocal.down) {
            newYPos += tankStatsLocal.speed
        }
        if (keysCurrentlyPressedLocal.left) {
            newXPos -= tankStatsLocal.speed
        }
        if (keysCurrentlyPressedLocal.right) {
            newXPos += tankStatsLocal.speed
        }

        let canMove = false;
        allPaths.forEach(eachPath => {
            const pathConnectsRooms = roomsLocal[currentRoomIndex].offsetLeft + roomsLocal[currentRoomIndex].clientWidth === eachPath.offsetLeft + eachPath.clientWidth

            const minXPos = eachPath.offsetLeft + (pathConnectsRooms ? - tankStatsLocal.width : 0)
            const maxXPos = eachPath.offsetLeft + eachPath.clientWidth + (pathConnectsRooms ? 0 : - tankStatsLocal.width)

            const minYPos = eachPath.offsetTop
            const maxYPos = eachPath.offsetTop + eachPath.clientHeight - tankStatsLocal.width

            if (newXPos >= minXPos && newXPos <= maxXPos && newYPos >= minYPos && newYPos <= maxYPos) {
                canMove = true;
            }
        });

        if (!canMove) {
            newXPos = tankStatsLocal.x
            newYPos = tankStatsLocal.y
        }

        return { newXPos, newYPos }
    }

    function placeTankAtLocation({ x, y }: { x: number, y: number }, tankRefLocal: HTMLDivElement) {
        tankRefLocal.style.translate = `${x}px ${y}px`
    }

    function centerCanvas(x: number, y: number, canvasRefLocal: HTMLDivElement) {
        canvasRef.current.clientWidth
        canvasRef.current.scrollWidth
        canvasRef.current.scrollLeft

        const middleOfScreenXPos = canvasRef.current.scrollLeft + (canvasRef.current.clientWidth / 2)
        const middleOfScreenYPos = canvasRef.current.scrollTop + (canvasRef.current.clientHeight / 2)

        const newMiddleX = x
        const newMiddleY = y

        const differenceBetweenLocationX = newMiddleX - middleOfScreenXPos
        const differenceBetweenLocationY = newMiddleY - middleOfScreenYPos

        canvasRefLocal.scrollLeft += differenceBetweenLocationX
        canvasRefLocal.scrollTop += differenceBetweenLocationY
    }

    function ensureInfiniteRooms(roomsLocal: HTMLDivElement[], tankStatsLocal: tankStats, generalInfoLocal: generalInfo, canvasRefLocal: HTMLDivElement) {
        //check room tank is in
        let currentRoom = 0 //assign box to correct room
        roomsLocal.forEach((eachRoom, eachRoomIndex) => {
            if (tankStatsLocal.x > eachRoom.offsetLeft) {
                currentRoom = eachRoomIndex + 1
                return
            }
        })

        //check amount of rooms left
        const amountOfRoomsLeft = roomsLocal.length - currentRoom

        //spawn more rooms
        if (amountOfRoomsLeft <= 2) {
            addRoom(generalInfoLocal, roomsLocal, canvasRefLocal)
        }
    }

    function blastFromTank() {
        let xDirection = 0
        let yDirection = 0

        if (tankStats.current.directionFacing === "up") {
            yDirection = -1

        } else if (tankStats.current.directionFacing === "down") {
            yDirection = 1

        } else if (tankStats.current.directionFacing === "left") {
            xDirection = -1

        } else if (tankStats.current.directionFacing === "right") {
            xDirection = 1

        } else if (tankStats.current.directionFacing === "up-left") {
            xDirection = -1
            yDirection = -1

        } else if (tankStats.current.directionFacing === "up-right") {
            xDirection = 1
            yDirection = -1

        } else if (tankStats.current.directionFacing === "down-left") {
            xDirection = -1
            yDirection = 1

        } else if (tankStats.current.directionFacing === "down-right") {
            xDirection = 1
            yDirection = 1
        }

        const newShellEl = document.createElement("div")

        const newShell: shellStats = {
            id: uuidV4(),
            firedFrom: tankStats.current.id,
            width: 10,
            x: tankStats.current.x,
            y: tankStats.current.y,
            xDirection: xDirection,
            yDirection: yDirection,
            wallsHit: 0,
            el: newShellEl
        }

        newShell.el.style.width = `${newShell.width}px`
        newShell.el.classList.add(styles.shell)

        shells.current.push(newShell)
        canvasRef.current.append(newShell.el)
    }

    function continuousMoveShellLoop(shellsLocal: shellStats[]) {
        shellAnimationFrameId.current = requestAnimationFrame(() => { continuousMoveShellLoop(shellsLocal) })

        shellsLocal.forEach(eachShell => {
            let currentX = eachShell.x
            let currentY = eachShell.y

            let newXPos = currentX + eachShell.xDirection
            let newYPos = currentY + eachShell.yDirection

            let currentRoomIndex = 0 //assign box to correct room
            rooms.current.forEach((eachRoom, eachRoomIndex) => {
                if (currentX > eachRoom.offsetLeft) {
                    currentRoomIndex = eachRoomIndex
                    return
                }
            })
            const currentRoomPaths = rooms.current[currentRoomIndex].childNodes;

            //add all paths to allpaths array
            let inBoundsCount = 0
            let hitX = false
            let hitY = false

            currentRoomPaths.forEach(eachPathPre => {
                const eachPath = eachPathPre as HTMLDivElement
                const pathConnectsRooms = rooms.current[currentRoomIndex].offsetLeft + rooms.current[currentRoomIndex].clientWidth === eachPath.offsetLeft + eachPath.clientWidth

                const minXPos = eachPath.offsetLeft + (pathConnectsRooms ? -eachShell.width : 0)
                const maxXPos = eachPath.offsetLeft + eachPath.clientWidth + (pathConnectsRooms ? 0 : -eachShell.width)

                const minYPos = eachPath.offsetTop
                const maxYPos = eachPath.offsetTop + eachPath.clientHeight - eachShell.width


                //ensure inbounds
                if (newXPos >= minXPos && newXPos <= maxXPos && newYPos >= minYPos && newYPos <= maxYPos) {
                    if (newXPos === minXPos || newXPos === maxXPos) {
                        eachShell.xDirection *= -1
                        hitX = true

                        if (newXPos === maxXPos && pathConnectsRooms) {
                            //allow shell transfer into new rooms
                            eachShell.xDirection *= -1
                        }
                    }

                    if (newYPos === minYPos || newYPos === maxYPos) {
                        hitY = true
                        eachShell.yDirection *= -1
                    }

                    inBoundsCount++
                }
            })

            if (inBoundsCount > 1) {
                if (hitX) {
                    eachShell.xDirection *= -1
                }

                if (hitY) {
                    eachShell.yDirection *= -1
                }
            }

            if (eachShell.wallsHit > 120) {
                eachShell.el.remove()
                shellsLocal.filter(ogShell => ogShell.id !== eachShell.id)
            }

            if (hitX || hitY) {
                eachShell.wallsHit++
            }

            eachShell.x = newXPos
            eachShell.y = newYPos
            eachShell.el.style.translate = `${newXPos}px ${newYPos}px`
        })
    }

    return (
        <HideNav>
            <main className={styles.mainDivRef}>
                <div ref={canvasRef} className={styles.canvas}>
                    <div ref={tankRef} className={styles.tank} style={{ width: `${tankStats.current.width}px`, translate: `${tankStats.current.x}px ${tankStats.current.y}px` }}></div>
                </div>
            </main>
        </HideNav>
    )
}