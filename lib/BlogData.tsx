import type React from "react"
import type { StaticImageData } from "next/image"

import blog1 from "@/public/blog1image.webp"
import blog2 from "@/public/blog2image.webp"
import blog3 from "@/public/blog3image.webp"
import blog4 from "@/public/blog4image.webp"
import blog5 from "@/public/blog5image.webp"
export type blog = {
    image: StaticImageData,
    category: string,
    datePosted: Date,
    title: string,
    messages?: React.JSX.Element[],
    slug: string
}

export const blogs: blog[] = [
    {
        image: blog1,
        category: "html",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with HTML.",
        slug: "html-practice",
        messages: [
            <div key={0}>
                <p>I&apos;ve picked up a lot of tips and tricks in HTML, and the structure of a page made sense to me quickly. The head holds information about the page, and the body holds everything you see.</p>
                <p style={{ marginTop: "1rem" }}>The best habit I picked up early was using semantic tags. If something is a heading, a nav or a button, I use the tag that was made for it. Screen readers and search engines both depend on those tags to understand a page. Once the tags and the nesting are right, everything I build on top is easier.</p>
            </div>
        ]
    },
    {
        image: blog2,
        category: "css",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with CSS.",
        slug: "css-practice",
        messages: [
            <div key={0}>
                <p>CSS is where a plain HTML page starts to look like something. My tip for anyone starting out is to learn selectors properly first, because everything else depends on being able to target the right element.</p>
                <p style={{ marginTop: "1rem" }}>After that, learn the box model, then flexbox and grid. Understanding those changed how I approach a layout. And experiment. Try different colours, fonts and transitions, because that&apos;s how you find your own style.</p>
            </div>
        ]
    },
    {
        image: blog3,
        category: "javascript",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with JavaScript.",
        slug: "javascript-practice",
        messages: [
            <div key={0}>
                <p>JavaScript is where my pages started doing things. If you&apos;re just starting, get comfortable with variables, data types, loops and conditions before anything else. Bigger scripts are made of those same pieces.</p>
                <p style={{ marginTop: "1rem" }}>Next, learn functions and async code, which is how a page handles user input and talks to a server. And don&apos;t avoid debugging. Working out why something broke is one of the most useful skills you can have.</p>
            </div>
        ]
    },
    {
        image: blog4,
        category: "next",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with Next.js.",
        slug: "next-practice",
        messages: [
            <div key={0}>
                <p>Next.js changed how I build web apps. It&apos;s built on top of React and adds routing and server rendering. Pages can be built ahead of time or rendered on the server, so they arrive with their content already in them. That makes them load faster, and search engines can read them properly.</p>
                <p style={{ marginTop: "1rem" }}>It also splits the code up automatically, so each page only loads what it needs. Once I understood dynamic routes and how to fetch data on the server, I could build apps that run on real data. It&apos;s now the main tool I build with.</p>
            </div>
        ]
    },
    {
        image: blog5,
        category: "react",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with React.",
        slug: "react-practice",
        messages: [
            <div key={0}>
                <p>React taught me to build an interface out of components. You make a small piece once, like a button or a card, and reuse it wherever you need it. React works out what changed and only updates that part of the page, so it stays fast even in a big app.</p>
                <p style={{ marginTop: "1rem" }}>The most important thing to learn is state. That means knowing where your data lives, when to lift it up to a parent, and how to use hooks. Data in React flows one way, from parent to child, which makes a bug much easier to track down. There&apos;s also a big community around it, so there&apos;s usually a library or an answer for whatever you&apos;re stuck on.</p>
            </div>
        ]
    },
]