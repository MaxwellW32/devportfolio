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
        title: "Getting started with html.",
        slug: "html-practice",
        messages: [
            <div key={0}>
                <p>I&apos;ve learned so so much in this amzaing language, so many tips and tricks!</p>
                <p style={{ marginTop: "1rem" }}>As a beginner, I quickly grasped the fundamental structure that HTML provides to a webpage. The &apos;head&apos; for meta-information, the &apos;body&apos; for content – it all started to make sense. Embracing semantic HTML not only improved my site&apos;s accessibility but also enhanced my understanding of how search engines interpret content. Remembering to use proper tags and nesting became second nature, laying a strong foundation for my coding endeavors.</p>
            </div>
        ]
    },
    {
        image: blog2,
        category: "css",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with css.",
        slug: "css-practice",
        messages: [
            <div key={0}>
                <p>As I delved into the realm of styling, CSS emerged as the artistic palette for my web creations. Cascading Style Sheets turned static HTML into visually appealing, dynamic web pages. My tip for fellow beginners: grasp the power of selectors early on. Understanding the box model and the importance of layout techniques like flexbox and grid significantly transformed the way I approached design. Don&apos;t be afraid to experiment with colors, typography, and transitions – it&apos;s in these experiments that you&apos;ll uncover your design style and elevate your websites from functional to visually stunning.</p>
            </div>
        ]
    },
    {
        image: blog3,
        category: "javascript",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with javascript.",
        slug: "javascript-practice",
        messages: [
            <div key={0}>
                <p>The introduction of JavaScript marked a pivotal moment in my coding journey. Suddenly, my static pages gained interactivity and dynamic functionalities. My advice for beginners diving into JavaScript is to focus on understanding variables, data types, and control structures. These form the building blocks for more complex scripts. Asynchronous JavaScript opened doors to handling user input and server communication seamlessly. Embrace the power of functions, and don&apos;t shy away from debugging – it&apos;s a skill that will prove invaluable as you navigate the intricate world of scripting.</p>
            </div>
        ]
    },
    {
        image: blog4,
        category: "next",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with next.",
        slug: "next-practice",
        messages: [
            <div key={0}>
                <p>As I progressed in my web development journey, I discovered the incredible capabilities of Next.js, and it revolutionized the way I approached building web applications. Next.js, built on top of React, seamlessly integrates server-side rendering and routing, providing a performant and delightful user experience. One of the most valuable lessons I learned as a beginner in Next.js is the power of static site generation (SSG) and server-side rendering (SSR). These features not only optimize page load times but also enhance SEO by delivering pre-rendered content to search engines. Additionally, the automatic code splitting in Next.js ensures efficient and optimized bundles for a faster and more responsive web app. Embracing the dynamic routing capabilities and understanding the data fetching methods, such as getStaticProps and getServerSideProps, has been instrumental in creating dynamic and data-driven applications. Next.js has truly become an indispensable tool in my toolkit, allowing me to build modern and efficient web experiences with ease.</p>
            </div>
        ]
    },
    {
        image: blog5,
        category: "react",
        datePosted: new Date("2022-12-24"),
        title: "Getting started with react.",
        slug: "react-practice",
        messages: [
            <div key={0}>
                <p>React has been the heartbeat of my web development journey, introducing me to the world of declarative and component-based UI design. As a beginner, the concept of breaking down user interfaces into reusable components was a game-changer. The virtual DOM and React&apos;s efficient rendering process ensured optimal performance, even for complex applications. One of the key takeaways for me has been the importance of state management. Understanding how to lift state up, use hooks, and manage the application&apos;s state flow has been pivotal in creating interactive and responsive user interfaces. React&apos;s unidirectional data flow philosophy brought clarity to how data moves through components, making it easier to reason about and debug. Additionally, the vibrant React community and the abundance of open-source libraries have provided me with a wealth of resources and best practices. As I continue to explore React, I find its flexibility and scalability to be essential for crafting modern, dynamic, and maintainable web applications.</p>
            </div>
        ]
    },
]