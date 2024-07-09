"use client"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { borderType, bounceBoxStats } from "./musicBounceTypes"
import styles from "./page.module.css"
import { v4 as uuidV4 } from "uuid"

export default function Page() {
    const boxRef = useRef<HTMLDivElement>(null!)
    const mainDivRef = useRef<HTMLDivElement>(null!)
    const backgroundRef = useRef<HTMLDivElement>(null!)
    const audioElRef = useRef<HTMLAudioElement>(null!);
    const canvasRef = useRef<HTMLCanvasElement>(null!)
    const canvasAndVisualiserContRef = useRef<HTMLDivElement | null>(null);

    const moveAnimationFrameId = useRef<number>()
    const visualiserAnimationFrame = useRef<number>()
    const beatsForSquareAnimationFrame = useRef<number>()

    const canvasMidPoint = useRef(0)
    const boxStats = useRef<bounceBoxStats>({
        boxWidth: 30,
        xPosition: 0,
        yPosition: 0,
        xDirection: 1,
        yDirection: 1,
        speed: 3,
        hue: 360
    })
    const originalBoxStats = useRef<bounceBoxStats>({ ...boxStats.current })
    const audioAnalyserRef = useRef<AnalyserNode>()
    const [audioUrl, audioUrlSet] = useState("");
    const [showingSettings, showingSettingsSet] = useState(audioUrl === "" ? true : false)
    const [useVisualiser, useVisualiserSet] = useState(false);
    const [audioPairedOnce, audioPairedOnceSet] = useState(false);
    const [fftSize,] = useState(256 * 4)
    const highestBeatValuePossible = useMemo(() => {
        return (fftSize / 4) - 1
    }, [fftSize])
    const [activeBar, activeBarSet] = useState<barRange>()
    const [viewingRuleSettings, viewingRuleSettingsSet] = useState(false)
    const [activePosition, activePositionSet] = useState<"start" | "end">()

    const defaultRules = {
        scale: {
            modifier: 1.5
        },
        rotate: {
            modifier: 45
        },
        particle: {
            src: ""
        },
        switchX: true,
        switchY: true,
    };

    type rules = typeof defaultRules
    type ruleKey = keyof rules
    type barRange = {
        id: string,
        startIndex: number,
        endIndex: number,
        target: number,
        sum: number,
        average: number,
        alreadyHitBeat: boolean,
        color: number,
        rules: Partial<rules>
    }

    const barRanges = useRef<barRange[]>([
        {
            id: uuidV4(),
            startIndex: 0,
            //                base   /in quarters
            endIndex: (((fftSize / 2) / 8) * 1) - 1,
            target: Math.floor(Math.random() * highestBeatValuePossible),
            sum: 0,
            average: 0,
            color: 0,
            alreadyHitBeat: false,
            rules: {}
        }
    ]);

    const [, refreshToggleSet] = useState(false);

    //start off all
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        startOff()
    }, [])

    //pair context and audio once
    useEffect(() => {
        if (audioUrl === "" || audioPairedOnce) return
        audioPairedOnceSet(true)

        const context = new AudioContext();

        const audioSrcRef = context.createMediaElementSource(audioElRef.current);
        audioAnalyserRef.current = context.createAnalyser();

        audioSrcRef.connect(audioAnalyserRef.current);
        audioAnalyserRef.current.connect(context.destination);
        audioAnalyserRef.current.fftSize = fftSize
    }, [audioUrl, audioPairedOnce]);

    //ensure animation frames dont overlap
    useEffect(() => {
        if (showingSettings) {
            if (beatsForSquareAnimationFrame.current) cancelAnimationFrame(beatsForSquareAnimationFrame.current)

        } else {
            if (visualiserAnimationFrame.current) cancelAnimationFrame(visualiserAnimationFrame.current)
        }
    }, [showingSettings])

    function handleVisualiser(option: "start" | "stop") {
        if (option === "start") {
            if (audioAnalyserRef.current === undefined) return

            const ctx = canvasRef.current.getContext("2d");

            const bufferLength = audioAnalyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const CanvasWidth = canvasRef.current.width;
            const CanvasHeight = canvasRef.current.height;

            let barHeight: number = 0;
            const barWidth = (CanvasWidth / bufferLength)
            let x = 0;

            const renderFrame = () => {
                console.log(`visualiserAnimationFrame running`);
                visualiserAnimationFrame.current = requestAnimationFrame(renderFrame);
                if (ctx === null || audioAnalyserRef.current === undefined) return

                x = 0;
                audioAnalyserRef.current.getByteFrequencyData(dataArray);

                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, CanvasWidth, CanvasHeight);

                //clear out the sum in each barRange
                for (let index = 0; index < barRanges.current.length; index++) {
                    barRanges.current[index].sum = 0;
                }

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    //add to sum in each bar range
                    for (let index = 0; index < barRanges.current.length; index++) {
                        const barRange = barRanges.current[index];

                        if (i >= barRange.startIndex && i <= barRange.endIndex) {
                            barRange.sum += barHeight
                        }
                    }

                    let r = barHeight + (25 * (i / bufferLength));
                    let g = 250 * (i / bufferLength);
                    let b = 50;

                    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                    ctx.fillRect(x, CanvasHeight - ((barHeight / highestBeatValuePossible) * CanvasHeight), barWidth, barHeight);

                    x += barWidth;
                }

                //apply averages to each barRange
                for (let index = 0; index < barRanges.current.length; index++) {
                    const barRange = barRanges.current[index]
                    barRange.average = barRange.sum / ((barRange.endIndex - barRange.startIndex) + 1)
                }

                refreshToggleSet(prev => !prev)
            }

            renderFrame();

        } else {
            //stop

            if (visualiserAnimationFrame.current) cancelAnimationFrame(visualiserAnimationFrame.current)
        }
    }

    function handleBeatsForSquare(option: "start" | "stop") {
        if (audioAnalyserRef.current === undefined) return

        if (option === "start") {
            if (beatsForSquareAnimationFrame.current) cancelAnimationFrame(beatsForSquareAnimationFrame.current)

            const bufferLength = audioAnalyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const renderFrame = () => {
                beatsForSquareAnimationFrame.current = requestAnimationFrame(renderFrame);
                if (audioAnalyserRef.current === undefined) return

                audioAnalyserRef.current.getByteFrequencyData(dataArray);

                for (let index = 0; index < barRanges.current.length; index++) {
                    //clear out the sum 
                    barRanges.current[index].sum = 0;

                    //compute total sum
                    for (let bufferLengthIndex = barRanges.current[index].startIndex; bufferLengthIndex <= barRanges.current[index].endIndex; bufferLengthIndex++) {
                        barRanges.current[index].sum += dataArray[bufferLengthIndex]
                    }

                    //get average
                    for (let barRangeIndex = 0; barRangeIndex < barRanges.current.length; barRangeIndex++) {
                        barRanges.current[index].average = barRanges.current[index].sum / ((barRanges.current[index].endIndex - barRanges.current[index].startIndex) + 1)
                    }

                    //detect if beat hit
                    if (barRanges.current[index].average > barRanges.current[index].target) {

                        if (!barRanges.current[index].alreadyHitBeat) {
                            handleBeatHit(boxStats.current, barRanges.current[index])
                        }

                        barRanges.current[index].alreadyHitBeat = true
                    } else {
                        barRanges.current[index].alreadyHitBeat = false

                    }
                }


                refreshToggleSet(prev => !prev)
            }

            renderFrame();
        } else {
            //stop

            if (beatsForSquareAnimationFrame.current) cancelAnimationFrame(beatsForSquareAnimationFrame.current)
        }
    }

    function startOff() {
        //get canvas midpoint
        canvasMidPoint.current = backgroundRef.current.offsetWidth / 2

        //put everything in the center
        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)
    }

    function handleBeatHit(boxStatsPassed: bounceBoxStats, barRange: barRange) {

        const entries = Object.entries(barRange.rules)

        for (let index = 0; index < entries.length; index++) {
            const eachEntry = entries[index];
            const eachKey = eachEntry[0] as ruleKey
            const eachValue = eachEntry[1]

            if (eachKey === "scale") {
                boxRef.current.style.scale = `${barRange.rules[eachKey]!.modifier}`

                setTimeout(() => {
                    boxRef.current.style.scale = `1`
                }, 100);

            } else if (eachKey === "rotate") {
                boxRef.current.style.rotate = `${parseInt(boxRef.current.style.rotate) + barRange.rules[eachKey]!.modifier}`

            } else if (eachKey === "particle") {
                //spawn square at location
                //keep direction
                //move the particle offscreen

                //or just spawn a particle at current location
                barRange.rules[eachKey]

            } else if (eachKey === "switchX") {
                if (barRange.rules[eachKey]) {
                    //determine left or right hit
                    if (boxStatsPassed.xDirection > 0) {
                        makeBorder(backgroundRef.current, boxStatsPassed, "right")
                        makeInnerColorTransitionBox("right", boxRef.current, boxStatsPassed)
                    } else {
                        makeBorder(backgroundRef.current, boxStatsPassed, "left")
                        makeInnerColorTransitionBox("left", boxRef.current, boxStatsPassed)

                    }
                    boxStatsPassed.xDirection *= -1

                }

            } else if (eachKey === "switchY") {
                if (barRange.rules[eachKey]) {
                    if (boxStatsPassed.yDirection > 0) {
                        makeBorder(backgroundRef.current, boxStatsPassed, "bottom")
                        makeInnerColorTransitionBox("bottom", boxRef.current, boxStatsPassed)

                    } else {
                        makeBorder(backgroundRef.current, boxStatsPassed, "top")
                        makeInnerColorTransitionBox("top", boxRef.current, boxStatsPassed)
                    }
                    boxStatsPassed.yDirection *= -1
                }
            }
        }
    }

    function clearAllBorders() {
        const borders = document.querySelectorAll(`.${styles.border}`)
        borders.forEach(eachBorder => eachBorder.remove())
    }

    function makeBorder(containerPassed: HTMLDivElement, boxStatsPassed: bounceBoxStats, direction?: "top" | "bottom" | "left" | "right") {
        const newBorder = document.createElement("div")

        newBorder.classList.add(styles.border)

        newBorder.style.position = `absolute`

        const randHue = (boxStatsPassed.hue + 10 + 180) % 360
        boxStatsPassed.hue = randHue

        newBorder.style.backgroundColor = `hsl(${randHue}, 100%, 50%)`

        //normal
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

        containerPassed.appendChild(newBorder)
    }

    function makeInnerColorTransitionBox(side: borderType, boxRefPassed: HTMLDivElement, boxStatsPassed: bounceBoxStats) {
        const newInnerSquare = document.createElement("div")

        newInnerSquare.style.width = `${boxRefPassed.clientWidth}px`

        const currentHue = boxStatsPassed.hue

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

    function centerBoxAndCanvas(canvasMidPointPassed: number, boxStatsPassed: bounceBoxStats, boxRefPassed: HTMLDivElement, mainDivRefPassed: HTMLDivElement) {
        boxStatsPassed.xPosition = canvasMidPointPassed
        boxStatsPassed.yPosition = canvasMidPointPassed
        boxRefPassed.style.translate = `${boxStatsPassed.xPosition}px ${boxStatsPassed.yPosition}px`

        mainDivRefPassed.scrollTop = (mainDivRefPassed.scrollHeight / 2 - mainDivRefPassed.offsetHeight / 2)
        mainDivRefPassed.scrollLeft = (mainDivRefPassed.scrollWidth / 2 - mainDivRefPassed.offsetWidth / 2)
    }

    function stopMovementAndReset() {
        if (moveAnimationFrameId.current) {
            cancelAnimationFrame(moveAnimationFrameId.current);
        }

        boxStats.current = { ...originalBoxStats.current }

        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)

        refreshToggleSet(prev => !prev)

        audioElRef.current.pause()
        audioElRef.current.currentTime = 0
    }

    function startMoveLoop() {
        moveAnimationFrameId.current = requestAnimationFrame(startMoveLoop)
        moveBox(boxStats.current, backgroundRef.current, boxRef.current, mainDivRef.current)
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
        audioUrlSet(url);
    };

    async function handlePlay() {
        canvasMidPoint.current = backgroundRef.current.offsetWidth / 2
        centerBoxAndCanvas(canvasMidPoint.current, boxStats.current, boxRef.current, mainDivRef.current)

        handleBeatsForSquare("start")

        audioElRef.current.currentTime = 0
        await audioElRef.current.play()

        clearAllBorders()

        if (moveAnimationFrameId.current) cancelAnimationFrame(moveAnimationFrameId.current)
        startMoveLoop()
    }

    const changeBarRanges = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, activeBar: barRange, activePosition: "start" | "end") => {
        if (!canvasAndVisualiserContRef.current) return;

        const rect = canvasAndVisualiserContRef.current.getBoundingClientRect();

        let offsetX = 0;
        offsetX = event.clientX - rect.left;
        const percentDecimalX = (offsetX / rect.width);

        const maxBarIndex = (fftSize / 2) - 1
        let newIndex = Math.floor(maxBarIndex * percentDecimalX)

        if (newIndex < 0) {
            newIndex = 0
        }

        if (newIndex > maxBarIndex) {
            newIndex = maxBarIndex
        }

        if (activePosition === "start") {
            //configure start
            barRanges.current = barRanges.current.map(eachBarRange => {
                if (eachBarRange.id === activeBar.id) {
                    eachBarRange.startIndex = newIndex
                }
                return eachBarRange
            })

        } else {
            //configure end

            barRanges.current = barRanges.current.map(eachBarRange => {
                if (eachBarRange.id === activeBar.id) {
                    eachBarRange.endIndex = newIndex
                }
                return eachBarRange
            })
        }

        refreshToggleSet(prev => !prev)
    };

    function setNewTarget(e: React.MouseEvent<HTMLDivElement, MouseEvent>, barRange: barRange) {
        const el = (e.currentTarget as HTMLDivElement)
        if (el === null) return
        const rect = el.getBoundingClientRect();

        let offsetY = e.clientY - rect.top;
        const percentDecimalY = (offsetY / rect.height);
        let newTarget = highestBeatValuePossible - Math.floor(highestBeatValuePossible * percentDecimalY)

        if (newTarget < 0) {
            newTarget = 0
        }

        if (newTarget > highestBeatValuePossible) {
            newTarget = highestBeatValuePossible
        }

        barRanges.current = barRanges.current.map(eachBarRange => {
            if (eachBarRange.id === barRange.id) {
                barRange.target = newTarget
            }
            return eachBarRange
        })
    }

    return (
        <main ref={mainDivRef} className={`${styles.mainDiv} noScrollBar`}>
            <div style={{ position: "fixed", top: 0, right: 0, zIndex: 99, display: "grid", overflowY: 'auto', width: showingSettings ? "min(400px, 100%)" : "", height: "100svh" }}>
                {!showingSettings && (
                    <div className={styles.hoverSvg}
                        onClick={() => {
                            showingSettingsSet(true)
                            useVisualiserSet(false)
                        }}
                    >
                        <svg style={{ fill: "#fff", width: "2rem", cursor: "pointer", margin: ".5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" /></svg>
                    </div>
                )}

                <div className={styles.settingsCont} style={{ display: !showingSettings ? "none" : "grid" }}>
                    <button className={styles.settingsButton} style={{ justifySelf: "flex-end" }}
                        onClick={() => {
                            showingSettingsSet(false)
                        }}>
                        <span className="material-symbols-outlined">
                            close
                        </span>
                    </button>

                    <button className={styles.settingsButton} style={{ display: audioUrl ? "" : "none", justifySelf: "center" }}
                        onClick={() => {
                            useVisualiserSet(!useVisualiser)

                            if (!useVisualiser) {
                                //show stuff
                                handleVisualiser("start")

                            } else {
                                //hide stuff
                                handleVisualiser("stop")
                            }
                        }}
                    >{useVisualiser ? "hide visualiser" : "show visualiser"}</button>

                    {/* holds canvas and container */}
                    <div ref={canvasAndVisualiserContRef} style={{ display: useVisualiser ? "grid" : "none", position: "relative", justifySelf: "stretch", height: "200px", zIndex: 0 }}
                        onMouseUp={(e) => {
                            if (activeBar === undefined || activePosition === undefined) return

                            changeBarRanges(e, activeBar, activePosition)
                        }}
                    >
                        <canvas ref={canvasRef} className={styles.canvas}></canvas>

                        {barRanges.current.map(eachBarRange => {
                            const numberOfBars = fftSize / 2
                            const barRangeWidth = ((eachBarRange.endIndex - eachBarRange.startIndex) / numberOfBars) * 100
                            const leftPos = (eachBarRange.startIndex / numberOfBars) * 100
                            const isActive = eachBarRange.id === activeBar?.id

                            return (
                                <div key={eachBarRange.id} style={{ position: "absolute", top: 0, left: `${leftPos}%`, height: "100%", width: `${barRangeWidth}%`, backgroundColor: `hsl(${eachBarRange.color},100%, 50%)`, opacity: .2, pointerEvents: isActive ? undefined : "none", zIndex: isActive ? 1 : "", }}>
                                    <div style={{ display: isActive ? "" : "none", aspectRatio: "1/2", width: "20px", backgroundColor: "#eee", userSelect: "none", position: "absolute", top: 0, left: 0, }}
                                        onMouseDown={(e) => {
                                            activePositionSet("start")
                                        }}
                                    ></div>

                                    <div style={{ display: isActive ? "" : "none", aspectRatio: "1/2", width: "20px", backgroundColor: "#eee", userSelect: "none", position: "absolute", bottom: 0, right: 0, }}
                                        onMouseDown={(e) => {
                                            activePositionSet("end")
                                        }}
                                    ></div>
                                </div>
                            )
                        })}
                    </div>

                    {/* displays bar ranges and buttons to modify them */}
                    {useVisualiser && (
                        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", alignItems: "center", justifySelf: "stretch" }}>
                            {barRanges.current.map(eachBarRange => {//255 is the highest value the bars can have
                                const yPos = Math.floor(100 - ((eachBarRange.average / highestBeatValuePossible) * 100))

                                const hitMarkerYPos = ((highestBeatValuePossible - eachBarRange.target) / highestBeatValuePossible) * 100
                                const isActive = eachBarRange.id === activeBar?.id

                                return (
                                    <div key={eachBarRange.id} style={{ flex: "0 0 150px", width: "300px", aspectRatio: "1/1.5", display: "grid", gridTemplateRows: "auto 1fr" }}>
                                        <div style={{ display: "flex" }}>
                                            <div style={{ flex: 1, height: "100%", backgroundColor: isActive ? "orange" : "grey" }}
                                                onMouseDown={() => {
                                                    activeBarSet(eachBarRange)
                                                }}
                                            ></div>

                                            {isActive && (
                                                <button className={styles.settingsButton}
                                                    onClick={() => {
                                                        viewingRuleSettingsSet(prev => !prev)
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        tune
                                                    </span>
                                                </button>
                                            )}

                                            <button className={styles.settingsButton}
                                                onClick={() => {
                                                    barRanges.current = barRanges.current.filter(each => each.id !== eachBarRange.id)
                                                }}
                                            >
                                                <span className="material-symbols-outlined">
                                                    close
                                                </span>
                                            </button>
                                        </div>

                                        <div style={{ backgroundColor: "#000", position: "relative", overflow: "clip", border: `2px solid ${eachBarRange.average > eachBarRange.target ? "#fff" : "#000"}` }}
                                            onMouseUp={(e) => {
                                                setNewTarget(e, eachBarRange)
                                                activeBarSet(eachBarRange)
                                            }}
                                        >
                                            {/* background bar color */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%", translate: `0 ${yPos}%`, backgroundColor: `hsl(${eachBarRange.color},100%,50%)`, }}></div>

                                            {/* hit marker line */}
                                            <div style={{ position: 'absolute', top: `${hitMarkerYPos}%`, left: 0, width: "100%", height: "5px", backgroundColor: "#fff", translate: "0 -50%" }}></div>

                                            {/* hit marker button */}
                                            <div style={{ aspectRatio: "2/1", width: "20%", backgroundColor: "#eee", userSelect: "none", position: "absolute", top: `${hitMarkerYPos}%`, left: "50%", translate: "-50% -50%" }}></div>

                                            {/* menu rule selection */}
                                            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "blue", display: viewingRuleSettings && isActive ? "grid" : "none", alignContent: "flex-start" }}>
                                                <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
                                                    {Object.entries(defaultRules).map(([key, value]) => {
                                                        const eachKey = key as ruleKey

                                                        return (
                                                            <button className={styles.settingsButton} key={eachKey}
                                                                onClick={() => {
                                                                    if (eachKey === "scale") {
                                                                        eachBarRange.rules[eachKey] = defaultRules[eachKey]
                                                                    } else if (eachKey === "rotate") {
                                                                        eachBarRange.rules[eachKey] = defaultRules[eachKey]
                                                                    } else if (eachKey === "particle") {
                                                                        eachBarRange.rules[eachKey] = defaultRules[eachKey]
                                                                    } else if (eachKey === "switchX") {
                                                                        eachBarRange.rules[eachKey] = defaultRules[eachKey]
                                                                    } else if (eachKey === "switchY") {
                                                                        eachBarRange.rules[eachKey] = defaultRules[eachKey]
                                                                    }
                                                                }}
                                                            >{eachKey}</button>
                                                        )
                                                    })}
                                                </div>

                                                <div className={styles.ruleCont}>
                                                    {/* display and edit rules */}
                                                    {Object.entries(eachBarRange.rules).map(([key, value]) => {
                                                        const eachKey = key as ruleKey

                                                        return (
                                                            <Fragment key={eachKey}>
                                                                {eachKey === "scale" && (
                                                                    <div>
                                                                        <label htmlFor="scaleInput">Change Scale</label>

                                                                        <input id="scaleInput" type="text" value={`${eachBarRange.rules[eachKey]!.modifier}`} onChange={(e) => {
                                                                            eachBarRange.rules[eachKey]!.modifier = parseFloat(e.target.value)
                                                                        }} />
                                                                    </div>
                                                                )}

                                                                {eachKey === "rotate" && (
                                                                    <div>
                                                                        <label htmlFor="rotateInput">Change Rotate</label>

                                                                        <input id="rotateInput" type="text" value={`${eachBarRange.rules[eachKey]!.modifier}`} onChange={(e) => {
                                                                            eachBarRange.rules[eachKey]!.modifier = parseInt(e.target.value)
                                                                        }} />
                                                                    </div>
                                                                )}

                                                                {eachKey === "particle" && (
                                                                    <div>
                                                                        <label htmlFor="particleInput">Change Particles</label>

                                                                        <input id="particleInput" type="text" value={`${eachBarRange.rules[eachKey]!.src}`} placeholder="Enter Image Src" onChange={(e) => {
                                                                            eachBarRange.rules[eachKey]!.src = e.target.value
                                                                        }} />
                                                                    </div>
                                                                )}

                                                                {eachKey === "switchX" && (
                                                                    <label>will bounce on x</label>
                                                                )}

                                                                {eachKey === "switchY" && (
                                                                    <label>will bounce on y</label>
                                                                )}
                                                            </Fragment>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <button className={styles.settingsButton}
                                onClick={() => {
                                    barRanges.current.push({
                                        id: uuidV4(),
                                        startIndex: (((fftSize / 2) / 4) * 1) - 1,
                                        endIndex: (((fftSize / 2) / 4) * 2) - 1,
                                        target: Math.floor(Math.random() * ((fftSize / 2) - 1)),
                                        sum: 0,
                                        average: 0,
                                        color: (30 * barRanges.current.length) % 360,
                                        alreadyHitBeat: false,
                                        rules: {}
                                    })
                                }}
                            >Add Range</button>
                        </div>
                    )}

                    <audio ref={audioElRef} src={audioUrl} autoPlay controls
                        onEnded={() => {
                            stopMovementAndReset()
                        }}></audio>

                    <div style={{ display: "grid" }}>
                        <input type="file" onChange={handleFileChange} accept="audio/*" />
                        {audioUrl === "" && (
                            <button className={styles.settingsButton} style={{ justifySelf: "flex-end" }}
                                onClick={() => {
                                    audioUrlSet("/want.mp3")
                                }}>use default music</button>
                        )}
                    </div>

                    {audioUrl !== "" && (
                        <button onClick={() => {
                            handlePlay()
                            showingSettingsSet(false)
                        }}>Play</button>
                    )}
                </div>
            </div>

            <div ref={backgroundRef} className={styles.background}>
                <div ref={boxRef} className={styles.box} style={{ width: `${boxStats.current.boxWidth}px`, backgroundColor: `hsl(${boxStats.current.hue},100%,50%)` }}>
                </div>
            </div>
        </main>
    )
}















































   // function fpsLoop(fpsLoopTime: React.MutableRefObject<number>, fpsLoopInterval: React.MutableRefObject<NodeJS.Timeout | undefined>, callBackFunction: () => void) {
    //     if (fpsLoopInterval.current) clearInterval(fpsLoopInterval.current)

    //     fpsLoopInterval.current = setInterval(callBackFunction, fpsLoopTime.current)
    // }




     // const numberOfBars = 32 * 8
                // const searchRange = bufferLength / numberOfBars

                // for (let i = 0; i < numberOfBars; i++) {
                //     let barValuesSum = 0
                //     // let barHeight: number = 0;
                //     const barWidth = (WIDTH / numberOfBars)

                //     for (let j = 0; j < searchRange; j++) {
                //         const barHeight = dataArray[i + j];
                //         barValuesSum += barHeight
                //     }

                //     const average = barValuesSum / searchRange

                //     // let r = ((i + average) / (numberOfBars - 1)) % 255;
                //     let r = average + (25 * (i / numberOfBars));

                //     let g = 250 * (i / average);
                //     let b = 50;

                //     ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                //     ctx.fillRect(x, HEIGHT - ((average / 255) * HEIGHT), barWidth, average);

                //     x += barWidth;
                // }


                 //old stuff
        // if (audioUrl === "") return
        // if (loadedAudio.current) return
        // loadedAudio.current = true

        // //register audio source
        // const audioContext = new AudioContext();
        // const analyser = audioContext.createAnalyser();
        // analyser.fftSize = 256; // Adjust as needed
        // const source = audioContext.createMediaElementSource(audioRef.current);
        // source.connect(analyser);
        // analyser.connect(audioContext.destination);

        // const bufferLength = analyser.frequencyBinCount;
        // const dataArray = new Uint8Array(bufferLength);

        // let loopCount = 0
        // const renderFrame = () => {
        //     loopCount++
        //     requestAnimationFrame(renderFrame);
        //     analyser.getByteFrequencyData(dataArray);

        //     let sum = 0;
        //     for (let i = 0; i < bufferLength / 2; i++) {
        //         sum += dataArray[i];
        //     }

        //     if (loopCount > 6) {
        //         loopCount = 0

        //         const average = sum / (bufferLength / 2);

        //         if (average > (previousAverage.current + threshold.current)) {
        //             handleBeatHit(boxStats.current, recordTimeStared.current)
        //         }

        //         previousAverage.current = average
        //     }
        // };

        // renderFrame();