"use server"
import ytdl from "ytdl-core";

export default async function GetVideoInfo(url: string) {

    const info = await ytdl.getInfo(url)

    const videoFormats = ytdl.filterFormats(info.formats, "audioandvideo")
    const formhighestFormat = ytdl.chooseFormat(videoFormats, { quality: "highestvideo" })


    return { info, formhighestFormat }
}
