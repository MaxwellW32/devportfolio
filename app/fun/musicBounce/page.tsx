"use client"

import { useEffect, useRef, useState } from "react"
import { borderPosition, borderType, bounceBoxStats } from "./musicBounceTypes"
import styles from "./page.module.css"
import HideNav from "@/components/hideNav/HideNav"
import { v4 as uuidV4 } from "uuid"

export default function Page() {
    const boxRef = useRef<HTMLDivElement>(null!)
    const mainDivRef = useRef<HTMLDivElement>(null!)
    const canvasRef = useRef<HTMLDivElement>(null!)
    const moveAnimationFrameId = useRef<number>()
    const canvasMidPoint = useRef(0)
    const xyDirectionSwitchAmt = useRef(0)
    const leadingTime = useRef(5000)
    const xyDirectionVal = useRef<"x" | "y">("x")
    const boxStats = useRef<bounceBoxStats>({
        boxWidth: 30,
        xPosition: 0,
        yPosition: 0,
        xDirection: 1,
        yDirection: 1,
        speed: 1,
        hue: 360
    })
    const originalBoxStats = useRef<bounceBoxStats>({ ...boxStats.current })
    const playbackState = useRef<"recording" | "playback">()
    const borderPositions = useRef<borderPosition[]>([])
    const borderPositionElements = useRef<HTMLDivElement[]>([])
    const recordTimeStared = useRef(new Date())
    const threshold = useRef(130)
    const hitThreshold = useRef(false)
    const audioRef = useRef<HTMLAudioElement>(null!);

    const [showingSettings, showingSettingsSet] = useState(false)
    const [audioUrl, setAudioUrl] = useState("");
    const [refreshToggle, refreshToggleSet] = useState(false);

    //start off all
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        startAll()
    }, [])

    //handle music
    const loadedAudio = useRef(false)
    useEffect(() => {
        if (audioUrl === "") return
        if (loadedAudio.current) return
        loadedAudio.current = true

        //register audio source
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Adjust as needed
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
            requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength / 2; i++) {
                sum += dataArray[i];
            }
            const average = sum / (bufferLength / 2);
            // console.log(`$average`, average);

            if (average > threshold.current) {
                if (hitThreshold.current) return
                hitThreshold.current = true

                //hit
                handleBeatHit(boxStats.current, recordTimeStared.current)
            } else {
                hitThreshold.current = false
            }
        };

        renderFrame();
    }, [audioUrl]);

    function startAll() {
        //get canvas midpoint
        canvasMidPoint.current = canvasRef.current.offsetWidth / 2

        //put everything in the center
        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)
    }

    function handleBeatHit(boxStatsPassed: bounceBoxStats, recordTimeStaredPassed: Date) {
        if (playbackState.current === undefined) return

        if (playbackState.current === "recording") {
            if (xyDirectionSwitchAmt.current === 0) {
                xyDirectionSwitchAmt.current = Math.floor(Math.random() * 10) + 1

                if (xyDirectionVal.current === "x") {
                    xyDirectionVal.current = "y"
                } else {
                    xyDirectionVal.current = "x"
                }
            }

            xyDirectionSwitchAmt.current -= 1

            let newBorderStats: borderPosition | null = null

            //flip direction
            if (xyDirectionVal.current === "x") {
                //determine left or right hit
                if (boxStatsPassed.xDirection > 0) {
                    newBorderStats = makeBorder(undefined, canvasRef.current, boxStatsPassed, "right", recordTimeStaredPassed)!
                    makeInnerColorTransitionBox("right", boxRef.current, boxStatsPassed)
                } else {
                    newBorderStats = makeBorder(undefined, canvasRef.current, boxStatsPassed, "left", recordTimeStaredPassed)!
                    makeInnerColorTransitionBox("left", boxRef.current, boxStatsPassed)

                }
                boxStatsPassed.xDirection *= -1
            } else {
                if (boxStatsPassed.yDirection > 0) {
                    newBorderStats = makeBorder(undefined, canvasRef.current, boxStatsPassed, "bottom", recordTimeStaredPassed)!
                    makeInnerColorTransitionBox("bottom", boxRef.current, boxStatsPassed)

                } else {
                    newBorderStats = makeBorder(undefined, canvasRef.current, boxStatsPassed, "top", recordTimeStaredPassed)!
                    makeInnerColorTransitionBox("top", boxRef.current, boxStatsPassed)
                }
                boxStatsPassed.yDirection *= -1
            }

            //note down border stats
            if (newBorderStats !== null) {
                borderPositions.current.push(newBorderStats)
            }

        }
    }


    function makeBorder(passedBorderPositionObj: borderPosition | undefined, containerPassed: HTMLDivElement, boxStatsPassed: bounceBoxStats, direction?: "top" | "bottom" | "left" | "right", recordTimeStaredPassed?: Date,): borderPosition | undefined {
        const newBorder = document.createElement("div")

        newBorder.style.position = `absolute`

        if (!passedBorderPositionObj) {
            const randHue = (boxStatsPassed.hue + (Math.floor(Math.random() * 40) + 40)) % 360
            boxStatsPassed.hue = randHue

            newBorder.style.backgroundColor = `hsl(${randHue}, 100%, 50%)`

            //normal
            const newTime = new Date()
            const smallBorderSize = 2 + Math.floor(Math.random() * 3)
            const largeBorderSize = (boxStatsPassed.boxWidth * 2) + Math.floor(Math.random() * 30)

            let borderWidth = smallBorderSize
            let borderHeight = smallBorderSize
            let borderX = boxStatsPassed.xPosition
            let borderY = boxStatsPassed.yPosition

            if (direction === "top") {
                borderWidth = largeBorderSize
                borderX -= borderWidth / 2
            } else if (direction === "bottom") {
                borderWidth = largeBorderSize

                borderX -= borderWidth / 2
                borderY += boxStatsPassed.boxWidth

            } else if (direction === "left") {
                borderHeight = largeBorderSize

                borderX -= borderWidth
                borderY -= borderHeight / 2

            } else if (direction === "right") {
                borderHeight = largeBorderSize

                borderX += boxStatsPassed.boxWidth
                borderY -= borderHeight / 2
            }

            newBorder.style.left = `${borderX}px`
            newBorder.style.top = `${borderY}px`
            newBorder.style.width = `${borderWidth}px`
            newBorder.style.height = `${borderHeight}px`

            borderPositionElements.current.push(newBorder)
            containerPassed.appendChild(newBorder)

            const timeDifference = Math.abs(newTime.getTime() - recordTimeStaredPassed!.getTime());

            return {
                id: uuidV4(),
                hue: randHue,
                time: timeDifference,
                type: direction!,
                boxXPosition: boxStatsPassed.xPosition,
                boxYPosition: boxStatsPassed.yPosition,
                xPosition: borderX,
                yPosition: borderY,
                width: borderWidth,
                height: borderHeight,
            }
        } else {
            newBorder.id = passedBorderPositionObj.id

            newBorder.style.left = `${passedBorderPositionObj.xPosition}px`
            newBorder.style.top = `${passedBorderPositionObj.yPosition}px`
            newBorder.style.width = `${passedBorderPositionObj.width}px`
            newBorder.style.height = `${passedBorderPositionObj.height}px`
            newBorder.style.backgroundColor = `hsl(${40}, 0%, 50%)`

            borderPositionElements.current.push(newBorder)
            containerPassed.appendChild(newBorder)
        }
    }

    function makeInnerColorTransitionBox(side: borderType, boxRefPassed: HTMLDivElement, boxStatsPassed: bounceBoxStats, borderPositionObjPassed?: borderPosition) {
        const newInnerSquare = document.createElement("div")

        newInnerSquare.style.width = `${boxRefPassed.clientWidth}px`

        const currentHue = borderPositionObjPassed ? borderPositionObjPassed.hue : boxStatsPassed.hue

        if (borderPositionObjPassed) {
            //change border col
            const seenBorder = borderPositionElements.current.find(eachEl => eachEl.id === borderPositionObjPassed.id)
            if (!seenBorder) return

            seenBorder.style.backgroundColor = `hsl(${borderPositionObjPassed.hue}, 100%, 50%)`
        }

        newInnerSquare.style.backgroundColor = `hsl(${currentHue},100%,50%)`

        newInnerSquare.classList.add(styles.transitionSquare)

        if (side === "top") {
            newInnerSquare.classList.add(styles.slideTop)

        } else if (side === "bottom") {
            newInnerSquare.classList.add(styles.slideBottom)

        } else if (side === "left") {
            newInnerSquare.classList.add(styles.slideLeft)

        } else if (side === "right") {
            newInnerSquare.classList.add(styles.slideRight)
        }

        boxRefPassed.appendChild(newInnerSquare)


        setTimeout(() => {
            boxRefPassed.style.backgroundColor = `hsl(${currentHue},100%,50%)`

            setTimeout(() => {
                newInnerSquare.remove()
            }, 2500);
        }, 700);
    }

    function buildAllBorders(canvasRefPassed: HTMLDivElement, boxStatsPassed: bounceBoxStats) {
        borderPositions.current.forEach((eachBorderPosObj) => {
            setTimeout(() => {
                makeBorder(eachBorderPosObj, canvasRefPassed, boxStatsPassed)!
            }, eachBorderPosObj.time - leadingTime.current);
        })
    }

    function centerBoxAndCanvas(canvasMidPointPassed: number, boxStatsPassed: bounceBoxStats, boxRefPassed: HTMLDivElement, mainDivRefPassed: HTMLDivElement) {
        boxStatsPassed.xPosition = canvasMidPointPassed
        boxStatsPassed.yPosition = canvasMidPointPassed
        boxRefPassed.style.translate = `${boxStatsPassed.xPosition}px ${boxStatsPassed.yPosition}px`

        mainDivRefPassed.scrollTop = (mainDivRefPassed.scrollHeight / 2 - mainDivRefPassed.offsetHeight / 2)
        mainDivRefPassed.scrollLeft = (mainDivRefPassed.scrollWidth / 2 - mainDivRefPassed.offsetWidth / 2)
    }

    function playBackMovement() {
        if (playbackState.current !== "playback") return
        startMoveLoop()

        borderPositions.current.forEach((eachBorderPosObj, eachBorderPosObjIndex) => {
            setTimeout(() => {
                const recordedFlip = borderPositions.current[eachBorderPosObjIndex].type

                if (recordedFlip === "left") {
                    boxStats.current.xDirection = 1
                    makeInnerColorTransitionBox("left", boxRef.current, boxStats.current, eachBorderPosObj)
                } else if (recordedFlip === "right") {
                    makeInnerColorTransitionBox("right", boxRef.current, boxStats.current, eachBorderPosObj)
                    boxStats.current.xDirection = -1
                } else if (recordedFlip === "top") {
                    makeInnerColorTransitionBox("top", boxRef.current, boxStats.current, eachBorderPosObj)
                    boxStats.current.yDirection = 1
                } else if (recordedFlip === "bottom") {
                    boxStats.current.yDirection = -1
                    makeInnerColorTransitionBox("bottom", boxRef.current, boxStats.current, eachBorderPosObj)
                }

                boxStats.current.xPosition = eachBorderPosObj.boxXPosition
                boxStats.current.yPosition = eachBorderPosObj.boxYPosition
                boxRef.current.style.translate = `${boxStats.current.xPosition} ${boxStats.current.xPosition}`

                //stop playback
                if (eachBorderPosObjIndex === borderPositions.current.length - 1) {
                    console.log(`$playback finished`);

                    setTimeout(() => {
                        stopMovementAndReset()
                    }, 1500);
                }
            }, eachBorderPosObj.time);
        })
    }

    function stopMovementAndReset() {
        if (moveAnimationFrameId.current) {
            cancelAnimationFrame(moveAnimationFrameId.current);
        }

        boxStats.current = { ...originalBoxStats.current }

        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)

        refreshToggleSet(prev => !prev)

        audioRef.current.pause()
        audioRef.current.currentTime = 0
    }

    function startMoveLoop() {
        moveAnimationFrameId.current = requestAnimationFrame(startMoveLoop)
        moveBox(boxStats.current, canvasRef.current, boxRef.current, mainDivRef.current)
    }

    function moveBox(boxStatsPassed: bounceBoxStats, containerPassed: HTMLDivElement, boxRefPassed: HTMLDivElement, mainDivRefPassed: HTMLDivElement) {
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

        keepCanvasFocused(newPosX - currentPosX, newPosY - currentPosY, mainDivRefPassed)
    }

    function keepCanvasFocused(changeInX: number, changeInY: number, mainDivRefPassed: HTMLDivElement) {
        mainDivRefPassed.scrollTop += changeInY
        mainDivRefPassed.scrollLeft += changeInX

    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const fileList = event.target.files
        if (!fileList) return

        const File = fileList[0]
        const url = URL.createObjectURL(File);
        setAudioUrl(url);
    };

    async function handleRecord() {
        if (playbackState.current === "recording") return
        playbackState.current = "recording"

        borderPositionElements.current = []

        audioRef.current.currentTime = 0
        await audioRef.current.play()

        recordTimeStared.current = new Date()
        startMoveLoop()
    }

    async function handlePlayback() {
        if (playbackState.current === "playback") return
        playbackState.current = "playback"

        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)

        //remove all elements from canvas
        borderPositionElements.current.forEach(eachEl => eachEl.remove())
        borderPositionElements.current = []

        await audioRef.current.play()

        buildAllBorders(canvasRef.current, boxStats.current)
        playBackMovement()
    }

    return (
        <HideNav>
            <main ref={mainDivRef} className={`${styles.mainDiv} noScrollBar`}>
                <div style={{ position: "fixed", top: 0, right: 0, zIndex: 1, display: "grid", overflowY: 'auto', width: showingSettings ? "min(400px, 100%)" : "", }}>
                    {!showingSettings && (
                        <div className={styles.hoverSvg} onClick={() => { showingSettingsSet(true) }}>
                            <svg style={{ fill: "#fff", width: "2rem", cursor: "pointer", margin: ".5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" /></svg>
                        </div>
                    )}

                    <div className={styles.settingsCont} style={{ display: !showingSettings ? "none" : "grid", alignContent: "flex-start" }}>
                        <p style={{ justifySelf: "flex-end" }} onClick={() => { showingSettingsSet(false) }}>Close</p>
                        <div style={{ color: "#fff" }}>
                            <audio ref={audioRef} controls src={audioUrl} onEnded={() => {
                                stopMovementAndReset()
                                playbackState.current = undefined
                            }}></audio>

                            <input type="file" onChange={handleFileChange} accept="audio/*" />

                            <input type="text" onChange={(e) => {
                                threshold.current = parseInt(e.target.value)
                                refreshToggleSet(prev => !prev)
                            }} value={`${threshold.current}`} />
                        </div>

                        <div style={{ display: audioUrl ? "flex" : "none", gap: ".5rem", flexWrap: "wrap" }}>
                            <button onClick={handleRecord}>Record</button>

                            {borderPositions.current.length > 0 && (
                                <button onClick={handlePlayback}>Playback</button>
                            )}
                        </div>
                    </div>
                </div>

                <div ref={canvasRef} className={styles.canvas}>
                    <div ref={boxRef} className={styles.box} style={{ width: `${boxStats.current.boxWidth}px`, backgroundColor: `hsl(${boxStats.current.hue},100%,50%)` }}>
                    </div>
                </div>
            </main>
        </HideNav>
    )
}
