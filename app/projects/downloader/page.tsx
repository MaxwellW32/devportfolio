"use client"

import { useEffect, useState } from "react";
import styles from "./page.module.css"
import Image from "next/image"
import YoutubeUrlParse from "@/useful/YoutubeUrlParse";
import { toast } from "react-hot-toast";
import ytdl from "ytdl-core";
import ShowYTVideo from "@/components/showYTVideo/ShowYTVideo";

export default function Page() {
    const [url, urlSet] = useState("")
    const [downloadLink, downloadLinkSet] = useState<any>()
    const [videoInfo, videoInfoSet] = useState<{
        details: ytdl.MoreVideoDetails;
        related: ytdl.relatedVideo[];
    }>()

    const [showingNav, showingNavSet] = useState(false)

    const [downloadNextList, downloadNextListSet] = useState<string[]>([])

    const handleDownload = async (passedUrl?: string) => {
        toast.success("searching")

        const localUrl = passedUrl ? passedUrl : url

        if (localUrl === "") return

        const response = await fetch(`/api/projects/downloader?url=${localUrl}`)
        const data = await response.json()

        console.log(`$response`, response);
        console.log(`$data`, data);

        downloadLinkSet(data.format.url)
        videoInfoSet(data.customInfo)

        toast.success("Received Video From Server")
    }

    return (
        <div className={`${styles.animateIn} ${styles.mainDiv}`} style={{ position: "fixed", height: "100svh", width: "100vw", top: 0, left: 0, zIndex: showingNav ? 100 : 1000, display: "grid", gridTemplateRows: "2fr 1fr", gridTemplateColumns: "1fr", justifyItems: "center", gap: "1rem", textAlign: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gridTemplateRows: "1fr", gap: '1rem', justifySelf: "stretch", justifyContent: "center", overflow: "auto", paddingTop: "2rem" }}>
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", overflow: "auto" }}>
                    {videoInfo && (
                        <>
                            <p>Related Videos</p>

                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: ".7fr", justifyContent: "center", alignContent: "flex-start", overflow: "auto" }}>
                                {videoInfo.related.map((eachVideo, eachVideoIndex) => {
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
                    {videoInfo && <p>{videoInfo.details.title}</p>}

                    {downloadLink === undefined ? (
                        <ShowYTVideo url={url} />
                    ) : (
                        <video style={{ width: "100%", height: "100%" }} src={downloadLink} controls></video>
                    )}

                    {videoInfo && (
                        <>
                            <p>{videoInfo.details.author.name}</p>
                            {videoInfo.details.likes && <p>{"<3"} {videoInfo.details.likes}</p>}
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

                <button style={{ justifySelf: "center" }} onClick={() => handleDownload()}>Download</button>
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