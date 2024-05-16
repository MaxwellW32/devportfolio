export type funItem = {
    image: string,
    title: string,
    slug: string,
}

export const funItems: funItem[] = [
    {
        image: require(`@/public/fun/chess.jpg`).default.src,
        title: "Chess",
        slug: "chess",
    },
    {
        image: require(`@/public/fun/fibonacci.jpg`).default.src,
        title: "Fibonacci",
        slug: "fibonacci",
    },
    {
        image: require(`@/public/fun/luckranked.jpg`).default.src,
        title: "Luck Ranked",
        slug: "luckRanked",
    },
    {
        image: require(`@/public/fun/musicbounce.jpg`).default.src,
        title: "Music Bounce",
        slug: "musicBounce",
    },
    {
        image: require(`@/public/fun/musicsquare.jpg`).default.src,
        title: "Music Square",
        slug: "musicSquare",
    },
    {
        image: require(`@/public/fun/tank.jpg`).default.src,
        title: "Tank",
        slug: "tank",
    },
    {
        image: require(`@/public/fun/three.jpg`).default.src,
        title: "Three JS",
        slug: "three",
    }
]

export const getFunItemsForNav = () => {
    return funItems.map(eachFunItem => {
        return {
            title: eachFunItem.title,
            link: `/fun/${eachFunItem.slug}`
        }
    })
}