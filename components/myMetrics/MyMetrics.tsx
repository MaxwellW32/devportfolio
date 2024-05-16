"use client"

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export default function MyMetrics({ svg, amount, amountAdd, text, animateTime = 2500, stepper = 1 }: { svg: JSX.Element, amount: number, amountAdd: string, text: string, animateTime?: number, stepper?: number }) {
    const { ref, inView } = useInView()

    const [animateAmount, animateAmountSet] = useState(0)

    const [timeLoop, timeLoopSet] = useState(() => {
        return animateTime / amount
    })

    const looper = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (inView) {
            if (looper.current) clearInterval(looper.current)

            looper.current = setInterval(() => {
                animateAmountSet(prev => {
                    let newAmount = prev + stepper

                    if (newAmount >= amount) {
                        clearInterval(looper.current)
                        return amount
                    }

                    return newAmount
                })
            }, timeLoop)
        } else {
            // animateAmountSet(0)
        }
    }, [inView])

    return (
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto auto", columnGap: "2rem", rowGap: "1rem" }}>
            <div style={{ border: "1px solid #fff", borderRadius: ".9rem", display: "grid", alignItems: "center", justifyItems: "center", aspectRatio: "1/1" }} >
                {svg}
            </div>

            <p className='extraLargeText'>{animateAmount}{amountAdd}</p>

            <p style={{ opacity: ".8", gridColumn: "2/-1" }}>{text}</p>
        </div>
    )
}
