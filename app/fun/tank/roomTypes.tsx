export type generalInfo = {
    roomWidth: number;
    amountOfLanes: number;
}

export type tankDirections = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right"

export type tankStats = {
    id: string,
    width: number;
    x: number;
    y: number;
    speed: number,
    directionFacing: tankDirections
}

export type shellStats = {
    firedFrom: string,
    width: number;
    x: number;
    y: number;
    xDirection: number
    yDirection: number,
    el: HTMLDivElement
}

export type keysCurrentlyPressed = {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
    blast: boolean,
}