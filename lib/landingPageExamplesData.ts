

export type landingPageExample = {
    image: string,
    title: string,
    link: string,
    category: string,
}

export const landingPageExamples: landingPageExample[] = [
    {
        image: require(`@/public/landingPageExamples/stars/stars.png`).default.src,
        category: "Suave",
        title: "Stars",
        link: "/lab/pages/stars",
    }, {
        image: require(`@/public/landingPageExamples/companyGraph/cover.png`).default.src,
        category: "Corporate/Data",
        title: "Graph",
        link: "/lab/pages/graph",
    },
    {
        image: require("@/public/landingPageExamples/fashionStore/artsectionbg1.png").default.src,
        category: "Jewellery/Fashion",
        title: "Prized Jewel",
        link: "/lab/pages/jewellery",
    },
    {
        image: require(`@/public/landingPageExamples/pizzaSlice/cheesepizza.png`).default.src,
        category: "Food/Delicacy",
        title: "Pizza Slice",
        link: "/lab/pages/pizza",
    },
    {
        image: require(`@/public/landingPageExamples/appleStore/storebg.webp`).default.src,
        category: "Tech/Devices",
        title: "Apple Store",
        link: "/lab/pages/appleStore",
    },
    {
        image: require(`@/public/landingPageExamples/space/bg.jpg`).default.src,
        category: "Space/Art",
        title: "Space",
        link: "/lab/pages/space",
    }
]