import type { StaticImageData } from "next/image"

import starsCover from "@/public/landingPageExamples/stars/stars.png"
import graphCover from "@/public/landingPageExamples/companyGraph/cover.png"
import jewelleryCover from "@/public/landingPageExamples/fashionStore/artsectionbg1.png"
import pizzaCover from "@/public/landingPageExamples/pizzaSlice/cheesepizza.png"
import appleCover from "@/public/landingPageExamples/appleStore/storebg.webp"
import spaceCover from "@/public/landingPageExamples/space/bg.jpg"

/* ============================================================================
   LANDING-PAGE STUDIES
   Rendered by /lab and /lab/pages.

   TO ADD ONE: import its cover at the top, append an entry below, and create
   app/lab/pages/<slug>/page.tsx.
   ========================================================================= */

export type landingPageExample = {
  image: StaticImageData
  title: string
  link: string
  category: string
}

export const landingPageExamples: landingPageExample[] = [
  {
    image: starsCover,
    category: "Suave",
    title: "Stars",
    link: "/lab/pages/stars",
  },
  {
    image: graphCover,
    category: "Corporate/Data",
    title: "Graph",
    link: "/lab/pages/graph",
  },
  {
    image: jewelleryCover,
    category: "Jewellery/Fashion",
    title: "Prized Jewel",
    link: "/lab/pages/jewellery",
  },
  {
    image: pizzaCover,
    category: "Food/Delicacy",
    title: "Pizza Slice",
    link: "/lab/pages/pizza",
  },
  {
    image: appleCover,
    category: "Tech/Devices",
    title: "Apple Store",
    link: "/lab/pages/appleStore",
  },
  {
    image: spaceCover,
    category: "Space/Art",
    title: "Space",
    link: "/lab/pages/space",
  },
]
