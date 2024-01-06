import CompanyGraph from "@/components/homePageExamples/companyGraph/CompanyGraph"
import FashionStore from "@/components/homePageExamples/fashionStore/FashionStore"
import Oreo from "@/components/homePageExamples/oreo/Oreo"
import PizzaSlice from "@/components/homePageExamples/pizzaSlice/PizzaSlice"
import Stars from "@/components/homePageExamples/stars/Stars"

export type homePage = {
    image: string,
    category: string,
    title: string,
    slug: string,
    seenComponent: JSX.Element,
}

export const homePageExamples: homePage[] = [
    {
        image: require(`@/public/homePageExamples/stars/mountain.png`).default.src,
        category: "Suave",
        title: "Stars",
        slug: "stars",
        seenComponent: <Stars />
    }, {
        image: require(`@/public/homePageExamples/companyGraph/cover.png`).default.src,
        category: "Corporate/Data",
        title: "The Graph",
        slug: "theGraph",
        seenComponent: <CompanyGraph />
    },
    {
        image: require("@/public/homePageExamples/fashionStore/artsectionbg1.png").default.src,
        category: "Jewellery/Fashion",
        title: "Prized Jewel",
        slug: "prizedJewel",
        seenComponent: <FashionStore />
    },
    {
        image: require(`@/public/homePageExamples/pizzaSlice/cheesepizza.png`).default.src,
        category: "Food/Delicacy",
        title: "Pizza Slice",
        slug: "pizzaSlice",
        seenComponent: <PizzaSlice />
    },
    {
        image: require(`@/public/homePageExamples/oreo/oreoslideimage.png`).default.src,
        category: "Food",
        title: "Oreo",
        slug: "Oreo",
        seenComponent: <Oreo />
    }
]