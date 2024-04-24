export type generalInfo = {
    roomWidth: number;
    amountOfLanes: number;
    maxShellsSpawnable: number,
}

export type tankDirections = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right"

export type tankStats = {
    id: string,
    width: number;
    x: number;
    y: number;
    speed: number,
    directionFacing: tankDirections,
    enemyTank: boolean,
    element: HTMLDivElement
}

export type shellStats = {
    id: string,
    firedFrom: string,
    width: number;
    x: number;
    y: number;
    xDirection: number
    yDirection: number,
    speed: number,
    el: HTMLDivElement,
    wallsHit: number
}

export type keysCurrentlyPressed = {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
    blast: boolean,
}