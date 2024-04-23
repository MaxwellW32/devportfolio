"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./page.module.css"
import HideNav from '@/components/hideNav/HideNav'
import { shellStats, generalInfo, keysCurrentlyPressed, tankStats, tankDirections } from './roomTypes'
import InfoMarker from '@/components/infoMarker/InfoMarker'
import { v4 as uuidV4 } from "uuid"

export default function Page() {
    const tankRef = useRef<HTMLDivElement>(null!)
    const tankSnoutRef = useRef<HTMLDivElement>(null!)
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
        speed: 12,
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

        //listen to move keys
        //remove prev listeners
        document.body.removeEventListener("keydown", (e) => detectKeys(e, "keydown", keysCurrentlyPressed.current))
        document.body.removeEventListener("keyup", (e) => detectKeys(e, "keyup", keysCurrentlyPressed.current))
        //add key listener to move tank
        document.body.addEventListener("keydown", (e) => detectKeys(e, "keydown", keysCurrentlyPressed.current))
        document.body.addEventListener("keyup", (e) => detectKeys(e, "keyup", keysCurrentlyPressed.current))

        //detect mousePos
        //remove prev listeners
        document.body.removeEventListener("mousemove", (e) => detectMouse(e))
        //add key listener to move tank
        document.body.addEventListener("mousemove", (e) => detectMouse(e))

        //start movement loop
        //ensure animation loop starts fresh
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
        continuousMovementLoop()

        if (shellAnimationFrameId.current) cancelAnimationFrame(shellAnimationFrameId.current)
        continuousMoveShellLoop()
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
                blastFromTank(tankStats.current, shells.current, canvasRef.current)
            }
        }
    }

    function detectMouse(e: MouseEvent) {
        const mouseX = e.clientX
        const mouseY = e.clientY

        const tankScreenX = tankStats.current.x - canvasRef.current.scrollLeft + (tankStats.current.width / 2) //make it revolve center of the tank
        const tankScreenY = tankStats.current.y - canvasRef.current.scrollTop + (tankStats.current.width / 2)

        const deltaX = mouseX - tankScreenX;
        const deltaY = mouseY - tankScreenY;

        let angle = (Math.atan2(deltaY, deltaX) * (-180 / Math.PI));

        if (angle < 0) {
            angle += 360;
        }

        let direction: tankDirections | null = null
        let stiffAngle = angle

        if (angle < 45) {
            direction = "right"
            stiffAngle = 360

        } else if (angle < 90) {
            direction = "up-right"
            stiffAngle = 45
        } else if (angle < 135) {
            direction = "up"
            stiffAngle = 90
        } else if (angle < 180) {
            direction = "up-left"
            stiffAngle = 135
        } else if (angle < 225) {
            direction = "left"
            stiffAngle = 180
        } else if (angle < 270) {
            direction = "down-left"
            stiffAngle = 225
        } else if (angle < 315) {
            direction = "down"
            stiffAngle = 270
        } else if (angle < 360) {
            stiffAngle = 315
            direction = "down-right"
        }

        if (direction) {
            tankStats.current.directionFacing = direction

            //style snout
            tankSnoutRef.current.style.rotate = `${stiffAngle * -1}deg`
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

    function blastFromTank(tankStatsLocal: tankStats, shellsLocal: shellStats[], canvasRefLocal: HTMLDivElement) {
        let xDirection = 0
        let yDirection = 0

        if (tankStatsLocal.directionFacing === "up") {
            yDirection = -1

        } else if (tankStatsLocal.directionFacing === "down") {
            yDirection = 1

        } else if (tankStatsLocal.directionFacing === "left") {
            xDirection = -1

        } else if (tankStatsLocal.directionFacing === "right") {
            xDirection = 1

        } else if (tankStatsLocal.directionFacing === "up-left") {
            xDirection = -1
            yDirection = -1

        } else if (tankStatsLocal.directionFacing === "up-right") {
            xDirection = 1
            yDirection = -1

        } else if (tankStatsLocal.directionFacing === "down-left") {
            xDirection = -1
            yDirection = 1

        } else if (tankStatsLocal.directionFacing === "down-right") {
            xDirection = 1
            yDirection = 1
        }

        const newShellEl = document.createElement("div")

        const shellWidth = 10

        const newShell: shellStats = {
            id: uuidV4(),
            firedFrom: tankStatsLocal.id,
            width: shellWidth,
            x: tankStatsLocal.x + (tankStatsLocal.width / 2) - (shellWidth / 2),
            y: tankStatsLocal.y + (tankStatsLocal.width / 2) - (shellWidth / 2),
            xDirection: xDirection,
            yDirection: yDirection,
            wallsHit: 0,
            speed: 1,
            el: newShellEl
        }

        newShell.el.style.width = `${newShell.width}px`
        newShell.el.classList.add(styles.shell)

        shellsLocal.push(newShell)
        canvasRefLocal.append(newShell.el)
    }

    function continuousMoveShellLoop() {
        shellAnimationFrameId.current = requestAnimationFrame(continuousMoveShellLoop)

        shells.current.forEach(eachShell => {
            let currentX = eachShell.x
            let currentY = eachShell.y

            let newXPos = currentX + eachShell.xDirection * eachShell.speed
            let newYPos = currentY + eachShell.yDirection * eachShell.speed

            let currentRoomIndex = 0 //assign box to correct room
            rooms.current.forEach((eachRoom, eachRoomIndex) => {
                if (currentX > eachRoom.offsetLeft) {
                    currentRoomIndex = eachRoomIndex
                    return
                }
            })
            const currentRoomPaths = rooms.current[currentRoomIndex].childNodes;

            const onLastRoom = currentRoomIndex === rooms.current.length - 1
            //add all paths to allpaths array
            let inBoundsCount = 0
            let hitX = false
            let hitY = false

            currentRoomPaths.forEach(eachPathPre => {
                const eachPath = eachPathPre as HTMLDivElement
                const pathConnectsRooms = rooms.current[currentRoomIndex].offsetLeft + rooms.current[currentRoomIndex].clientWidth === eachPath.offsetLeft + eachPath.clientWidth

                const minXPos = eachPath.offsetLeft + (pathConnectsRooms ? -eachShell.width : 0)
                const maxXPos = eachPath.offsetLeft + eachPath.clientWidth + (pathConnectsRooms && !onLastRoom ? 0 : - eachShell.width)

                const minYPos = eachPath.offsetTop
                const maxYPos = eachPath.offsetTop + eachPath.clientHeight - eachShell.width


                //ensure inbounds
                if (newXPos >= minXPos && newXPos <= maxXPos && newYPos >= minYPos && newYPos <= maxYPos) {
                    if (newXPos === minXPos || newXPos === maxXPos) {
                        eachShell.xDirection *= -1
                        hitX = true

                        if (newXPos === maxXPos && pathConnectsRooms && !onLastRoom) {
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

            if (eachShell.wallsHit > 200 || inBoundsCount === 0) {
                eachShell.el.remove()
                shells.current = shells.current.filter(ogShell => ogShell.id !== eachShell.id)
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
                    <div ref={tankRef} className={styles.tank} style={{ width: `${tankStats.current.width}px`, translate: `${tankStats.current.x}px ${tankStats.current.y}px` }}>
                        <div ref={tankSnoutRef} className={styles.tankSnout} style={{}}></div>
                    </div>
                </div>
            </main>
        </HideNav>
    )
}