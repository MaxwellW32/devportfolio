"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from "./styles.module.css"
import { Roboto_Mono } from 'next/font/google'

const roboto_mono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-roboto-mono',
    display: 'swap',
})

const weekDayColumnNames = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17"]//x axis
const eachPosValue = [12, 20, 35, 50, 45, 40, 30, 23, 23, 45, 67, 80, 88, 75, 60, 50, 40] //y axis - x axis layout
const colors = {
    secondaryColor: "#f96e23",
    tirtiaryColor: "#046766"
}

export default function Page() {


    return (
        <div className={`${styles.cubesMainDiv} ${roboto_mono.variable}`} style={{ backgroundColor: "#1f212e", overflow: "hidden", position: "relative", zIndex: "1" }}>
            <section style={{ overflow: "hidden" }}>
                <div style={{ margin: "1rem", display: "grid" }}>
                    <h1>Driving Success Through Data</h1>

                    <p className={styles.shortText}>Visualize Your Progress with Powerful Analytics</p>

                    <div style={{ paddingTop: "1rem" }}>
                        <button style={{ backgroundColor: "#223f48" }}>Get Started</button>
                        <button style={{ backgroundColor: "#546b6e" }}>Learn More</button>
                        <button style={{ backgroundColor: "#1c6f70" }}>Shop</button>
                    </div>
                </div>

                <Graph columnNames={weekDayColumnNames} positionValuesSeen={eachPosValue} />

                <Cube />
            </section>

            <section style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", paddingBottom: "5rem" }}>
                <div style={{ flex: "1 0 150px" }} className={styles.threeContainer}>
                    <div >
                        <h3>Real-time Insights</h3>

                        <div style={{ borderBottom: `1px solid ${colors.secondaryColor}`, width: "20%", marginTop: ".1rem" }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: "1fr 1.5fr", marginTop: "1rem", gap: "1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "column" }}>
                            <p>Track Your Progress</p>

                            {/* circle */}
                            <div style={{ backgroundImage: "linear-gradient(#148689, #ba501d)", margin: "auto 0 auto 0", width: "100%", borderRadius: "50%", aspectRatio: "1/1", display: "grid", justifyItems: "center", alignItems: "center", alignContent: "center", gap: "1rem" }}>
                                <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M256 64H384v64H256V64zM240 0c-26.5 0-48 21.5-48 48v96c0 26.5 21.5 48 48 48h48v32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96v32H80c-26.5 0-48 21.5-48 48v96c0 26.5 21.5 48 48 48H240c26.5 0 48-21.5 48-48V368c0-26.5-21.5-48-48-48H192V288H448v32H400c-26.5 0-48 21.5-48 48v96c0 26.5 21.5 48 48 48H560c26.5 0 48-21.5 48-48V368c0-26.5-21.5-48-48-48H512V288h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V192h48c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H240zM96 448V384H224v64H96zm320-64H544v64H416V384z" /></svg>
                                <p>Progress</p>
                            </div>
                        </div>

                        <div>
                            <div className={styles.headerCont}>
                                <h4>Data</h4>
                                <div></div>
                                <p >Real Time Data</p>
                            </div>

                            <div className={styles.headerCont}>
                                <h4>Visualization</h4>
                                <div></div>
                                <p>Performace At A Glance header</p>
                            </div>

                            <div className={styles.headerCont}>
                                <h4>Performance</h4>
                                <div></div>
                                <p>Key Control</p>
                            </div>

                            <p className='makeBold'>Our intuitive analytics platform provides you with real-time data visualization</p>

                            <p style={{ paddingTop: "1rem" }}>Monitor key performance metrics at a glance</p>
                        </div>
                    </div>
                </div>

                <div style={{ flex: ".7 0 150px" }} className={styles.threeContainer} >
                    <div style={{ display: "grid" }}>
                        <svg style={{ justifySelf: "flex-end", fill: `${colors.secondaryColor}` }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M502.285 159.704l-234-156c-7.987-4.915-16.511-4.96-24.571 0l-234 156C3.714 163.703 0 170.847 0 177.989v155.999c0 7.143 3.714 14.286 9.715 18.286l234 156.022c7.987 4.915 16.511 4.96 24.571 0l234-156.022c6-3.999 9.715-11.143 9.715-18.286V177.989c-.001-7.142-3.715-14.286-9.716-18.285zM278 63.131l172.286 114.858-76.857 51.429L278 165.703V63.131zm-44 0v102.572l-95.429 63.715-76.857-51.429L234 63.131zM44 219.132l55.143 36.857L44 292.846v-73.714zm190 229.715L61.714 333.989l76.857-51.429L234 346.275v102.572zm22-140.858l-77.715-52 77.715-52 77.715 52-77.715 52zm22 140.858V346.275l95.429-63.715 76.857 51.429L278 448.847zm190-156.001l-55.143-36.857L468 219.132v73.714z" /></svg>

                        <h3>About Us</h3>

                        <p style={{ color: colors.secondaryColor }}>We are driven by a singular mission</p>
                    </div>

                    <p style={{ marginBlock: "1rem", color: colors.tirtiaryColor }}>Empower businesses.</p>
                    <p style={{ marginBlock: ".5rem" }}>Revolutionize data</p>
                    <p style={{ marginBlock: ".5rem", color: colors.tirtiaryColor }}>We equip businesses with the tools needed.</p>
                    <p style={{ marginBlock: ".5rem", color: colors.tirtiaryColor }}>Enable informed decisions.</p>
                    <p style={{ marginBlock: ".5rem", color: colors.tirtiaryColor }}>Ensure any business can thrive trough innovative analytics.</p>

                    <div style={{ marginTop: '2rem', borderTop: `1px dotted`, borderImage: `linear-gradient(to right, ${colors.tirtiaryColor}, ${colors.secondaryColor})`, borderImageSlice: 1 }}>
                        <p style={{ marginTop: '1rem' }} className='makeBold'>Excellence</p>
                        <p>We strive for excellence</p>
                    </div>

                    <div style={{ marginBlock: "1rem" }}>
                        <p className='makeBold'>Integrity</p>
                        <p>Unwavering transparency is our #1</p>
                    </div>
                </div >

                <div style={{ flex: "1 0 150px" }} className={styles.threeContainer} >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                        <h3>Our History</h3>

                        <svg style={{ fill: `${colors.tirtiaryColor}` }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M160 96a96 96 0 1 1 192 0A96 96 0 1 1 160 96zm80 152V512l-48.4-24.2c-20.9-10.4-43.5-17-66.8-19.3l-96-9.6C12.5 457.2 0 443.5 0 427V224c0-17.7 14.3-32 32-32H62.3c63.6 0 125.6 19.6 177.7 56zm32 264V248c52.1-36.4 114.1-56 177.7-56H480c17.7 0 32 14.3 32 32V427c0 16.4-12.5 30.2-28.8 31.8l-96 9.6c-23.2 2.3-45.9 8.9-66.8 19.3L272 512z" /></svg>

                        <div style={{ borderBottom: `1px solid  ${colors.secondaryColor}`, width: "20%", translate: "0 -7px" }}></div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "column" }}>
                            <p style={{ borderTop: `1px dotted`, borderImage: `linear-gradient(to right, ${colors.tirtiaryColor}, ${colors.secondaryColor})`, borderImageSlice: 1 }}>Uniquely Tailored</p>

                            {/* circle */}
                            <div style={{ backgroundImage: "linear-gradient(#046f6d, #443e3a)", margin: "auto 0 auto 0", width: "100%", borderRadius: "50%", aspectRatio: "1/1", display: "grid", justifyItems: "center", alignItems: "center", alignContent: "center", gap: "1rem", }}>
                                <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M288 0H160 128C110.3 0 96 14.3 96 32s14.3 32 32 32V196.8c0 11.8-3.3 23.5-9.5 33.5L10.3 406.2C3.6 417.2 0 429.7 0 442.6C0 480.9 31.1 512 69.4 512H378.6c38.3 0 69.4-31.1 69.4-69.4c0-12.8-3.6-25.4-10.3-36.4L329.5 230.4c-6.2-10.1-9.5-21.7-9.5-33.5V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H288zM192 196.8V64h64V196.8c0 23.7 6.6 46.9 19 67.1L309.5 320h-171L173 263.9c12.4-20.2 19-43.4 19-67.1z" /></svg>
                                <p>Collaboration</p>
                            </div>
                        </div>

                        <div>
                            <div className={styles.headerCont}>
                                <h4>Passionate Goals</h4>
                                <div></div>
                                <p>We are at the forefront of the data analytics</p>
                            </div>

                            <h4>Diverse Clients</h4>

                            <p>we help them unlock the true potential of their data.</p>

                            <p style={{ paddingTop: "1rem" }}>We&apos;ve expanded our offerings to include a comprehensive suite of analytics solutions tailored to meet unique needs</p>
                        </div>
                    </div>
                </div>
            </section >

            {
                new Array(10).fill(0).map((eachItem, eachItemIndex) => {
                    return <Worm key={eachItemIndex} />
                })
            }

            {
                new Array(15).fill(0).map((eachItem, eachItemIndex) => {
                    let seenOffset = undefined
                    if (eachItemIndex > 5) {
                        seenOffset = { x: getRandomNumber(400 + (eachItemIndex * 4), eachItemIndex), y: getRandomNumber(200 + (eachItemIndex * 4), eachItemIndex) }
                    }
                    return <Bubble offset={seenOffset} key={eachItemIndex} />
                })
            }
        </div >
    )
}

function Cube() {
    const cubeWidth = 100
    const [offset, offsetSet] = useState(0)
    const [opacityArr, opacityArrSet] = useState([0, 0, 0, 0, 0, 0])

    useEffect(() => {
        //animate opacity
        const myInterval = setInterval(() => {
            opacityArrSet(prevArr => {
                const newArr = [...prevArr]

                const usableIndexes: number[] = []
                newArr.forEach((eachEl, eachElIndex) => {
                    if (eachEl === 0) {
                        usableIndexes.push(eachElIndex)
                    }
                })

                if (usableIndexes.length === 0) {
                    clearInterval(myInterval)
                    return newArr
                }

                const randUsableIndex = usableIndexes[Math.floor(Math.random() * usableIndexes.length)]
                newArr[randUsableIndex] = .8
                return newArr
            })
        }, 1000)

        return () => clearInterval(myInterval)
    }, [])

    const offsetInterval = useRef<undefined | NodeJS.Timeout>(undefined)

    return (
        <div style={{ width: `${cubeWidth}px` }} className={styles.cubeBody}
            onClick={() => {
                if (!offsetInterval.current) {
                    offsetInterval.current = setInterval(() => {
                        offsetSet(prev => prev + 10)
                    }, 400)
                }
            }}

            onMouseMove={() => {
                if (offsetInterval.current) {
                    offsetSet(0)
                    clearInterval(offsetInterval.current)
                    offsetInterval.current = undefined
                }
            }}>
            <div style={{ transform: `translateX(${-cubeWidth / 2 - offset}px) rotateY(-90deg)`, backgroundColor: "", opacity: opacityArr[0] }} className={styles.cubeFace}>left</div>
            <div style={{ transform: `translateX(${cubeWidth / 2 + offset}px) rotateY(90deg)`, backgroundColor: "", opacity: opacityArr[1] }} className={styles.cubeFace}>right</div>

            <div style={{ transform: `translateZ(${-cubeWidth / 2 - offset}px) rotateY(180deg)`, backgroundColor: "", opacity: opacityArr[2] }} className={styles.cubeFace}>back</div>
            <div style={{ transform: `translateZ(${cubeWidth / 2 + offset}px) rotateX(0deg)`, backgroundColor: "", opacity: opacityArr[3] }} className={styles.cubeFace}>front</div>

            <div style={{ transform: `translateY(${-cubeWidth / 2 - offset}px) rotateX(90deg)`, backgroundColor: "", opacity: opacityArr[4] }} className={styles.cubeFace}>top</div>
            <div style={{ transform: `translateY(${cubeWidth / 2 + offset}px) rotateX(90deg) rotateY(180deg)`, backgroundColor: "", opacity: opacityArr[5] }} className={styles.cubeFace}>bottom</div>
        </div>
    )
}

function Graph({ columnNames, positionValuesSeen }: { columnNames: string[], positionValuesSeen: number[] }) {

    const ceilingNum = useMemo(() => {
        let max = Math.max(...positionValuesSeen);
        let roundedUp = Math.ceil(max / 10) * 10;

        return roundedUp;
    }, [positionValuesSeen])

    const [positionValues, positionValuesSet] = useState([...positionValuesSeen])
    const [initialPositionValues, initialPositionValuesSet] = useState([...positionValues])

    const [waveDivOffset, waveDivOffsetSet] = useState(10)
    const [animateHeightOnBarNum, animateHeightOnBarNumSet] = useState(0)
    const [animateOpacityOnBarNum, animateOpacityOnBarNumSet] = useState(0)

    //start of animations
    useEffect(() => {
        const startAnim = setInterval(() => {
            if (Math.random() * 1 < .8) {
                positionValuesSet(() => {
                    return initialPositionValues.map(eachNum => {

                        const randomOffset = Math.floor(Math.random() * ceilingNum / 20)

                        return Math.floor(Math.random() * eachNum) + randomOffset
                    })
                })

            } else {
                positionValuesSet([...initialPositionValues])
            }
        }, 5000)

        setTimeout(() => {
            animateHeightOnBarNumSet(100)
            animateOpacityOnBarNumSet(1)
        }, 1000)

        return () => {
            clearInterval(startAnim)
        }
    }, [])


    return (
        <div style={{ display: "grid", gridTemplateRows: "5fr .5fr", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${positionValues.length}, 1fr)`, gridAutoFlow: "column", alignItems: "flex-end", justifyItems: "center" }} >
                {positionValues.map((eachYPosition, eachYPositionIndex) => {

                    return (
                        <div key={eachYPositionIndex} style={{ height: `${(eachYPosition / ceilingNum) * animateHeightOnBarNum}%`, position: "relative", display: "grid", gridAutoRows: "1fr 7fr", justifyItems: "center", gridTemplateColumns: "1fr", width: "20%", transition: `height 2s` }}>
                            <div style={{ display: "grid", justifyItems: "center", gap: "1rem" }}>
                                <div className={styles.points} style={{ width: ".2rem", aspectRatio: "1/1", borderRadius: "50%", backgroundColor: "#f96e23", "--pointTimeOffset": `${eachYPositionIndex * 100}ms` } as React.CSSProperties}></div>

                                <div style={{ height: eachYPosition > 10 ? "1.5rem" : "0", width: "1px", backgroundColor: '#fff' }}></div>
                            </div>

                            <div style={{ clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0% 100%)", backgroundColor: "#f96e23", width: "100%" }}></div>
                        </div>

                    )
                })}

                {/* waves */}
                {positionValues.map((eachYPosition, eachYPositionIndex) => {
                    //const eachPosValue = [12, 20, 35, 50, 45, 40, 30, 23, 23, 45, 67, 80, 88, 75, 60, 50, 40] //y axis - x axis layout

                    let arrToPolygonStr = ""
                    const offset = 100 / positionValues.length //each percent needed to makeup 100, e.g 10%

                    if (eachYPositionIndex === 0 || eachYPositionIndex === Math.ceil(positionValues.length / 2)) {
                        const limiter = Math.ceil(positionValues.length / 2)

                        positionValues.slice(eachYPositionIndex, eachYPositionIndex + limiter).forEach((eachYPositionSmaller, eachYPositionIndexSmaller) => {
                            if (eachYPositionIndexSmaller + 1 > limiter) {
                                eachYPositionSmaller = 0
                                eachYPositionIndexSmaller = limiter + 1 //deliberate so we overshoot / styling
                            }

                            arrToPolygonStr += `${((eachYPositionIndexSmaller + 1) * offset) - offset / 2}% ${100 - eachYPositionSmaller + waveDivOffset}%,`
                        })

                        //end the clip mask
                        arrToPolygonStr += `${(limiter + 1) * offset}% 100%,`
                    }

                    return <div key={eachYPositionIndex} style={{ position: "absolute", backgroundColor: "#fd601887", width: `100%`, height: `${animateHeightOnBarNum}%`, left: `${offset * eachYPositionIndex}%`, clipPath: `polygon(${arrToPolygonStr} 0 100%)`, transition: `height 3s, clip-path 4s` }}></div>
                })}
            </div>

            <div style={{ width: "100%", display: "grid", gridTemplateColumns: `repeat(${positionValues.length}, ${100 / positionValues.length}%)`, gridAutoFlow: "column" }}>
                {positionValues.map((eachPosSeen, eachPosSeenIndex) => {
                    const seenName = columnNames[eachPosSeenIndex] ?? ""

                    return (
                        <div key={eachPosSeenIndex} style={{ display: "grid", justifyItems: "center", alignItems: "flex-start", opacity: animateOpacityOnBarNum, transition: `opacity ${(eachPosSeenIndex + 1) * 500}ms`, fontSize: ".7rem" }}>
                            <div style={{ width: ".2em", aspectRatio: "1/2.5", backgroundColor: "#fff", translate: `0 -50%` }}></div>
                            <p style={{ color: colors.secondaryColor }}>{seenName}</p>
                        </div>)
                })}
            </div>
        </div>
    )
}

function Worm() {
    const [canShow, canShowSet] = useState(false)
    const [currentPos, currentPosSet] = useState({ x: 0, y: 0 })
    const [animationTime, animationTimeSet] = useState(getRandomNumber(2000, 1000))
    const wormHeight = 4

    function getRandomNumber(range: number, lowestVal: number = 0) {
        return Math.floor(Math.random() * range) + lowestVal
    }

    useEffect(() => {
        start()

        return () => {
            if (movingInterval.current) {
                clearInterval(movingInterval.current)
            }
        }
    }, [])

    const movingInterval = useRef<undefined | NodeJS.Timeout>()

    function start() {
        setTimeout(() => {
            canShowSet(true)
        }, animationTime * 2)

        movingInterval.current = setInterval(() => {
            move()
        }, animationTime)
    }

    function move() {
        let randX = Math.floor(Math.random() * window.innerWidth)
        let randY = Math.floor(Math.random() * window.innerHeight)

        currentPosSet({ x: randX, y: randY })
    }

    return (
        <div style={{ backgroundColor: "#e62333", borderRadius: "50%", position: "absolute", width: `${wormHeight}px`, aspectRatio: "1/1", top: 0, left: 0, translate: `${currentPos.x}px ${currentPos.y}px`, rotate: `${0}deg`, opacity: canShow ? 1 : 0, transition: `translate ${animationTime}ms, opacity ${animationTime}ms`, pointerEvents: "none", userSelect: "none", zIndex: "-1" }}></div>
    )

}

function Bubble({ offset }: { offset?: { x: number, y: number } }) {
    const [canShow, canShowSet] = useState(false)
    const initialPos = useMemo(() => {
        if (offset) return { x: offset.x + getRandomNumber(100, 0), y: offset.y + getRandomNumber(200, 0) }
        return { x: getRandomNumber(100, 0), y: getRandomNumber(200, 0) }
    }, [])
    const [currentPos, currentPosSet] = useState({ ...initialPos })
    const [animationTime, animationTimeSet] = useState(getRandomNumber(5000, 4000))
    const [bubbleScale, bubbleScaleSet] = useState(getRandomNumber(10, 3))
    const wormHeight = useMemo(() => getRandomNumber(100, 20), [])


    const movingInterval = useRef<undefined | NodeJS.Timeout>()

    useEffect(() => {
        start()

        return () => {
            if (movingInterval.current) {
                clearInterval(movingInterval.current)
            }
        }
    }, [])

    function start() {
        setTimeout(() => {
            canShowSet(true)
        }, animationTime / 3)

        movingInterval.current = setInterval(() => {
            move()
        }, animationTime)

        setInterval(() => {
            bubbleScaleSet(getRandomNumber(10, 5))
        }, animationTime * 3)
    }

    function move() {
        currentPosSet(prevPos => {

            if (Math.random() * 1 < 0.95) {

                let newOffsetX = prevPos.x + getRandomNumber(10, 2)
                let newOffsetY = prevPos.y + getRandomNumber(10, 2)

                if (newOffsetX > window.innerWidth) {
                    newOffsetX = initialPos.x + getRandomNumber(50, 10)
                }
                if (newOffsetY > window.innerHeight) {
                    newOffsetY = initialPos.y + getRandomNumber(50, 10)
                }

                return { x: newOffsetX, y: newOffsetY }

            } else {
                return { x: initialPos.x + getRandomNumber(100, 10), y: initialPos.y + getRandomNumber(100, 10) }
            }
        })
    }

    return (
        <div style={{ backgroundColor: "#145e62b5", borderRadius: "50%", position: "absolute", width: `${wormHeight}px`, aspectRatio: "1/1", top: 0, left: 0, translate: `${currentPos.x}px ${currentPos.y}px`, opacity: canShow ? 1 : 0, transition: `translate ${animationTime}ms, opacity ${animationTime}ms, scale ${animationTime * 2}ms`, pointerEvents: "none", userSelect: "none", zIndex: "-1", scale: bubbleScale / 10, filter: "blur(3px)" }}></div>
    )

}

function getRandomNumber(range: number, lowestVal: number = 0) {
    return Math.floor(Math.random() * range) + lowestVal
}
