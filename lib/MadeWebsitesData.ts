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
        image: require(`@/public/finishedWebsites/Squaremax.jpg`).default.src,
        title: "Squaremax",
        link: "https://squaremaxtech.com",
    },
    {
        image: require(`@/public/finishedWebsites/paramount.webp`).default.src,
        title: "Paramount Couriers",
        link: "http://paramount-couriers.com",
    },
    {
        image: require(`@/public/finishedWebsites/angelrose.svg`).default.src,
        title: "Angel Rose Adult Care",
        link: "https://angelroseadultcare.com",
    },
]