"use client"
import styles from "./page.module.css"

import React, { useEffect, useMemo, useState, useRef } from "react";

export default function Page() {
    const [fillIn, setFillIn] = useState(1);
    const [boxWidth, setBoxWidth] = useState("30vh");
    const [boxLarge, boxLargeSet] = useState(false);

    const [boxHeight, setBoxHeight] = useState<string>();

    const [perspectiveAmt, setPerspectiveAmt] = useState("500px");

    const [currentVidIndex, setCurrentVidIndex] = useState(0);

    const allVideoList = [
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
    ];

    const handleNextClick = () => {                             // 2  10
        setCurrentVidIndex(prevVidIndex => (prevVidIndex + 4) % allVideoList.length
        );
    };

    const handlePrevClick = () => {
        setCurrentVidIndex(prevVidIndex => (prevVidIndex - 4 + allVideoList.length) % allVideoList.length);
    };

    function changeBoxSize() {
        boxLargeSet(prev => {
            if (prev) {
                setFillIn(1);
                setBoxWidth("30vh");
                setPerspectiveAmt("500px");
            } else {
                setBoxWidth("80vh");
                setPerspectiveAmt("200px");
            }


            return !prev
        })
    }

    useEffect(() => {
        const numbers = boxWidth.match(/\d+/g);
        const result = Number(numbers!.join(""));

        const aspectRatio = 16 / 9;
        const height = result / aspectRatio;

        setBoxHeight(`${height}px`);
    }, [boxWidth]);


    const [boxStats, setBoxStats] = useState({
        boxRotationX: 0,
        boxRotationY: 0,
        rotateCanStart: false,
    });

    //rotate box on auto click
    useEffect(() => {

        if (!boxStats.rotateCanStart) return

        const interval = setInterval(() => {
            setBoxStats(prevStats => {
                return { ...prevStats, boxRotationY: prevStats.boxRotationY += 36 }
            })

        }, 1000)

        return () => clearInterval(interval)
    }, [boxStats.rotateCanStart])


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            let xRotationAmount = 10

            if (event.key.toLowerCase() === "l") {
                handleNextClick();
            } else if (event.key.toLowerCase() === "k") {
                setBoxStats(prevStats => {
                    return { ...prevStats, rotateCanStart: !prevStats.rotateCanStart }
                })
            } else if (event.key.toLowerCase() === "j") {
                handlePrevClick();
            } else if (event.code === "Space") {
                console.log(`$hit change box`);
                changeBoxSize();
            } else if (event.key === "ArrowUp") {
                setBoxStats((prevStats) => {
                    return { ...prevStats, boxRotationX: (prevStats.boxRotationX += xRotationAmount) };
                });
            } else if (event.key === "ArrowDown") {
                setBoxStats((prevStats) => {
                    return { ...prevStats, boxRotationX: (prevStats.boxRotationX -= xRotationAmount) };
                });
            } else if (event.key === "ArrowLeft") {
                setBoxStats((prevStats) => {
                    return { ...prevStats, boxRotationY: (prevStats.boxRotationY -= xRotationAmount) };
                });
            } else if (event.key === "ArrowRight") {
                setBoxStats((prevStats) => {
                    return { ...prevStats, boxRotationY: (prevStats.boxRotationY += xRotationAmount) };
                });
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div style={{ perspective: perspectiveAmt }} className={styles.persContainer}>
            <div className={styles.persBox}
                style={{
                    "--fillIn": fillIn,
                    "--boxWidth": boxWidth,
                    "--boxHeight": boxHeight,
                    "--canPlayBottomAnim": boxStats.rotateCanStart ? "running" : "paused",
                    "--scaleXVal": boxLarge ? -1 : 1,
                    transform: `rotateX(${boxStats.boxRotationX}deg) rotateY(${boxStats.boxRotationY}deg)`,
                } as React.CSSProperties}
            >
                <div className={`${styles.side} ${styles.persFront}`}>
                    <DisplayVid id={allVideoList[(currentVidIndex) % allVideoList.length]} muted={false} />
                </div>

                <div className={`${styles.side} ${styles.persBack}`}>
                    <DisplayVid id={allVideoList[(currentVidIndex + 1) % allVideoList.length]} />
                </div>
                <div className={`${styles.side} ${styles.persLeft}`}>
                    <DisplayVid id={allVideoList[(currentVidIndex + 2) % allVideoList.length]} />
                </div>
                <div
                    className={`${styles.side} ${styles.persRight}`}>
                    <DisplayVid id={allVideoList[(currentVidIndex + 3) % allVideoList.length]} />
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
