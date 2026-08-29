"use server"

import axios from "axios";
import ytdl from "ytdl-core";

const apiKey = process.env.YT_KEY;

export async function getVideos(searchNumber: number, searchString: string) {
    const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
            params: {
                part: 'snippet',
                maxResults: searchNumber,
                q: searchString,
                type: 'video',
                key: apiKey,
            },
        }
    );

    const allVidsInfo = response.data.items
    return JSON.parse(JSON.stringify(allVidsInfo))
}


export async function getSpecifcVideoInfo(id: string) {
    const specificVidInfo = await ytdl.getInfo(id)

    return JSON.parse(JSON.stringify(specificVidInfo)) as ytdl.videoInfo
}





