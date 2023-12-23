

import ytdl from "ytdl-core";

import { NextResponse } from "next/server";

export async function GET(request: Request, response: Response) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ data: "No URL" });
    }

    const info = await ytdl.getInfo(url)
    const videoFormats = ytdl.filterFormats(info.formats, "audioandvideo")
    const format = ytdl.chooseFormat(videoFormats, { quality: "highestvideo" })

    const fileName = `${info.videoDetails.title}.${format.container}`
    const responseHeaders = { "Content-Disposition": `attachment; filename="${fileName}"` }

    const customInfo = {
        details: info.videoDetails,
        related: info.related_videos
    }

    return NextResponse.json({
        format, responseHeaders, fileName, customInfo
    })
}