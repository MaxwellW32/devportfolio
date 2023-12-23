"use client"

import { useEffect, useState } from "react";
import styles from "./page.module.css"
import Image from "next/image"
import YoutubeUrlParse from "@/useful/YoutubeUrlParse";
import { toast } from "react-hot-toast";
import ytdl from "ytdl-core";

export default function Page() {
    const [url, urlSet] = useState("")
    const [downloadLink, downloadLinkSet] = useState<any>()
    const [videoInfo, videoInfoSet] = useState<{
        details: ytdl.MoreVideoDetails;
        related: ytdl.relatedVideo[];
    }>()


    const handleDownload = async () => {
        toast.success("searching")
        if (url === "") return

        const response = await fetch(`/api/projects/downloader?url=${url}`)
        const data = await response.json()

        console.log(`$response`, response);
        console.log(`$data`, data);

        downloadLinkSet(data.format.url)
        videoInfoSet(data.customInfo)

        toast.success("got back")
    }

    return (
        <div className={styles.animateIn} style={{ position: "fixed", height: "100svh", top: 0, left: 0, zIndex: 1000, width: "100%", display: "grid", gridTemplateRows: "60vh 1fr", justifyItems: "center", gridTemplateColumns: "1fr", textAlign: "center" }}>
            <Image priority={true} alt="background" src={require("@/public/projects/downloader/bg.png")} fill={true} style={{ zIndex: -1, objectFit: "cover", }} />

            <div>
                <h1>Downloader</h1>

                {downloadLink === undefined ? (
                    <iframe
                        style={{
                            width: "100%",
                            aspectRatio: "16/9",
                        }}

                        src={`https://www.youtube.com/embed/${YoutubeUrlParse(url)}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video style={{ width: "100%", aspectRatio: "16/9", maxWidth: "80vw", maxHeight: "100%" }} src={downloadLink} controls></video>
                )}
            </div>

            <div style={{ display: "grid", width: "min(800px, 80%)", gap: "1rem", alignContent: "flex-start" }}>
                <input value={url} onChange={(e) => { urlSet(e.target.value) }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleDownload()
                        }
                    }} type="text" placeholder="Enter Url..." />

                <button style={{ justifySelf: "center" }} onClick={handleDownload}>Download</button>
            </div>
        </div>
    )
}