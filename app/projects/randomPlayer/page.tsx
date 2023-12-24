"use client"
import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css"
import { getSpecifcVideoInfo, getVideos } from "./getVideos";
import ShowVideoRandPlayer from "./ShowVideoRandPlayer";
import { toast } from "react-hot-toast";
import ytdl from "ytdl-core";


const myBackupVideoIds = ["ktBMxkLUIwY", "tcaw6lzYt1Q", "rULyu_wFWGU", "ZD6C498MB4U", "ytQ5CYE1VZw", "iI34LYmJ1Fs", "h3EJICKwITw", "3JBKp0YbSEc", "r_0JjYUe5jo", "oihY8GiXXgQ", "nceqQyqIa5o", "1RdrlReJmTY", "RRl_C73vFtQ",];

async function getRandomWord() {
    try {
        const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=5&maxLength=15&limit=1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`)
        const data = await response.json()

        return data[0].word

    } catch (error) {
        console.log(`$error`);
        console.log(error);

        return null
    }
}

export default function VideoGenerator() {
    const [searchString, searchStringSet] = useState("");
    const [connectedToYoutube, connectedToYoutubeSet] = useState<"searching" | "true" | "false">("searching");
    const [connectedToWordSearch, connectedToWordSearchSet] = useState(false);

    const [watchNextVideoList, watchNextVideoListSet] = useState<string[]>([])
    const [currentIndex, currentIndexSet] = useState(0)


    const next = () => {
        currentIndexSet(prev => {
            let newIndex = prev + 1

            const videoBufferLimit = 10
            if (watchNextVideoList.length > videoBufferLimit && newIndex === watchNextVideoList.length - videoBufferLimit) {
                infiniteScroll()
            }

            if (newIndex > watchNextVideoList.length - 1) {
                newIndex = watchNextVideoList.length - 1
            }

            return newIndex
        })
    }

    const prev = () => {
        currentIndexSet(prev => {
            let newIndex = prev - 1

            if (newIndex < 0) {
                newIndex = 0
            }

            return newIndex
        })
    }

    //getRandom Word Start
    useEffect(() => {
        const startOff = async () => {
            // const randomWord = "cats"
            const randomWord = await getRandomWord() ?? "cats"
            searchStringSet(randomWord)
            connectedToWordSearchSet(true);
        }

        startOff()
    }, []);

    //program start fetch
    useEffect(() => {
        if (connectedToWordSearch) {
            searchForVideos();
        }
    }, [connectedToWordSearch]);

    //load backups videos
    useEffect(() => {
        if (connectedToYoutube === "false") {
            watchNextVideoListSet(prevIds => [...myBackupVideoIds, ...prevIds]);
        }
    }, [connectedToYoutube]);

    const videoSearchLoop = useRef<NodeJS.Timeout>()
    function searchForVideos(passedSearchString?: string) {
        if (videoSearchLoop.current) clearTimeout(videoSearchLoop.current)

        videoSearchLoop.current = setTimeout(async () => {

            toast.success("searching")
            const localSearchString = passedSearchString ? passedSearchString : searchString

            try {
                const allVideosInfo = await getVideos(5, localSearchString)
                // console.log(`$allVideosInfo`, allVideosInfo);

                const allVidIds = allVideosInfo.map((eachObj: any) => eachObj.id.videoId);
                // const allVidIds = myBackupVideoIds

                connectedToYoutubeSet("true");
                watchNextVideoListSet(prevList => [...prevList, ...allVidIds]);

                const randomUrl = allVidIds[Math.floor(Math.random() * allVidIds.length)]
                getRelated(randomUrl)
                toast.success("got videos!")

            } catch (error) {
                console.log(`$error occurred`);
                console.log(error);
                connectedToYoutubeSet("false");
            }
        }, 1000);

    }

    async function getRelated(url: string) {
        try {
            const moreVideoInfo = await getSpecifcVideoInfo(url)
            // console.log(`$moreVideoInfo`, moreVideoInfo);

            const moreVideosList = moreVideoInfo.related_videos.filter(eachVid => eachVid.id).map(eachVid => eachVid.id!)
            watchNextVideoListSet(prev => [...prev, ...moreVideosList])

        } catch (error) {
            console.log(`$moreVideoInfo error`);
            console.log(error);
        }
    }

    async function infiniteScroll() {
        const word = await getRandomWord()

        if (!word) {
            toast.error("couldn't get a random word")
            return
        }

        searchStringSet(word)
        searchForVideos(word)
    }

    const checkForCopies = (seenArr: any[]) => {
        const duplicateElementsSeen: any[] = []

        seenArr.forEach(eachItem => {
            let seenCount = 0

            seenArr.forEach(eachItemCheck => {
                if (eachItem === eachItemCheck) {
                    seenCount++
                }
            })

            if (seenCount > 1) {
                duplicateElementsSeen.push(eachItem)
            }
        })

        if (duplicateElementsSeen.length > 0) {
            console.log(`duplicateElementsSeen`, duplicateElementsSeen);
        } else {
            console.log(`no duplicate elements`);
        }
    }

    return (
        <main className={styles.mainVidPlayer}>
            {connectedToYoutube === "searching" && (
                <p>Loading up random videos</p>
            )}

            {/* heading */}
            {connectedToYoutube === "false" && (
                <div style={{ fontStyle: "italic" }}>
                    <h2>Couldn&apos;t fetch Videos, using backup videos</h2>

                    <button onClick={() => { searchForVideos() }}>
                        Try search Again
                    </button>
                </div>
            )}

            {/* main area */}
            {connectedToYoutube === "true" && (
                <>
                    <div className={styles.vidSearchCont}>
                        <input
                            placeholder="search any topic: "
                            id="vidSearchInput"
                            className={styles.vidSearchInput}
                            type="text"
                            value={searchString}
                            onChange={(e) => { searchStringSet(e.target.value); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchForVideos();
                                }
                            }}
                        />

                        <button onClick={() => { searchForVideos() }}>
                            Search
                        </button>

                        <button
                            onClick={async () => {
                                const word = await getRandomWord()

                                if (!word) {
                                    toast.error("couldn't get a random word")
                                    return
                                }

                                searchStringSet(word)
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

                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: "center" }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowLeft") {
                                prev();
                            }

                            if (e.key === "ArrowRight") {
                                next();
                            }
                        }}>
                        {currentIndex !== 0 && <button onClick={prev}>prev video</button>}
                        {currentIndex !== watchNextVideoList.length - 1 && <button onClick={next}>next random video</button>}
                    </div>

                </>
            )}
        </main>
    );
}