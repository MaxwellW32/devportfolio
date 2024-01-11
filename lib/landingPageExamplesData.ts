

export type landingPageExample = {
    image: string,
    title: string,
    link: string,
    category: string,
}

export const landingPageExamples: landingPageExample[] = [
    {
        image: require(`@/public/landingPageExamples/stars/mountain.png`).default.src,
        category: "Suave",
        title: "Stars",
        link: "/landingPageExamples/stars",
    }, {
        image: require(`@/public/landingPageExamples/companyGraph/cover.png`).default.src,
        category: "Corporate/Data",
        title: "Graph",
        link: "/landingPageExamples/graph",
    },
    {
        image: require("@/public/landingPageExamples/fashionStore/artsectionbg1.png").default.src,
        category: "Jewellery/Fashion",
        title: "Prized Jewel",
        link: "/landingPageExamples/jewellery",
    },
    {
        image: require(`@/public/landingPageExamples/pizzaSlice/cheesepizza.png`).default.src,
        category: "Food/Delicacy",
        title: "Pizza Slice",
        link: "/landingPageExamples/pizza",
    }
]