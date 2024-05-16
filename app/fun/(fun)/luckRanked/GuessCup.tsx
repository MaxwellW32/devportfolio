"use client"
import { deepClone } from '@/useful/deepClone'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export default function GuessCup() {

    //three cups
    //one has a ball
    //guess if its correct

    //the submit functiona actually creates a ball at process time

    type cupType = {
        title: string,
        id: string,
        color: string,
        position: [number, number],
        transitionSpeed: number
    }

    const [cups, cupsSet] = useState<cupType[]>(deepClone(makeCup(3)))
    const [points, pointsSet] = useState(0)
    const [totalGuesses, totalGuessesSet] = useState(0)
    const [resultAnswer, resultAnswerSet] = useState<"right" | "wrong">()
    const [showingMoreOptions, showingMoreOptionsSet] = useState(false)
    const [contWidth, contWidthSet] = useState<number | null>(null)
    const [contHeight, contHeightSet] = useState<number>(0)

    const cupContRef = useRef<HTMLDivElement>(null!)

    //50 max
    //there are 10 columns
    //there are 5 rows
    //use math to divide by percentage

    const correctPercentage = useMemo(() => {
        const newNum = ((points / totalGuesses) * 100)

        return isNaN(newNum) ? 0 : newNum.toFixed()
    }, [points, totalGuesses])

    function makeCup(amtToAdd: number, startingFrom = 0) {
        const newCups: cupType[] = []

        for (let index = startingFrom + 0; index < amtToAdd; index++) {

            const currentColumn = index % 10 //y
            const currentColRow = Math.floor(index / 10) //x

            const newCup: cupType = {
                title: `${index + 1}`,
                id: uuidv4(),
                color: makeRandomColor(),
                position: [currentColumn, currentColRow] as [number, number],
                transitionSpeed: Math.floor(Math.random() * 501) + 1000 //1000 +
            }

            newCups.push(newCup)
        }

        return newCups
    }

    function makeRandomColor() {
        let randomNum1 = Math.floor(Math.random() * 256)
        let randomNum2 = Math.floor(Math.random() * 256)
        let randomNum3 = Math.floor(Math.random() * 256)

        return `${randomNum1},${randomNum2},${randomNum3}`
    }

    function chooseRandomIndexFromArray(givenArr: any[]) {
        return Math.floor(Math.random() * givenArr.length)
    }

    function shuffleCups<T>(array: T[]) {
        let currentIndex = array.length, randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    function chooseACup(seenCupIndex: number, seenCups: cupType[]) {
        //choose random index
        const winningCupIndex = chooseRandomIndexFromArray(seenCups)

        if (seenCupIndex === winningCupIndex) {
            resultAnswerSet("right")

            if (seenCups.length < 50) { //increase cups upto 50
                cupsSet(prevCups => {
                    const newCups = [...prevCups, ...deepClone(makeCup(1, prevCups.length))]

                    return newCups
                })
            }

            pointsSet(prev => prev + 1)
        } else {
            resultAnswerSet("wrong")
        }

        //shuffle cups array
        cupsSet(prevCups => {
            const arrayOfPositions = deepClone(prevCups.map(eachCup => eachCup.position))
            const randomizedPositions = deepClone(shuffleCups(arrayOfPositions))

            const newCups = prevCups.map((eachCup, eachCupIndex) => {
                eachCup.position = randomizedPositions[eachCupIndex]
                return eachCup
            })

            return newCups
        })

        totalGuessesSet(prev => prev + 1)
    }


    useEffect(() => {
        contWidthSet(cupContRef.current.offsetWidth)
        contHeightSet(cupContRef.current.offsetHeight)
    }, [])

    return (
        <div style={{ height: "100svh", display: "grid", gridTemplateRows: "auto 1fr" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", padding: "1rem", gap: "1rem" }}>
                <p>Points: {points}</p>

                <p style={{ textAlign: "center" }}>Guess the cup</p>

                <p>{resultAnswer}</p>

                <p style={{ textAlign: "center" }}>Total Guesses {totalGuesses} correct {correctPercentage}%</p>
            </div>

            <div ref={cupContRef} style={{ backgroundColor: "beige", alignContent: "flex-start", position: "relative", overflow: "auto" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "red", paddingBlock: "1rem", paddingInline: "1rem", translate: !showingMoreOptions ? "0 -100%" : "", transition: "translate 600ms" }}>
                    <p>cool</p>
                </div>

                <div style={{ position: "absolute", top: 0, right: 0, margin: "1rem" }} onClick={() => { showingMoreOptionsSet(prev => !prev) }}>
                    <svg style={{ fill: "#000", rotate: showingMoreOptions ? "180deg" : "", transition: "rotate 600ms" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM135 241c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 87-87c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 345c-9.4 9.4-24.6 9.4-33.9 0L135 241z" /></svg>
                </div>

                {/* focus here */}
                {contWidth && cups.map((eachCup, eachCupIndex) => {
                    return (
                        <div key={eachCup.id} style={{ backgroundColor: `rgb(${eachCup.color})`, textAlign: "center", padding: "1rem", cursor: "pointer", userSelect: "none", position: "absolute", width: `${contWidth / 10}px`, height: `${contHeight / 5}px`, top: 0, left: 0, translate: `${eachCup.position[0] * 100}% ${eachCup.position[1] * 100}%`, transition: `translate ${eachCup.transitionSpeed}ms` }} onClick={() => { chooseACup(eachCupIndex, cups) }}>
                            <p style={{ fontWeight: "bold", }}>{eachCup.title}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
