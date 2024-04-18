export type bounceBoxStats = {
    boxWidth: number,
    xPosition: number,
    yPosition: number,
    xDirection: number,
    yDirection: number,
    speed: number,
    hue: number
}

export type borderType = "top" | "bottom" | "left" | "right"
export type borderPosition = {
    time: number,
    xPosition: number,
    yPosition: number,
    type: borderType,
    width: number,
    height: number,
}

