export type project = {
    image: string,
    title: string,
    link: string,
    categories: string
}

export const projects: project[] = [
    {
        image: "https://images.pexels.com/photos/7886853/pexels-photo-7886853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Video downloader",
        link: "/projects/downloader",
        categories: "React/Server Actions/Node.js"
    },
    {
        image: "https://images.pexels.com/photos/949592/pexels-photo-949592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Random Video Player",
        link: "/projects/randomPlayer",
        categories: "React/API Integration/Node.js"
    },
    {
        image: "https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "parallax",
        link: "/projects/parallax",
        categories: "CSS Perspective"
    },
    {
        image: "https://images.pexels.com/photos/1370293/pexels-photo-1370293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Dictionary",
        link: "/projects/dictionary",
        categories: "Lottie Animation/Node.js/API Integration"
    },
    {
        image: "https://images.pexels.com/photos/929280/pexels-photo-929280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Perspective",
        link: "/projects/perspective",
        categories: "React/CSS Perspective"
    },
    {
        image: "https://images.pexels.com/photos/6927334/pexels-photo-6927334.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Decoy Calculator",
        link: "/projects/calculator",
        categories: "React/JS Encryption/Javascript"
    },
    {
        image: "https://images.pexels.com/photos/268351/pexels-photo-268351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "To Do App",
        link: "/projects/toDo",
        categories: "React/Local Storage Api"
    },
    {
        image: "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        title: "Eccomerce",
        link: "/projects/ecommerce",
        categories: "React/Drizzle/Global State Management"
    },
    {
        image: "https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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