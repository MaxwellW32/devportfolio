export type madeWebsite = {
    image: string,
    title: string,
    link: string,
}

export const madeWebsites: madeWebsite[] = [
    {
        image: require(`@/public/finishedWebsites/studyhall.png`).default.src,
        title: "StudyHall",
        link: "https://studyhallweb.vercel.app",
    },
    {
        image: require(`@/public/finishedWebsites/pinesdental.png`).default.src,
        title: "Pines Dental",
        link: "https://pinesdental.vercel.app",
    },
    {
        image: require(`@/public/finishedWebsites/Anthurium.jpg`).default.src,
        title: "Anthurium Dev Agency",
        link: "https://anthuriumdev.vercel.app/",
    },
]
