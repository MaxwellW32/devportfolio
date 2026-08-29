"use client"
import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css"
import { getSpecifcVideoInfo, getVideos } from "./getVideos";
import ShowVideoRandPlayer from "./ShowVideoRandPlayer";
import { toast } from "react-hot-toast";

const myBackupVideoIds = ["ktBMxkLUIwY", "tcaw6lzYt1Q", "rULyu_wFWGU", "ZD6C498MB4U", "ytQ5CYE1VZw", "iI34LYmJ1Fs", "h3EJICKwITw", "3JBKp0YbSEc", "r_0JjYUe5jo", "oihY8GiXXgQ", "nceqQyqIa5o", "1RdrlReJmTY", "RRl_C73vFtQ",];

async function getRandomWord() {
    try {
        const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=5&maxLength=15&limit=1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`)
        const data = await response.json()

        return data[0].word

    } catch (error) {
        console.log(`$error with random word`);
        console.log(error);

        return null
    }
}

export default function VideoGenerator() {
    const [search, searchSet] = useState("");
    const [connectedToYoutube, connectedToYoutubeSet] = useState<"searching" | "true" | "false">("searching");

    const [watchNextVideoList, watchNextVideoListSet] = useState<string[]>([])
    const [currentIndex, currentIndexSet] = useState(0)
    const videoSearchLoop = useRef<NodeJS.Timeout>()


    const moveNext = () => {
        currentIndexSet(prev => {
            let newIndex = prev + 1

            if (newIndex > watchNextVideoList.length - 1) {
                newIndex = watchNextVideoList.length - 1
            }

            return newIndex
        })
    }

    const movePrev = () => {
        currentIndexSet(prev => {
            let newIndex = prev - 1

            if (newIndex < 0) {
                newIndex = 0
            }

            return newIndex
        })
    }

    //Start off
    useEffect(() => {
        const startOff = async () => {
            const randomWord = await getRandomWord() ?? "cats"
            searchSet(randomWord)
            searchForVideos(randomWord);
        }

        startOff()
    }, []);


    function searchForVideos(passedSearchString?: string, options: "append" | "replace" = "append") {
        if (videoSearchLoop.current) clearTimeout(videoSearchLoop.current)

        videoSearchLoop.current = setTimeout(async () => {
            const localSearchString = passedSearchString ? passedSearchString : search

            try {
                const allVideosInfo = await getVideos(5, localSearchString)
                const allVidIds = allVideosInfo.map((eachObj: any) => eachObj.id.videoId);

                if (options === "append") {
                    watchNextVideoListSet(prevList => [...prevList, ...allVidIds]);
                } else if (options === "replace") {
                    watchNextVideoListSet(allVidIds);
                    currentIndexSet(0)
                }

                getRelated(allVidIds[Math.floor(Math.random() * allVidIds.length)])

                connectedToYoutubeSet("true");
                toast.success("got videos!")

            } catch (error) {
                console.log(`$error with video search`, error);
                connectedToYoutubeSet("false");
                getRelated(myBackupVideoIds[Math.floor(Math.random() * myBackupVideoIds.length)])
            }
        }, 1000);
    }

    async function getRelated(url: string) {
        try {
            const moreVideoInfo = await getSpecifcVideoInfo(url)

            const moreVideosList = moreVideoInfo.related_videos.filter(eachVid => eachVid.id).map(eachVid => eachVid.id!)
            watchNextVideoListSet(prev => [...prev, ...moreVideosList])

        } catch (error) {
            console.log(`$error occured with get related videos`, error);
        }
    }

    async function infiniteScroll() {
        toast.success("loading infinite scroll")

        if (connectedToYoutube === "true") {
            const word = await getRandomWord()

            if (!word) return toast.error("couldn't get a random word")

            searchSet(word)
            searchForVideos(word)
        } else if (connectedToYoutube === "false") {
            const smallList = watchNextVideoList.slice(-5, -1)
            getRelated(smallList[Math.floor(Math.random() * smallList.length - 1)])
        }
    }

    return (
        <main className={styles.mainVidPlayer} style={{ gridTemplateRows: connectedToYoutube === "true" ? "auto 1fr" : "" }}>
            {connectedToYoutube === "searching" && (
                <p>Loading up random videos</p>
            )}

            {/* not connected */}
            {connectedToYoutube === "false" && (
                <>
                    <p style={{ fontStyle: "italic" }}>Couldn&apos;t fetch Videos, using related video generator</p>

                    <button style={{ justifySelf: "flex-start" }} onClick={() => { searchForVideos() }}>
                        Try search Again
                    </button>

                    {watchNextVideoList.length === 0 && <p>Loading</p>}
                    {watchNextVideoList[currentIndex] !== undefined && (
                        <div className={styles.vidCont}>
                            <ShowVideoRandPlayer
                                url={watchNextVideoList[currentIndex]}
                            />
                        </div>
                    )}
                </>
            )}

            {/* connected main area */}
            {connectedToYoutube === "true" && (
                <>
                    <div className={styles.vidSearchCont}>
                        <input
                            placeholder="search any topic: "
                            id="vidSearchInput"
                            className={styles.vidSearchInput}
                            type="text"
                            value={search}
                            onChange={(e) => { searchSet(e.target.value); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchForVideos(undefined, "replace");
                                }
                            }}
                        />

                        <button onClick={() => { searchForVideos(undefined, "replace") }}>
                            Search
                        </button>

                        <button
                            onClick={async () => {
                                const word = await getRandomWord()

                                if (!word) {
                                    toast.error("couldn't get a random word")
                                    return
                                }

                                searchSet(word)
                                searchForVideos(word)
                            }}>
                            More Random Videos
                        </button>
                    </div>

                    <div className={styles.vidCont}>
                        <ShowVideoRandPlayer
                            url={watchNextVideoList[currentIndex]}
                        />
                    </div>
                </>
            )}

            {connectedToYoutube !== "searching" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: "center" }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") {
                            movePrev();
                        }

                        if (e.key === "ArrowRight") {
                            moveNext();

                            const offsetFromEnd = 5
                            if (watchNextVideoList.length > offsetFromEnd && currentIndex === (watchNextVideoList.length - offsetFromEnd)) {
                                infiniteScroll()
                            }
                        }
                    }}>
                    {currentIndex !== 0 && <button onClick={movePrev}>prev video</button>}
                    {currentIndex !== watchNextVideoList.length - 1 && <button onClick={() => {
                        moveNext()

                        const offsetFromEnd = 5
                        if (watchNextVideoList.length > offsetFromEnd && currentIndex === (watchNextVideoList.length - offsetFromEnd)) {
                            infiniteScroll()
                        }
                    }}>next random video</button>}
                </div>
            )}
        </main>
    );
}