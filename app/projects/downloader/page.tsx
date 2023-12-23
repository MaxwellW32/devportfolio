"use client"

import { useEffect, useState } from "react";
import styles from "./page.module.css"
import Image from "next/image"
import YoutubeUrlParse from "@/useful/YoutubeUrlParse";
import { toast } from "react-hot-toast";
import type ytdl from "ytdl-core";
import ShowYTVideo from "@/components/showYTVideo/ShowYTVideo";
import GetVideoInfo from "./GetVideoInfo";
import Link from "next/link";

export default function Page() {
    const [url, urlSet] = useState("")
    const [info, infoSet] = useState<ytdl.videoInfo>()
    const [highestFormat, highestFormatSet] = useState<ytdl.videoFormat>()

    const [showingNav, showingNavSet] = useState(false)
    const [navProperlyHidden, startedSet] = useState(false)

    const [viewerPick, viewerPickSet] = useState<"both" | "video only" | "audio only">("both")

    const [downloadNextList, downloadNextListSet] = useState<string[]>([])

    const handleDownload = async (passedUrl?: string) => {
        toast.success("searching")
        const localUrl = passedUrl ? passedUrl : url
        if (localUrl === "") return

        const seenInfo = await GetVideoInfo(localUrl)

        infoSet(seenInfo.info)
        highestFormatSet(seenInfo.formhighestFormat)

        toast.success("Received Video From Server")

        console.log(`$info`, seenInfo);
    }

    //hide Navs
    useEffect(() => {
        const nav = document.querySelector("nav")!
        const footer = document.querySelector("footer")!

        nav.classList.add("clear")
        footer.classList.add("clear")
        startedSet(true)

        return () => {
            nav.classList.remove("clear")
            footer.classList.remove("clear")
        }
    }, [])
    return (
        <div className={`blackFadeIn ${styles.mainDiv}`} style={{ "--animationPlaystate": navProperlyHidden ? "running" : "paused", textAlign: "center", maxHeight: "100svh", display: "grid", gridTemplateRows: "2fr 1fr", gap: "1rem" } as React.CSSProperties}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(350px, 100%), 1fr))", gap: '1rem', justifyContent: "center", overflow: "auto", padding: "2rem" }}>
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr" }}>
                    {info && (
                        <>
                            <p>Related Videos</p>

                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", justifyContent: "center", alignContent: "flex-start" }}>
                                {info.related_videos.map((eachVideo, eachVideoIndex) => {
                                    if (!eachVideo.id) return null

                                    return (
                                        <div key={eachVideoIndex} style={{ display: "flex", alignItems: "center", gap: "1rem" }} onClick={() => {
                                            toast.success("adding to Download Next")
                                            downloadNextListSet(prevList => {
                                                const newList = [...prevList, eachVideo.id!]
                                                return newList
                                            })
                                        }}>
                                            <ShowYTVideo url={eachVideo.id} />

                                            <div className={styles.addBttn} style={{ backgroundColor: "orange", padding: ".5rem", }}>
                                                <svg style={{ width: "2rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: "grid", gap: "1rem", alignContent: "flex-start" }}>
                    {/* middle */}
                    {info === undefined && (
                        <ShowYTVideo url={url} />
                    )}

                    {info && (
                        <>
                            <p>{info.videoDetails.title}</p>

                            {highestFormat && (
                                <video src={highestFormat.url} style={{ aspectRatio: "16/9", width: "100%" }} controls></video>
                            )}

                            <p>{info.videoDetails.author.name}</p>

                            {info.videoDetails.likes && <p>{"<3"} {info.videoDetails.likes}</p>}

                            <div className={styles.formatPickCont}>
                                <div className={styles.bttnPickCont}>
                                    <button style={{ backgroundColor: viewerPick === "both" ? "orange" : "" }} onClick={() => viewerPickSet("both")}>both</button>
                                    <button style={{ backgroundColor: viewerPick === "video only" ? "orange" : "" }} onClick={() => viewerPickSet("video only")}>video only</button>
                                    <button style={{ backgroundColor: viewerPick === "audio only" ? "orange" : "" }} onClick={() => viewerPickSet("audio only")}>audio only</button>
                                </div>

                                <div className={styles.pickSection} style={{ display: viewerPick !== "both" ? "none" : "" }}>
                                    {info.formats.filter(eachFormat => eachFormat.hasAudio && eachFormat.hasVideo).map((eachFormat, eachFormatIndex) => {
                                        return (
                                            <DisplayFormat key={eachFormatIndex} format={eachFormat} videoDetails={info.videoDetails} pick={viewerPick} />
                                        )
                                    })}
                                </div>

                                <div className={styles.pickSection} style={{ display: viewerPick !== "video only" ? "none" : "" }}>
                                    {info.formats.filter(eachFormat => eachFormat.hasVideo && !eachFormat.hasAudio).map((eachFormat, eachFormatIndex) => {
                                        return (
                                            <DisplayFormat key={eachFormatIndex} format={eachFormat} videoDetails={info.videoDetails} pick={viewerPick} />
                                        )
                                    })}
                                </div>

                                <div className={styles.pickSection} style={{ display: viewerPick !== "audio only" ? "none" : "" }}>
                                    {info.formats.filter(eachFormat => eachFormat.hasAudio && !eachFormat.hasVideo).map((eachFormat, eachFormatIndex) => {
                                        return (
                                            <DisplayFormat key={eachFormatIndex} format={eachFormat} videoDetails={info.videoDetails} pick={viewerPick} />
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                </div>

                <div style={{ display: "grid", gridTemplateRows: "auto 1fr" }}>
                    {downloadNextList.length > 0 && (
                        <>
                            <p>Download Next</p>

                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: ".7fr", justifyContent: "center", overflow: "auto", alignContent: "flex-start" }}>
                                {downloadNextList.map((eachId, eachVideoIndex) => {
                                    if (!eachId) return null

                                    return (
                                        <div key={eachVideoIndex} style={{ backgroundColor: "orange", paddingLeft: "2rem" }}
                                            onClick={() => {
                                                urlSet(eachId)

                                                downloadNextListSet(prevList => {
                                                    const newList = prevList.filter(eachStr => eachStr !== eachId)
                                                    return newList
                                                })

                                                handleDownload(eachId)
                                            }}>
                                            <ShowYTVideo url={eachId} />
                                        </div>)
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", width: "min(800px, 80%)", gap: "1rem", alignContent: "flex-start", justifySelf: "center" }}>
                <input value={url} onChange={(e) => { urlSet(e.target.value) }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleDownload()
                        }
                    }} type="text" placeholder="Enter Url..." />

                <button style={{ justifySelf: "center" }} onClick={() => handleDownload()}>Search</button>
            </div>


            <Image priority={true} alt="background" src={require("@/public/projects/downloader/bg.png")} width={1920} height={1080} style={{ width: "100vw", height: "100svh", position: "absolute", top: 0, left: 0, zIndex: -1, objectFit: "cover", }} />

            <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "fixed", width: "1.5rem", bottom: 0, right: 0, margin: "1rem" }}
                onClick={() => {
                    const newShowingNav = !showingNav
                    showingNavSet(prev => newShowingNav)

                    const nav = document.querySelector("nav")!

                    if (!showingNav) {
                        nav.classList.remove("clear")
                    } else {
                        nav.classList.add("clear")
                    }

                }}
                viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
        </div>
    )
}



function DisplayFormat({ format, videoDetails, pick }: { format: ytdl.videoFormat, videoDetails: ytdl.MoreVideoDetails, pick: "both" | "video only" | "audio only" }) {

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", backgroundColor: "#fff", color: "#000", padding: "1rem", borderRadius: "1rem" }}>
            {pick !== "audio only" && <p>Quality: {format.qualityLabel}</p>}

            <p>{format.container}</p>

            {pick !== "video only" && <p>Audio: {format.audioCodec}</p>}

            <Link style={{ marginLeft: "auto" }} href={format.url} target="_blank" download={`${videoDetails.title}.${format.container}`}>
                <button>Download</button>
            </Link>
        </div>
    )
}