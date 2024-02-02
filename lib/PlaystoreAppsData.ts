export type app = {
    image: string,
    title: string,
    link: string,
    categories: string
}

export const apps: app[] = [
    {
        image: require(`@/public/appsMade/storytime.webp`),
        title: "Story Time",
        link: "https://play.google.com/store/apps/details?id=com.spidermax32.webstorytime",
        categories: "Story Book/Gaming"
    },
    {
        image: require(`@/public/appsMade/storyslice.webp`),
        title: "Story Slice",
        link: "https://play.google.com/store/apps/details?id=com.spidermax32.StorySlice",
        categories: "Video Management/Sharing"
    },

]

