"use client"
import { useEffect, useRef } from "react";
import styles from "./style.module.css"

export default function Player() {
  type PlayerStats = {
    width: number;
    height: number;
    step: number;
    top: number;
    left: number;
    falling: boolean,
    directionFacing: "left" | "right";
  }

  type collisionObjectsType = {
    [key: string]: {
      floorEl: HTMLElement,
      floorLocaInfo: DOMRect,
    }
  }

  const floorElements: string = `[data-platform-enabled]`
  const playerRef = useRef<HTMLDivElement | null>(null)
  const playerInfo = useRef<PlayerStats>({
    width: 50,
    height: 76,
    step: 3,
    top: 0,
    left: 0,
    falling: true,
    directionFacing: "left",
  })
  const collisionObjects = useRef<collisionObjectsType>({})

  const loopStarted = useRef(false)
  const moveLoopInterval = useRef<NodeJS.Timeout | undefined>(undefined)

  const triggerKeys = ["w", "a", "s", "d"]
  const keysPressed = useRef<{
    "up": boolean,
    "down": boolean,
    "left": boolean,
    "right": boolean,
  }>({
    "up": false,
    "down": false,
    "left": false,
    "right": false,
  })

  //add key down
  useEffect(() => {
    window.addEventListener("keydown", (e) => handleKeyDown(e))
    window.addEventListener("keyup", (e) => handleKeyUp(e))

    return () => {
      window.removeEventListener("keydown", (e) => handleKeyDown(e))
      window.removeEventListener("keyup", (e) => handleKeyUp(e))
    }
  }, [])

  //get collision objects
  useEffect(() => {
    const sharedFunc = () => {
      //get all platform elements
      getAllFloorElements(floorElements)
    }
    sharedFunc()

    //run on resize
    window.addEventListener("resize", sharedFunc)

    return () => {
      window.removeEventListener("resize", sharedFunc)
    }
  }, [])

  function getAllFloorElements(searchElements: string) {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll(searchElements);

    const newCollisionObjects: collisionObjectsType = {}

    elements.forEach((eachEl, index) => {
      //add class

      newCollisionObjects[index] = {
        floorEl: eachEl,
        floorLocaInfo: eachEl.getBoundingClientRect(),
      }
    })

    collisionObjects.current = { ...newCollisionObjects }
  }

  function manageLoop(option: "start" | "stop") {
    loopStarted.current = option === "start"
    // console.log(`$loop ${option}`);

    if (option === "start") {
      moveLoopInterval.current = setInterval(() => {
        movePlayer()
      }, 0)

    } else {
      clearInterval(moveLoopInterval.current)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const seenKey = e.key.toLowerCase()

    //start loop if not started
    if (triggerKeys.includes(seenKey) && !loopStarted.current) {
      manageLoop("start")
    }

    //note key press
    if (seenKey === "w") keysPressed.current["up"] = true
    if (seenKey === "s") keysPressed.current["down"] = true
    if (seenKey === "a") keysPressed.current["left"] = true
    if (seenKey === "d") keysPressed.current["right"] = true
  }
  function handleKeyUp(e: KeyboardEvent) {
    const seenKey = e.key.toLowerCase()

    //note key press
    if (seenKey === "w") keysPressed.current["up"] = false
    if (seenKey === "s") keysPressed.current["down"] = false
    if (seenKey === "a") keysPressed.current["left"] = false
    if (seenKey === "d") keysPressed.current["right"] = false
  }

  function movePlayer() {
    const futurePosition = { top: playerInfo.current.top, left: playerInfo.current.left }

    //move player up
    if (keysPressed.current["up"]) {
      futurePosition.top -= playerInfo.current.step * 2
    }

    //move player down
    if (keysPressed.current["down"] || playerInfo.current.falling) {
      futurePosition.top += playerInfo.current.step
    }

    //move player left
    if (keysPressed.current["left"]) {
      futurePosition.left -= playerInfo.current.step
      playerInfo.current.directionFacing = "left"
    }

    //move player right
    if (keysPressed.current["right"]) {
      futurePosition.left += playerInfo.current.step
      playerInfo.current.directionFacing = "right"
    }

    //calculate platforms
    let closestFloorTop = document.body.scrollHeight  //start off with full safe height
    let onAFloor = false

    for (const key in collisionObjects.current) {
      const seenCollisionObject = collisionObjects.current[key]

      const playerOverlappingFloorX = futurePosition.left + playerInfo.current.width >= seenCollisionObject.floorLocaInfo.left && futurePosition.left <= seenCollisionObject.floorLocaInfo.right
      const playerOverlappingFloorY = futurePosition.top + playerInfo.current.height >= seenCollisionObject.floorLocaInfo.top && futurePosition.top + playerInfo.current.height <= seenCollisionObject.floorLocaInfo.top + 2 //check in range

      //check player is overlapping
      if (playerOverlappingFloorY && playerOverlappingFloorX) {
        closestFloorTop = seenCollisionObject.floorLocaInfo.top
        onAFloor = true
      }
    }

    //if on a platform stop falling
    playerInfo.current.falling = !onAFloor

    const maxX = window.innerWidth - playerInfo.current.width - 5 //px
    const maxY = closestFloorTop - playerInfo.current.height

    //keep left in bounds
    if (futurePosition.left >= 0 && futurePosition.left <= maxX) {
      playerInfo.current.left = futurePosition.left

    } else if (futurePosition.left < 0) {
      playerInfo.current.left = 0

    } else if (futurePosition.left > maxX) {
      playerInfo.current.left = maxX
    }


    //keep top in bounds
    if (futurePosition.top >= 0 && futurePosition.top <= maxY) {
      playerInfo.current.top = futurePosition.top

    } else if (futurePosition.top < 0) {
      playerInfo.current.top = 0

      //allow platform drop
    } else if (futurePosition.top >= maxY) {
      playerInfo.current.top = maxY

      //allow calculations to stop
      manageLoop("stop")
    }

    if (onAFloor) {
      manageLoop("stop")
    }

    //apply styling
    if (playerRef.current === null) return
    playerRef.current.style.top = `${playerInfo.current.top}px`
    playerRef.current.style.left = `${playerInfo.current.left}px`
    playerRef.current.style.transform = playerInfo.current.directionFacing === "left" ? `rotateY(0deg)` : `rotateY(180deg)`
  }

  return (
    <div ref={playerRef} id="player" className={styles.player} style={{ width: `${playerInfo.current.width}px`, height: `${playerInfo.current.height}px` }}></div>
  )
}