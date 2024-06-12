export type musicBoxControls = {
    id: string
    beatSwitch: boolean,
    boxStats: boxStats,
    threshold: number,
    hitThreshold: boolean,
}

export type boxStats = {
    horizantalBounce: number
    boxWidth: number,
    xPosition: number,
    yPosition: number,
    xDirection: number,
    yDirection: number,
    speed: number,
    hue: number
}

