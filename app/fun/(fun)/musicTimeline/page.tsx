"use client"
import React, { useMemo, useState, useRef } from 'react'
import styles from "./style.module.css"

export default function Page() {
    //timeline in ms
    //audio plays in timeline current index is greater than its min and less than its max
    //use useref for everything

    type soundItem = {
        id: string
        start: number,
        end: number,
        src: string,
        bgColor: string,
        rowIndex: number,
        type: "soundItem"
    }

    type effectItem = {
        id: string
        start: number,
        end: number,
        bgColor: string,
        rowIndex: number,
        type: "effectItem"
    }

    const [timelineTime, timelineTimeSet] = useState<number>(15000)
    const [currentTime, currentTimeSet] = useState<number>(0)
    const [itemList, itemListSet] = useState<(soundItem | effectItem)[]>([
        {
            id: "12",
            start: 5,
            end: 15,
            src: "",
            bgColor: "red",
            rowIndex: 0,
            type: "soundItem"
        },
        {
            id: "dsd",
            start: 10,
            end: 16,
            bgColor: "green",
            rowIndex: 1,
            type: "effectItem"
        }
    ])
    const [isPaused, isPausedSet] = useState(false)
    const [segmentWidth,] = useState(20)
    const [rowHeight,] = useState(20)

    const playingInterval = useRef<NodeJS.Timeout>()

    const timeLineArray = useMemo(() => {
        return new Array(timelineTime).fill("")
    }, [timelineTime])


    return (
        <main className={styles.main} style={{ "--segmentWidth": `${segmentWidth}px`, "--rowHeight": `${rowHeight}px` } as React.CSSProperties}>
            <h1 style={{ marginBottom: "3rem" }}>hi there</h1>

            <div className={styles.timeLine}>
                <div className={styles.playHead} style={{ translate: `${currentTime * segmentWidth}px 0` }}></div>

                <div className={styles.timeLineNav}></div>

                <div className={styles.timeLineMarkerCont}>
                    {timeLineArray.map((each, eachIndex) => {
                        return (
                            <div key={eachIndex} className={styles.timelineMarker} onMouseEnter={() => {
                                if (isPaused) {
                                    currentTimeSet(eachIndex)
                                }
                            }}>
                                <p className={styles.markerTime}>{currentTime === eachIndex ? eachIndex : null}</p>
                            </div>
                        )
                    })}

                    {itemList.map(eachItem => {
                        return (
                            <div key={eachItem.id} className={styles.timeLineItem} style={{ top: `${eachItem.rowIndex * rowHeight}px`, left: `${eachItem.start * segmentWidth}px`, width: `${(eachItem.end - eachItem.start) * segmentWidth}px`, height: `${rowHeight}px`, backgroundColor: `${eachItem.bgColor}` }}></div>
                        )
                    })}
                </div>
            </div>

            <div className={styles.buttonCont}>
                <button onClick={() => {
                    if (playingInterval.current !== undefined) return

                    playingInterval.current = setInterval(() => {
                        currentTimeSet(prev => {
                            let newTime = prev + 1
                            if (newTime > timelineTime) newTime = 0
                            return newTime
                        })
                    }, 1)

                    isPausedSet(false)
                }}>Play</button>

                <button onClick={() => {
                    if (playingInterval.current) clearInterval(playingInterval.current)
                    playingInterval.current = undefined
                    isPausedSet(true)
                }}>Stop</button>
            </div>
        </main>
    )
}
