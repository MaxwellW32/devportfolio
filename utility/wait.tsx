export default async function wait(time: number = 1300) {
    return await new Promise((resolve) => setTimeout(resolve, time))
} 