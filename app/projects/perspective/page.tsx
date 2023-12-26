"use client"
import YoutubeUrlParse, { YoutubePlaylistParse } from "@/useful/YoutubeUrlParse";
import styles from "./page.module.css"

import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { getPlaylist } from "./getPlaylist";
import { removeFromLocalStorage, retreiveFromLocalStorage, saveToLocalStorage } from "@/utility/saveToStorage";

const defaultVids = [
    "oihY8GiXXgQ",
    "tcaw6lzYt1Q",
    "ZU038QQW-K4",
    "ktBMxkLUIwY",
    "0gNauGdOkro",
    "3LiDtW0qZbY",
    "_EoEvXJcBuw",
    "wdvwO0e9Ddc",
    "WV38uDXHKz0",
    "EG0Ad6-RzUw",
    "7yyjFudHYuw",
    "-A-MzMaJiCk",
    "v-GXxA-yHzo",
    "qmhreNoVWG4",
    "h5NvTTOlOtI",
    "Gmx-54k3pUk",
    "MEiVnNNpJLA",
    "gQDX-sf89p4",
    "u_5-I0MhUww",
    "G3e-cpL7ofc",
    "3-yRTEFAv6g",
]

export default function Page() {
    const [fillIn, setFillIn] = useState(1);
    const [boxWidth, setBoxWidth] = useState(30);
    const boxHeight = useMemo(() => {
        const aspectRatio = 16 / 9;
        const height = boxWidth / aspectRatio;
        return height
    }, [boxWidth])
    const [boxLarge, boxLargeSet] = useState(false);

    const [menuExpanded, menuExpandedSet] = useState(false);
    const [addVideoMenuExpanded, addVideoMenuExpandedSet] = useState(false);
    const [addPlaylistVideoExpanded, addPlaylistVideoExpandedSet] = useState(false);
    const [loadingPlayList, loadingPlayListSet] = useState(false);

    const [perspectiveAmt, setPerspectiveAmt] = useState(500);
    const [currentVidIndex, setCurrentVidIndex] = useState(0);
    const [videosList, videosListSet] = useState<string[]>([])
    const [clearedOldVideos, clearedOldVideosSet] = useState(false)
    const [confirmClearAll, confirmClearAllSet] = useState(false)
    const [boxStats, setBoxStats] = useState({
        boxRotationX: 0,
        boxRotationY: 0,
        rotateCanStart: false,
    });

    const addVideoInputRef = useRef<HTMLInputElement>(null!)
    const addPlaylistVideosInputRef = useRef<HTMLInputElement>(null!)

    const moveNextVideo = () => {
        setCurrentVidIndex(prevVidIndex => (prevVidIndex + 4) % videosList.length
        );
    };

    const movePrevVideo = () => {
        setCurrentVidIndex(prevVidIndex => (prevVidIndex - 4 + videosList.length) % videosList.length);
    };

    function changeBoxSize() {
        boxLargeSet(prev => {
            if (prev) {
                setFillIn(1);
                setBoxWidth(30);
                setPerspectiveAmt(500);
            } else {
                setBoxWidth(80);
                setPerspectiveAmt(200);
            }


            return !prev
        })
    }

    const handleBoxRotating = () => {
        setBoxStats(prevStats => {
            return { ...prevStats, rotateCanStart: !prevStats.rotateCanStart }
        })
    }

    const rotateBox = (options: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => {
        let xRotationAmount = 10

        if (options === "ArrowUp") {
            setBoxStats((prevStats) => {
                return { ...prevStats, boxRotationX: (prevStats.boxRotationX += xRotationAmount) };
            });
        } else if (options === "ArrowDown") {
            setBoxStats((prevStats) => {
                return { ...prevStats, boxRotationX: (prevStats.boxRotationX -= xRotationAmount) };
            });
        } else if (options === "ArrowLeft") {
            setBoxStats((prevStats) => {
                return { ...prevStats, boxRotationY: (prevStats.boxRotationY -= xRotationAmount) };
            });
        } else if (options === "ArrowRight") {
            setBoxStats((prevStats) => {
                return { ...prevStats, boxRotationY: (prevStats.boxRotationY += xRotationAmount) };
            });
        }
    }

    const addVideosToList = (passedVideos: string[], options: "single" | "multi" = "single") => {
        if (options === "single") {

            videosListSet(prev => {
                const seenVideoId = YoutubeUrlParse(passedVideos[0])

                if (prev.includes(seenVideoId)) {
                    toast.error("already in list")
                    return prev
                } else {
                    return [...prev, seenVideoId]
                }
            })
        }


        if (options === "multi") {
            const newVideoIdsArr = passedVideos.map(eachId => YoutubeUrlParse(eachId))

            videosListSet(prev => [...prev, ...newVideoIdsArr])
        }
    }

    const clearAllVideos = () => {
        videosListSet([])
        removeFromLocalStorage("perspectiveVideos")
    }

    //get saved video data
    useEffect(() => {
        const oldVideos = retreiveFromLocalStorage("perspectiveVideos")
        if (oldVideos !== null) {
            videosListSet(oldVideos)
        } else {
            videosListSet([...defaultVids])
        }
    }, [])

    //save video changes to storage
    useEffect(() => {
        if (videosList.length > 0) {
            saveToLocalStorage("perspectiveVideos", videosList)
        }

    }, [videosList])

    //rotate box on auto click
    useEffect(() => {

        if (!boxStats.rotateCanStart) return

        const interval = setInterval(() => {
            setBoxStats(prevStats => {
                return { ...prevStats, boxRotationY: prevStats.boxRotationY += 3 }
            })

        }, 1000)

        return () => clearInterval(interval)
    }, [boxStats.rotateCanStart])

    //register mouse down listeners
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "l") {
                moveNextVideo();
            } else if (event.key.toLowerCase() === "k") {
                handleBoxRotating()
            } else if (event.key.toLowerCase() === "j") {
                movePrevVideo();
            } else if (event.code === "Space") {
                changeBoxSize();
            } else if (event.key === "ArrowUp") {
                rotateBox("ArrowUp")
            } else if (event.key === "ArrowDown") {
                rotateBox("ArrowDown")
            } else if (event.key === "ArrowLeft") {
                rotateBox("ArrowLeft")
            } else if (event.key === "ArrowRight") {
                rotateBox("ArrowRight")
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div style={{ perspective: `${perspectiveAmt}px` }} className={styles.persContainer}>
            <div className={styles.persBox}
                style={{
                    "--fillIn": fillIn,
                    "--boxWidth": `${boxWidth}vh`,
                    "--boxHeight": `${boxHeight}vh`,
                    "--canPlayBottomAnim": boxStats.rotateCanStart ? "running" : "paused",
                    "--scaleXVal": boxLarge ? -1 : 1,
                    transform: `rotateX(${boxStats.boxRotationX}deg) rotateY(${boxStats.boxRotationY}deg)`,
                } as React.CSSProperties}
            >
                <div className={`${styles.side} ${styles.persFront}`}>
                    <DisplayVid id={videosList[(currentVidIndex) % videosList.length]} muted={false} />
                </div>

                <div className={`${styles.side} ${styles.persBack}`}>
                    <DisplayVid id={videosList[(currentVidIndex + 1) % videosList.length]} />
                </div>

                <div className={`${styles.side} ${styles.persLeft}`}>
                    <DisplayVid id={videosList[(currentVidIndex + 2) % videosList.length]} />
                </div>

                <div className={`${styles.side} ${styles.persRight}`}>
                    <DisplayVid id={videosList[(currentVidIndex + 3) % videosList.length]} />
                </div>

                <div className={`${styles.side} ${styles.persTop}`}
                    style={{
                        backgroundImage: `url("https://images.pexels.com/photos/1098764/pexels-photo-1098764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")`,
                    }}
                >
                </div>

                <div className={`${styles.side} ${styles.persBottom}`}
                    style={{
                        backgroundImage: `url("https://images.pexels.com/photos/1098764/pexels-photo-1098764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")`,
                    }}
                ></div>
            </div>

            <div style={{ position: "fixed", bottom: 0, left: "50%", translate: "-50% 0", margin: "1rem auto", display: "flex", flexDirection: "row-reverse", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                {/* main controls */}
                <div style={{ display: !menuExpanded ? "none" : "", flex: "0 0 300px" }}>
                    {/* delete all */}
                    <div style={{ display: "grid", justifyItems: "flex-end" }}>
                        {confirmClearAll ? (
                            <>
                                <p>Are you sure?</p>

                                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                    <button className={styles.settingsButton} onClick={() => {
                                        clearAllVideos()
                                        confirmClearAllSet(false)
                                    }}>yes</button>
                                    <button className={styles.settingsButton} onClick={() => confirmClearAllSet(false)}>cancel</button>
                                </div>
                            </>
                        ) : (
                            <button className={styles.settingsButton} onClick={() => {
                                confirmClearAllSet(true)
                            }}>clear all</button>
                        )}
                    </div>

                    {/* add playlist */}
                    <div>
                        <div style={{ display: "grid", justifyItems: "flex-end" }}>
                            {addPlaylistVideoExpanded ? (
                                <button className={styles.settingsButton} onClick={() => { addPlaylistVideoExpandedSet(false) }}>close</button>
                            ) : (
                                <button className={styles.settingsButton} onClick={() => { addPlaylistVideoExpandedSet(true) }}>Add Playlist</button>
                            )}
                        </div>

                        <div style={{ display: !addPlaylistVideoExpanded ? "none" : "grid", gridTemplateColumns: "1fr auto" }}>
                            <input ref={addPlaylistVideosInputRef} type="text" placeholder="Add Playlist..." />
                            <button disabled={loadingPlayList} className={styles.settingsButton} onClick={async () => {
                                if (addPlaylistVideosInputRef.current.value === "") return

                                const usablePlayListUrl = YoutubePlaylistParse(addPlaylistVideosInputRef.current.value)
                                if (!usablePlayListUrl) return toast.error("no playlist id seen")

                                toast.success("getting playlist items")
                                loadingPlayListSet(true)

                                try {
                                    const playlistitems = await getPlaylist(usablePlayListUrl)

                                    toast.success("success")
                                    loadingPlayListSet(false)

                                    addVideosToList(playlistitems, "multi")
                                    addVideoInputRef.current.value = ""
                                } catch (error) {
                                    console.log(`$error searching playlist`, error);
                                }
                            }}>Add</button>
                        </div>
                    </div>

                    {/* add video */}
                    <div>
                        <div style={{ display: "grid", justifyItems: "flex-end" }}>
                            {addVideoMenuExpanded ? (
                                <button className={styles.settingsButton} onClick={() => { addVideoMenuExpandedSet(false) }}>close</button>
                                // <svg onClick={() => { addVideoMenuExpandedSet(false) }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>
                            ) : (
                                <button className={styles.settingsButton} onClick={() => { addVideoMenuExpandedSet(true) }}>Add Video</button>
                            )}
                        </div>

                        <div style={{ display: !addVideoMenuExpanded ? "none" : "grid", gridTemplateColumns: "1fr auto" }}>
                            <input ref={addVideoInputRef} type="text" placeholder="Youtube Url..." />
                            <button className={styles.settingsButton} onClick={() => {
                                if (addVideoInputRef.current.value === "") return
                                addVideosToList([addVideoInputRef.current.value])

                                addVideoInputRef.current.value = ""
                            }}>Add</button>
                        </div>
                    </div>

                    {/* bottom button settings */}
                    <div style={{ display: "flex" }}>
                        <button className={styles.settingsButton} onClick={movePrevVideo}>prev</button>

                        <button className={styles.settingsButton} onClick={moveNextVideo}>next</button>

                        <button className={styles.settingsButton} onClick={handleBoxRotating}>{boxStats.rotateCanStart ? "pause" : "rotate"}</button>

                        <button className={styles.settingsButton} onClick={changeBoxSize}>{boxLarge ? "shrink" : "expand"}</button>

                        <button className={styles.settingsButton} onClick={() => { rotateBox("ArrowUp") }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" /></svg>
                        </button>

                        <button className={styles.settingsButton} onClick={() => { rotateBox("ArrowDown") }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" /></svg>
                        </button>

                        <button className={styles.settingsButton} onClick={() => { rotateBox("ArrowLeft") }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>
                        </button>

                        <button className={styles.settingsButton} onClick={() => { rotateBox("ArrowRight") }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" /></svg>
                        </button>
                    </div>
                </div>

                <div style={{ flex: "0 0 auto", marginTop: "auto" }}
                    onClick={() => {
                        menuExpandedSet(prev => !prev)
                    }}>
                    <svg style={{ flex: "0 0 auto" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M200 32H56C42.7 32 32 42.7 32 56V200c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79L73 295c-6.9-6.9-17.2-8.9-26.2-5.2S32 302.3 32 312V456c0 13.3 10.7 24 24 24H200c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H456c13.3 0 24-10.7 24-24V312c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2V56c0-13.3-10.7-24-24-24H312c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S209.7 32 200 32z"
                    /></svg>
                </div>
            </div>
        </div>
    );
}


const DisplayVid = ({ id, muted = true }: { id: string, muted?: boolean }) => {

    return (
        <iframe
            className={styles.mainVidIframe}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
            }}
            src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1${muted ? "&mute=1" : undefined}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    )
}
