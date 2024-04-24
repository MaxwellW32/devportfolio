"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./page.module.css"
import HideNav from '@/components/hideNav/HideNav'
import { shellStats, generalInfo, keysCurrentlyPressed, tankStats, tankDirections } from './roomTypes'
import InfoMarker from '@/components/infoMarker/InfoMarker'
import { v4 as uuidV4 } from "uuid"

//pure functions when i can
//if function needs to change global variables directly, cannot be pure

export default function Page() {
    const canvasRef = useRef<HTMLDivElement>(null!)
    const rooms = useRef<HTMLDivElement[]>([])
    const shells = useRef<shellStats[]>([])
    const maxShellsSpawnable = useRef<number>(80)
    const amountOfTanks = useRef<number>(1)
    const generalInfo = useRef<generalInfo>({
        roomWidth: 1000,
        amountOfLanes: 10,
        maxShellsSpawnable: maxShellsSpawnable.current / amountOfTanks.current,
    })
    const keysCurrentlyPressed = useRef<keysCurrentlyPressed>({
        up: false,
        down: false,
        left: false,
        right: false,
        blast: false
    })
    const playerTanks = useRef<tankStats[]>([{
        id: "max",
        width: 20,
        x: 0,
        y: 0,
        speed: 2,
        directionFacing: "right",
        enemyTank: false,
        element: null!
    }])
    const animationFrameId = useRef<number>()
    const shellAnimationFrameId = useRef<number>()
    const lastPathInBoundForShells = useRef<{ [key: string]: HTMLDivElement }>({})
    const lastPathInBoundForTanks = useRef<{ [key: string]: HTMLDivElement }>({})

    //start off
    const ranOnce = useRef(false)
    useEffect(() => {
        if (ranOnce.current) return
        ranOnce.current = true

        startOff()
    }, [])

    function startOff() {
        //place tank in right position
        playerTanks.current.forEach(eachTank => {
            eachTank.x = generalInfo.current.roomWidth / 2 - eachTank.width / 2
            eachTank.y = generalInfo.current.roomWidth / 2 - eachTank.width / 2
        })

        //generate rooms
        for (let index = 0; index < 4; index++) {
            addRoom()
        }

        //listen to move keys
        //remove prev listeners
        document.body.removeEventListener("keydown", (e) => detectKeys(e, "keydown"))
        document.body.removeEventListener("keyup", (e) => detectKeys(e, "keyup"))
        //add key listener to move tank
        document.body.addEventListener("keydown", (e) => detectKeys(e, "keydown"))
        document.body.addEventListener("keyup", (e) => detectKeys(e, "keyup"))

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

    function assignTankRefs(e: HTMLDivElement | null, tankId: string) {
        if (e === null) return

        playerTanks.current = playerTanks.current.map(eachTank => {
            if (eachTank.id === tankId)
                eachTank.element = e
            return eachTank
        })
    }

    function addRoom() {
        const randR = Math.floor(Math.random() * 256)
        const randG = Math.floor(Math.random() * 256)
        const randB = Math.floor(Math.random() * 256)

        const newRoom = document.createElement("div")

        newRoom.classList.add(styles.room)
        newRoom.style.width = `${generalInfo.current.roomWidth}px`
        newRoom.style.backgroundColor = `rgba(${randR},${randG},${randB},0.2)`

        rooms.current.push(newRoom)
        canvasRef.current.append(newRoom)

        const newestRoomAdded = rooms.current[rooms.current.length - 1]

        //generate maze
        const singleLaneWidth = generalInfo.current.roomWidth / generalInfo.current.amountOfLanes

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

    function detectKeys(e: KeyboardEvent, option: "keydown" | "keyup") {
        const seenKey = e.key.toLowerCase()

        if (seenKey === "arrowup" || seenKey === "w") {
            keysCurrentlyPressed.current.up = option === "keydown" ? true : false
        }
        if (seenKey === "arrowdown" || seenKey === "s") {
            keysCurrentlyPressed.current.down = option === "keydown" ? true : false
        }
        if (seenKey === "arrowleft" || seenKey === "a") {
            keysCurrentlyPressed.current.left = option === "keydown" ? true : false
        }
        if (seenKey === "arrowright" || seenKey === "d") {
            keysCurrentlyPressed.current.right = option === "keydown" ? true : false
        }
        if (seenKey === "x") {
            keysCurrentlyPressed.current.blast = option === "keydown" ? true : false

            //search through tanks, fire from only non enemy tank
            if (keysCurrentlyPressed.current.blast) {
                playerTanks.current.forEach(eachTank => {
                    if (eachTank.enemyTank) return

                    // console.log(`$fired`);
                    blastFromTank(eachTank)
                })
            }
        }
    }

    function detectMouse(e: MouseEvent) {
        //refactor to have automatic fire as well
        const mouseX = e.clientX
        const mouseY = e.clientY

        const homeTank = playerTanks.current.find(eachTank => !eachTank.enemyTank)
        if (!homeTank) return

        const tankScreenX = homeTank.x - canvasRef.current.scrollLeft + (homeTank.width / 2) //make it revolve center of the tank
        const tankScreenY = homeTank.y - canvasRef.current.scrollTop + (homeTank.width / 2)

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
            homeTank.directionFacing = direction

            //style snout
            homeTank.element.style.setProperty("--rotateAngle", `${stiffAngle * -1}deg`)
        }
    }

    function continuousMovementLoop() {
        animationFrameId.current = requestAnimationFrame(continuousMovementLoop)

        playerTanks.current.forEach(eachTank => {
            //moveTank Loop
            const newTankPos = moveTankPosition(keysCurrentlyPressed.current, eachTank, rooms.current)
            eachTank.x = newTankPos.newXPos
            eachTank.y = newTankPos.newYPos
            placeTankAtLocation(eachTank.x, eachTank.y, eachTank.element)

            if (eachTank.enemyTank) return //ensure only hometank is centered

            //center screen
            centerCanvas(eachTank.x, eachTank.y)

            //run room check - ensure infinite rooms
            ensureInfiniteRooms(eachTank)
        })
    }

    function moveTankPosition(keysCurrentlyPressedLocal: keysCurrentlyPressed, seenTank: tankStats, roomsLocal: HTMLDivElement[],) {
        let currentXPos = seenTank.x
        let currentYPos = seenTank.y

        let newXPos = currentXPos
        let newYPos = currentYPos

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
            newYPos -= seenTank.speed
        }
        if (keysCurrentlyPressedLocal.down) {
            newYPos += seenTank.speed
        }
        if (keysCurrentlyPressedLocal.left) {
            newXPos -= seenTank.speed
        }
        if (keysCurrentlyPressedLocal.right) {
            newXPos += seenTank.speed
        }

        let canMove = false;
        allPaths.forEach(eachPath => {
            const pathConnectsRooms = roomsLocal[currentRoomIndex].offsetLeft + roomsLocal[currentRoomIndex].clientWidth === eachPath.offsetLeft + eachPath.clientWidth

            const minXPos = eachPath.offsetLeft + (pathConnectsRooms ? - seenTank.width : 0)
            const maxXPos = eachPath.offsetLeft + eachPath.clientWidth + (pathConnectsRooms ? 0 : - seenTank.width)

            const minYPos = eachPath.offsetTop
            const maxYPos = eachPath.offsetTop + eachPath.clientHeight - seenTank.width

            if (newXPos >= minXPos && newXPos <= maxXPos && newYPos >= minYPos && newYPos <= maxYPos) {
                canMove = true;
                lastPathInBoundForTanks.current[seenTank.id] = eachPath
            }
        });

        if (!canMove) {
            const lastPathInBounds = lastPathInBoundForTanks.current[seenTank.id]

            const pathConnectsRooms = roomsLocal[currentRoomIndex].offsetLeft + roomsLocal[currentRoomIndex].clientWidth === lastPathInBounds.offsetLeft + lastPathInBounds.clientWidth

            const minXPos = lastPathInBounds.offsetLeft + (pathConnectsRooms ? - seenTank.width : 0)
            const maxXPos = lastPathInBounds.offsetLeft + lastPathInBounds.clientWidth + (pathConnectsRooms ? 0 : - seenTank.width)

            const minYPos = lastPathInBounds.offsetTop
            const maxYPos = lastPathInBounds.offsetTop + lastPathInBounds.clientHeight - seenTank.width

            if (newXPos < minXPos) {
                newXPos = minXPos
            }
            if (newXPos > maxXPos) {
                newXPos = maxXPos
            }
            if (newYPos < minYPos) {
                newYPos = minYPos
            }
            if (newYPos > maxYPos) {
                newYPos = maxYPos
            }
        }

        return { newXPos, newYPos }
    }

    function placeTankAtLocation(x: number, y: number, tankRefLocal: HTMLDivElement) {
        tankRefLocal.style.translate = `${x}px ${y}px`
    }

    function centerCanvas(x: number, y: number) {
        const middleOfScreenXPos = canvasRef.current.scrollLeft + (canvasRef.current.clientWidth / 2)
        const middleOfScreenYPos = canvasRef.current.scrollTop + (canvasRef.current.clientHeight / 2)

        const newMiddleX = x
        const newMiddleY = y

        const differenceBetweenLocationX = newMiddleX - middleOfScreenXPos
        const differenceBetweenLocationY = newMiddleY - middleOfScreenYPos

        canvasRef.current.scrollLeft += differenceBetweenLocationX
        canvasRef.current.scrollTop += differenceBetweenLocationY
    }

    function ensureInfiniteRooms(seenTank: tankStats) {
        //check room tank is in
        let currentRoom = 0 //assign box to correct room
        rooms.current.forEach((eachRoom, eachRoomIndex) => {
            if (seenTank.x > eachRoom.offsetLeft) {
                currentRoom = eachRoomIndex + 1
                return
            }
        })

        //check amount of rooms left
        const amountOfRoomsLeft = rooms.current.length - currentRoom

        //spawn more rooms
        if (amountOfRoomsLeft <= 2) {
            addRoom()
        }
    }

    function blastFromTank(seenTank: tankStats) {
        let xDirection = 0
        let yDirection = 0

        if (seenTank.directionFacing === "up") {
            yDirection = -1

        } else if (seenTank.directionFacing === "down") {
            yDirection = 1

        } else if (seenTank.directionFacing === "left") {
            xDirection = -1

        } else if (seenTank.directionFacing === "right") {
            xDirection = 1

        } else if (seenTank.directionFacing === "up-left") {
            xDirection = -1
            yDirection = -1

        } else if (seenTank.directionFacing === "up-right") {
            xDirection = 1
            yDirection = -1

        } else if (seenTank.directionFacing === "down-left") {
            xDirection = -1
            yDirection = 1

        } else if (seenTank.directionFacing === "down-right") {
            xDirection = 1
            yDirection = 1
        }

        const shellWidth = 10

        const newShellEl = document.createElement("div")
        newShellEl.style.width = `${shellWidth}px`
        newShellEl.classList.add(styles.shell)

        const newShell: shellStats = {
            id: uuidV4(),
            firedFrom: seenTank.id,
            width: shellWidth,
            x: seenTank.x + (seenTank.width / 2) - (shellWidth / 2),
            y: seenTank.y + (seenTank.width / 2) - (shellWidth / 2),
            xDirection: xDirection,
            yDirection: yDirection,
            wallsHit: 0,
            speed: 3,
            el: newShellEl
        }

        shells.current.push(newShell)
        canvasRef.current.append(newShell.el)

        //if too many fired from tank - remove earlier shells fired from screen
        const currentShellsFromTankCount = shells.current.reduce((acc, shell) => {
            if (shell.firedFrom === seenTank.id) {
                return acc + 1
            } else {
                return acc;
            }
        }, 0)

        //remove earliest shell from screen
        if (currentShellsFromTankCount > generalInfo.current.maxShellsSpawnable) {
            const earliestShellFiredFromTank = shells.current.find(eachShell => eachShell.firedFrom === seenTank.id)
            if (earliestShellFiredFromTank === undefined) return

            removeShell(earliestShellFiredFromTank.id)
        }
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

            const onLastRoom = currentRoomIndex === rooms.current.length - 1
            const usingPrevRoom = currentRoomIndex !== 0
            const usingNextRoom = !onLastRoom

            const pathsInPrevRoom = usingPrevRoom ? rooms.current[currentRoomIndex - 1].childNodes : [];
            const pathsInCurrentRoom = rooms.current[currentRoomIndex].childNodes;
            const pathsInNextRoom = usingNextRoom ? rooms.current[currentRoomIndex + 1].childNodes : [];

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

            let inBoundCount = 0
            let hitX = false
            let hitY = false

            allPaths.forEach(eachPath => {//check if shell inbound of path
                const isHorizantalConnector = rooms.current[currentRoomIndex].offsetLeft + rooms.current[currentRoomIndex].clientWidth === eachPath.offsetLeft + eachPath.clientWidth

                const minXPos = eachPath.offsetLeft + (isHorizantalConnector && currentRoomIndex !== 0 ? - eachShell.width : 0)
                const maxXPos = eachPath.offsetLeft + eachPath.clientWidth + (isHorizantalConnector && !onLastRoom ? 0 : - eachShell.width)

                const minYPos = eachPath.offsetTop
                const maxYPos = eachPath.offsetTop + eachPath.clientHeight - eachShell.width

                //ensure inbounds - track last time element was inbounds
                if (newXPos >= minXPos && newXPos <= maxXPos && newYPos >= minYPos && newYPos <= maxYPos) {
                    inBoundCount++
                    lastPathInBoundForShells.current[eachShell.id] = eachPath

                    if (newXPos === minXPos || newXPos === maxXPos) {
                        hitX = true
                    }
                    if (newYPos === minYPos || newYPos === maxYPos) {
                        hitY = true
                    }
                }
            })

            //keep faster tank shells in bounds if out of bounds
            if (inBoundCount === 0) {
                const lastMatchedPath = lastPathInBoundForShells.current[eachShell.id]
                const isHorizantalConnector = rooms.current[currentRoomIndex].offsetLeft + rooms.current[currentRoomIndex].clientWidth === lastMatchedPath.offsetLeft + lastMatchedPath.clientWidth

                const minXPos = lastMatchedPath.offsetLeft + (isHorizantalConnector && currentRoomIndex !== 0 ? - eachShell.width : 0)
                const maxXPos = lastMatchedPath.offsetLeft + lastMatchedPath.clientWidth + (isHorizantalConnector && !onLastRoom ? 0 : - eachShell.width)

                const minYPos = lastMatchedPath.offsetTop
                const maxYPos = lastMatchedPath.offsetTop + lastMatchedPath.clientHeight - eachShell.width

                if (newXPos > maxXPos) {
                    newXPos = maxXPos
                    eachShell.xDirection *= -1
                }
                if (newXPos < minXPos) {
                    newXPos = minXPos
                    eachShell.xDirection *= -1
                }
                if (newYPos > maxYPos) {
                    newYPos = maxYPos
                    eachShell.yDirection *= -1
                }
                if (newYPos < minYPos) {
                    newYPos = minYPos
                    eachShell.yDirection *= -1
                }
            }

            //handle cross section paths
            for (let index = 0; index < inBoundCount; index++) {
                if (hitX) {
                    eachShell.xDirection *= -1
                    // console.log(`$flpped x - currently`, eachShell.xDirection);
                }
                if (hitY) {
                    eachShell.yDirection *= -1
                    // console.log(`$flpped y - currently`, eachShell.yDirection);
                }
            }

            if (hitX && hitY) {
                // console.log(`$hit both x y`);
                eachShell.xDirection *= -1
                eachShell.yDirection *= -1
            }

            if (eachShell.wallsHit > 200) {
                removeShell(eachShell.id)
            }

            if (hitX || hitY) {
                eachShell.wallsHit++
            }

            eachShell.x = newXPos
            eachShell.y = newYPos
            eachShell.el.style.translate = `${newXPos}px ${newYPos}px`
        })
    }

    function removeShell(idToRemove: string) {
        shells.current = shells.current.filter(eachShell => {
            if (eachShell.id !== idToRemove) {
                return true
            } else {
                eachShell.el.remove()
                return false
            }
        })
        console.log(`$removed shell`);
    }

    return (
        <HideNav>
            <main className={styles.mainDivRef}>
                <div ref={canvasRef} className={styles.canvas}>
                    {playerTanks.current.map(eachTank => {
                        return (
                            <React.Fragment key={eachTank.id}>
                                <div ref={(e) => assignTankRefs(e, eachTank.id)} className={styles.tank} style={{ width: `${eachTank.width}px`, translate: `${eachTank.x}px ${eachTank.y}px` }}>
                                    <div className={styles.snout}></div>
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            </main>
        </HideNav>
    )
}