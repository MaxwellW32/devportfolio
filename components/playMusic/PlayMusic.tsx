"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./playmusic.module.css"

export default function PlayMusic() {
    const [seenOnPhone, seenOnPhoneSet] = useState<boolean | undefined>()
    const [audioPlaying, audioPlayingSet] = useState(false)
    const [ableToPlayOnPhone, ableToPlayOnPhoneSet] = useState(false)

    //check seenOnPhone
    useEffect(() => {
        seenOnPhoneSet(() => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        })
    }, [])

    const audioRef = useRef<HTMLAudioElement>(null!)

    return seenOnPhone === undefined ? null :
        (
            <>
                {seenOnPhone ? (
                    <>
                        <div className="toolTip musicDiv" style={{ display: ableToPlayOnPhone ? "flex" : "none", marginBlock: "1rem", position: "absolute", top: 0, left: "50%", translate: "-50% 0", zIndex: 1000, }} data-tooltip="Play Music">
                            <svg className={`${styles.musicIcon}`} onClick={() => {
                                if (audioPlaying) {
                                    audioRef.current.pause()
                                } else {
                                    audioRef.current.play()
                                }

                                audioPlayingSet(prev => !prev)
                            }}
                                style={{ "--audioNotPlayingPlayState": audioPlaying ? "paused" : "running", "--audioPlayingPlayState": audioPlaying ? "running" : "paused" } as React.CSSProperties}
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" /></svg>
                        </div>

                        <audio
                            style={{ margin: "0 auto" }}
                            ref={audioRef}
                            controls={ableToPlayOnPhone ? false : true}
                            loop
                            src="/sound/bg.mp3"
                            onPlayCapture={(e) => {
                                ableToPlayOnPhoneSet(true)
                                audioPlayingSet(true)
                            }}
                        >
                        </audio>
                    </>
                ) : (
                    <div className="toolTip musicDiv" style={{ marginBlock: "1rem", position: "absolute", top: 0, left: "50%", translate: "-50% 0", zIndex: 1000, }} data-tooltip="Play Music">
                        <svg className={`${styles.musicIcon}`} onClick={() => {
                            if (audioPlaying) {
                                audioRef.current.pause()
                            } else {
                                audioRef.current.play()
                            }

                            audioPlayingSet(prev => !prev)
                        }}
                            style={{ "--audioNotPlayingPlayState": audioPlaying ? "paused" : "running", "--audioPlayingPlayState": audioPlaying ? "running" : "paused" } as React.CSSProperties}
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" /></svg>

                        <audio
                            ref={audioRef}
                            loop
                            src="/sound/bg.mp3">
                        </audio>
                    </div>
                )}
            </>
        )
}



