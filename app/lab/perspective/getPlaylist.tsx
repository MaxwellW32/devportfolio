"use server"
import axios from "axios";

const apiKey = process.env.YT_KEY;

export async function getPlaylist(playlistUrl: string) {
    const playlistResponse = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
        params: {
            part: 'contentDetails',
            playlistId: playlistUrl,
            key: apiKey,
            maxResults: 50,
        },
    });

    const videoIds = playlistResponse.data.items.map((item: any) => item.contentDetails.videoId);
    return videoIds
}
