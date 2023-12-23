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

    return (
        <div className={`${styles.animateIn} ${styles.mainDiv}`} style={{ position: "fixed", height: "100svh", width: "100vw", top: 0, left: 0, zIndex: showingNav ? 100 : 1000, display: "grid", gridTemplateRows: "2fr 1fr", gridTemplateColumns: "1fr", justifyItems: "center", gap: "1rem", textAlign: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gridAutoRows: "minmax(300px, 1fr)", gap: '1rem', justifySelf: "stretch", justifyContent: "center", overflow: "auto", paddingTop: "2rem" }}>
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", overflow: "auto" }}>
                    {info && (
                        <>
                            <p>Related Videos</p>

                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: ".7fr", justifyContent: "center", alignContent: "flex-start", overflow: "auto" }}>
                                {info.related_videos.map((eachVideo, eachVideoIndex) => {
                                    if (!eachVideo.id) return null

                                    return (
                                        <div key={eachVideoIndex} style={{ backgroundColor: "orange", paddingRight: "2rem" }} onClick={() => {
                                            toast.success("adding to Download Next")
                                            downloadNextListSet(prevList => {
                                                const newList = [...prevList, eachVideo.id!]
                                                return newList
                                            })
                                        }}>
                                            <ShowYTVideo url={eachVideo.id} />
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: "grid", gap: "1rem", overflow: "auto" }}>
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

                            <p>Other Formats</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", }}>
                                {info.formats.map((eachFormat, eachFormatIndex) => {
                                    return (
                                        <DisplayFormat key={eachFormatIndex} format={eachFormat} videoDetails={info.videoDetails} />
                                    )
                                })}
                            </div>

                        </>
                    )}

                </div>

                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", overflow: "auto" }}>
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

            <div style={{ display: "grid", width: "min(800px, 80%)", gap: "1rem", alignContent: "flex-start" }}>
                <input value={url} onChange={(e) => { urlSet(e.target.value) }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleDownload()
                        }
                    }} type="text" placeholder="Enter Url..." />

                <button style={{ justifySelf: "center" }} onClick={() => handleDownload()}>Search</button>
            </div>

            <Image priority={true} alt="background" src={require("@/public/projects/downloader/bg.png")} fill={true} style={{ zIndex: -1, objectFit: "cover", }} />

            <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "fixed", width: "1.5rem", bottom: 0, right: 0, margin: "1rem" }}
                onClick={() => {
                    showingNavSet(prev => !prev)
                }}
                viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
        </div>
    )
}



function DisplayFormat({ format, videoDetails }: { format: ytdl.videoFormat, videoDetails: ytdl.MoreVideoDetails }) {

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", backgroundColor: "#fff", color: "#000", padding: "1rem", borderRadius: "1rem" }}>
            <p>Audio: {format.hasAudio.toString()}</p>
            <p>Video: {format.hasVideo.toString()}</p>
            <p>Quality: {format.qualityLabel}</p>
            <p>{format.container}</p>
            <Link href={format.url} target="_blank" download={`${videoDetails.title}.${format.container}`}>Download</Link>
        </div>
    )
}