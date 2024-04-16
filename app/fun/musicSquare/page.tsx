"use client"
import HideNav from '@/components/hideNav/HideNav'
import React, { useEffect, useRef, useState } from 'react'
import styles from "./page.module.css"
import MusicBox from './MusicBox'
import { musicBoxControls } from './musicTypes'
import { v4 as uuidV4 } from "uuid"

export default function Page() {
    const mainDivRef = useRef<HTMLDivElement>(null!)
    const [showingSettings, showingSettingsSet] = useState(false)
    const [audioUrl, setAudioUrl] = useState("");
    const [musicBoxControls, musicBoxControlsSet] = useState<musicBoxControls[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null!);

    const [started, startedSet] = useState(false)


    //handle audio change
    useEffect(() => {
        if (!started) return
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

            musicBoxControlsSet(prevBoxControls => {
                const newBoxControls = prevBoxControls.map((eachBoxControl) => {
                    if (average > eachBoxControl.threshold) {
                        if (!eachBoxControl.hitThreshold) {
                            eachBoxControl.hitThreshold = true
                            eachBoxControl.beatSwitch = !eachBoxControl.beatSwitch
                        }

                    } else {
                        eachBoxControl.hitThreshold = false
                    }

                    return eachBoxControl
                })

                return newBoxControls
            })
        };

        renderFrame();
    }, [started]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (!fileList) return

        const File = fileList[0]
        const url = URL.createObjectURL(File);
        setAudioUrl(url);
        startedSet(true)
    };

    function addNewBoxControl() {
        musicBoxControlsSet(prevBoxControls => {
            const newBoxControlsObj: musicBoxControls = {
                id: uuidV4(),
                beatSwitch: false,
                boxStats: { boxWidth: 10, xPosition: 0, yPosition: 0, xDirection: 1, yDirection: 1, speed: 1, hue: Math.floor(Math.random() * 361) },
                threshold: 160,
                hitThreshold: false
            }
            const newBoxControls = [newBoxControlsObj, ...prevBoxControls]
            return newBoxControls
        })
    }

    function handleInputs(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        musicBoxControlsSet(prevBoxControls => {
            const newBoxControls = [...prevBoxControls]

            if (e.target.name === "threshold") {
                newBoxControls[index].threshold = parseInt(e.target.value)
            }

            return newBoxControls
        })
    }

    function handleBoxStatsInputs(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        musicBoxControlsSet(prevBoxControls => {
            const newBoxControls = [...prevBoxControls]
            // @ts-ignore
            newBoxControls[index].boxStats[e.target.name] = parseInt(e.target.value)

            return newBoxControls
        })
    }

    return (
        <HideNav>
            <main ref={mainDivRef} className={styles.mainDiv} style={{ backgroundColor: "#fff", color: "#000", height: "100svh" }}>
                <div style={{ justifySelf: "flex-end", display: "grid", overflowY: 'auto', width: showingSettings ? "min(400px, 100%)" : "", }}>
                    {!showingSettings && (
                        <div onClick={() => { showingSettingsSet(true) }}>
                            <svg style={{ fill: "#000", width: "2rem", cursor: "pointer" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" /></svg>
                        </div>
                    )}

                    <div className={styles.settingsCont} style={{ display: !showingSettings ? "none" : "grid", alignContent: "flex-start" }}>
                        <p style={{ justifySelf: "flex-end" }} onClick={() => { showingSettingsSet(false) }}>Close</p>
                        <audio ref={audioRef} controls src={audioUrl} autoPlay loop></audio>
                        <input type="file" onChange={handleFileChange} accept="audio/*" />

                        <button style={{ marginTop: "2rem" }} onClick={addNewBoxControl}>Add MusicBox</button>

                        <div className='snap' style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "100%", overflowX: "scroll" }}>
                            {musicBoxControls.map((eachMusicBoxControl, eachBoxControlIndex) => {
                                return (
                                    <div key={eachMusicBoxControl.id} className={styles.formCont}>
                                        {Object.entries(eachMusicBoxControl.boxStats).map((eachKeyValArr, eachKeyValArrIndex) => {
                                            const validBox = eachKeyValArr[0] === "boxWidth" || eachKeyValArr[0] === "speed" || eachKeyValArr[0] === "hue"
                                            if (!validBox) return

                                            return (
                                                <React.Fragment key={eachKeyValArrIndex}>
                                                    <label>{eachKeyValArr[0]}</label>
                                                    <input name={eachKeyValArr[0]} type='number' placeholder={`enter ${eachKeyValArr[0]} value`} value={`${eachKeyValArr[1]}`} onChange={(e) => { handleBoxStatsInputs(e, eachBoxControlIndex) }} />
                                                </React.Fragment>
                                            )
                                        })}

                                        <label>threshold</label>
                                        <input name='threshold' type='text' placeholder='enter threshold' value={`${eachMusicBoxControl.threshold}`} onChange={(e) => { handleInputs(e, eachBoxControlIndex) }} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {musicBoxControls.map(eachBoxControl => {
                    return (
                        <MusicBox key={eachBoxControl.id} container={mainDivRef.current} boxStatsStarter={eachBoxControl.boxStats} beatSwitch={eachBoxControl.beatSwitch} />
                    )
                })}
            </main>
        </HideNav>
    )
}
