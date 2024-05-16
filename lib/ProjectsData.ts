export type project = {
    image: string,
    title: string,
    link: string,
    categories: string
}

export const projects: project[] = [
    {
        image: require(`@/public/projects/vidDownlaoder.webp`).default.src,
        title: "Video downloader",
        link: "/projects/downloader",
        categories: "React/Server Actions/Node.js"
    },
    {
        image: require(`@/public/projects/fireworks.jpeg`).default.src,
        title: "Random Video Player",
        link: "/projects/randomPlayer",
        categories: "React/API Integration/Node.js"
    },
    {
        image: require(`@/public/projects/parallaxphoto.jpeg`).default.src,
        title: "parallax",
        link: "/projects/parallax",
        categories: "CSS Perspective"
    },
    {
        image: require(`@/public/projects/dictionaryImage.jpeg`).default.src,
        title: "Dictionary",
        link: "/projects/dictionary",
        categories: "Lottie Animation/Node.js/API Integration"
    },
    {
        image: require(`@/public/projects/perspective.webp`).default.src,
        title: "Perspective",
        link: "/projects/perspective",
        categories: "React/CSS Perspective"
    },
    {
        image: require(`@/public/projects/calculator.jpeg`).default.src,
        title: "Decoy Calculator",
        link: "/projects/calculator",
        categories: "React/JS Encryption/Javascript"
    },
    {
        image: require(`@/public/projects/note.webp`).default.src,
        title: "To Do App",
        link: "/projects/toDo",
        categories: "React/Local Storage Api"
    },
    {
        image: require(`@/public/projects/ecommercephoto.webp`).default.src,
        title: "Eccomerce",
        link: "/projects/ecommerce",
        categories: "React/Drizzle/Global State Management"
    },
    {
        image: require(`@/public/projects/weather.webp`).default.src,
        title: "Weather",
        link: "",
        categories: "React/Node.js/API Integration"
    },
]

export const getProjectsForNav = () => {
    return projects.filter(eachProj => eachProj.link).map(eachProject => {
        return {
            title: eachProject.title,
            link: eachProject.link
        }
    })
}