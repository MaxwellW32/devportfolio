"use client"
import Image from 'next/image'
import React, { useState, useRef, useMemo } from 'react'
import { toast } from 'react-hot-toast'


export type oreoProduct = {
    name: string,
    image: string,
    backgroundColor: string
    ingredients: string,
    secondImage: string,
}

export default function OreoProductSlider({ oreoProducts }: { oreoProducts: oreoProduct[] }) {
    const [currentIndex, currentIndexSet] = useState(0)
    const [animationTime, animationTimeSet] = useState(1000)
    const [moveNextPressed, moveNextPressedSet] = useState(false)
    const [movePrevPressed, movePrevPressedSet] = useState(false)

    const canStartAnimation = useMemo(() => {
        return moveNextPressed || movePrevPressed
    }, [moveNextPressed, movePrevPressed])


    //pressing next does an animation - then the switch
    const moveNextDelay = useRef<NodeJS.Timeout>()
    const moveNext = () => {
        currentIndexSet(prevIndex => {
            let newIndex = prevIndex + 1

            if (newIndex > oreoProducts.length - 1) {
                newIndex = 0
            }

            return newIndex
        })

        moveNextPressedSet(false)
    }

    const movePrev = () => {
        currentIndexSet(prevIndex => {
            let newIndex = prevIndex - 1

            if (newIndex < 0) {
                newIndex = oreoProducts.length - 1
            }

            return newIndex
        })
    }

    return (
        <div style={{ display: "flex", flexWrap: "wrap", margin: "0 auto", position: "relative", overflow: "hidden" }}>
            <div style={{ flex: "1.5 1 300px", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ aspectRatio: "1/1", borderRadius: "50%", position: "relative", overflow: "hidden", alignSelf: "center", translate: "-25% 0", width: "130%" }}>
                    <Image alt={`secondImg`} src={oreoProducts[currentIndex].secondImage} fill={true} style={{ objectFit: "cover" }} />
                </div>

                <div>
                    <h3 style={{ fontSize: "2rem" }}>{oreoProducts[currentIndex].name}</h3>

                    <p style={{}}>{oreoProducts[currentIndex].ingredients}</p>
                </div>
            </div>

            <div style={{ flex: "1 1 300px", zIndex: 1, overflow: "", position: "relative" }}>
                {/* prev */}
                <Image alt={`img`} src={oreoProducts[currentIndex - 1 < 0 ? oreoProducts.length - 1 : currentIndex - 1].image} width={1200} height={1200} style={{ objectFit: "contain", translate: moveNextPressed ? "-100% 0" : "", transition: moveNextPressed ? `translate ${animationTime}ms, scale ${animationTime}ms` : "", position: "absolute", top: 0, left: 0, transform: "translateX(-100%)", filter: "drop-shadow(15px 15px 15px rgba(0,0,0,0.5))", scale: 1 }} />

                <div style={{ objectFit: "contain", translate: moveNextPressed ? "-100% 0" : "", transition: moveNextPressed ? `translate ${animationTime}ms, scale ${animationTime}ms` : "", scale: 1, position: "relative", zIndex: 9 }}>
                    <Image alt={`img`} src={oreoProducts[currentIndex].image} width={1200} height={1200} style={{ filter: "drop-shadow(15px 15px 15px rgba(0,0,0,0.5))", }} />
                </div>

                {/* next */}
                <Image alt={`img`} src={oreoProducts[currentIndex + 1 > oreoProducts.length - 1 ? 0 : currentIndex + 1].image} width={1200} height={1200} style={{ objectFit: "contain", translate: moveNextPressed ? "-100% 0" : "", transition: moveNextPressed ? `translate ${animationTime}ms, scale ${animationTime}ms` : "", position: "absolute", top: 0, left: 0, transform: "translateX(100%)", filter: "drop-shadow(15px 15px 15px rgba(0,0,0,0.5))", scale: 1 }} />
            </div>

            <div style={{ flex: ".1 1 auto", display: "grid", alignItems: "center", justifyItems: "center" }}>
                <div style={{ userSelect: "none", position: "relative", zIndex: 1 }}
                    onClick={() => {
                        //check for multi tap
                        if (moveNextDelay.current) {
                            clearTimeout(moveNextDelay.current)
                            moveNextDelay.current = undefined
                            moveNext()
                            return
                        }

                        //start animation
                        moveNextPressedSet(true)

                        moveNextDelay.current = setTimeout(() => {
                            moveNext()
                            moveNextDelay.current = undefined
                        }, animationTime)
                    }}>
                    <svg style={{ fill: "#000", aspectRatio: "1/1", width: "5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                </div>
            </div>

            <div style={{ backgroundColor: oreoProducts[currentIndex].backgroundColor, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}></div>

            {/* circle */}
            <div style={{ borderRadius: "50%", backgroundColor: oreoProducts[currentIndex + 1 > oreoProducts.length - 1 ? 0 : currentIndex + 1].backgroundColor, position: "absolute", top: "50%", left: "50%", translate: "-50% -50%", aspectRatio: "1/1", width: "100%", scale: canStartAnimation ? 1 : 0, transition: `scale ${animationTime}ms`, opacity: canStartAnimation ? 1 : 0 }}></div>
        </div>
    )
}
