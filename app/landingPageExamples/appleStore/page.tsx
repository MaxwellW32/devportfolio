"use client"
import React, { useEffect, useState } from 'react'
import styles from "./page.module.css"
import Image from 'next/image'
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { difference } from 'next/dist/build/utils';

//url is made up of parameters slug and color 

type iphone = {
    id: number,
    name: string,
    price: number,
    variants: [string, string][]
    description: string
}

const iphones: iphone[] = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        variants: [["black", require("@/public/landingPageExamples/appleStore/iphone15_pro_max_black.png").default.src]],
        price: 1299,
        description: "Experience cutting-edge technology with the iPhone 15 Pro Max. Featuring an advanced A17 Bionic chip and a stunning 6.7-inch Super Retina XDR display"
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        price: 1200,
        variants: [["blue", require("@/public/landingPageExamples/appleStore/iphone15_pro_blue.png").default.src]],
        description: "The iPhone 15 Pro offers a blend of power and elegance. Powered by the A17 Bionic chip, it boasts a 6.1-inch Super Retina XDR display and a pro-level camera system."
    },
    {
        id: 3,
        name: "iPhone 15",
        price: 1100,
        variants: [["pink", require("@/public/landingPageExamples/appleStore/iphone15_pink.png").default.src]],
        description: "Meet the remarkable iPhone 15. Equipped with the A17 Bionic chip, a vibrant 6.1-inch Retina display, and an advanced dual-camera system."
    },
    {
        id: 4,
        name: "iPhone 14",
        price: 1000,
        variants: [["light-blue", require("@/public/landingPageExamples/appleStore/iphone_14.png").default.src]],
        description: "The iPhone 14 is a powerhouse of innovation. Featuring the A16 Bionic chip, a brilliant 6.1-inch Retina display, and a high-quality dual-camera setup."
    },
    {
        id: 5,
        name: "iPhone SE",
        price: 900,
        variants: [["black", require("@/public/landingPageExamples/appleStore/iphone_se.png").default.src]],
        description: "The iPhone SE packs incredible performance into a beloved design. It has a brilliant 4.7-inch Retina display and an advanced single-camera system."
    },
    {
        id: 6,
        name: "iPhone XS",
        price: 850,
        variants: [["silver", require("@/public/landingPageExamples/appleStore/iphoneXS_silver.png").default.src]],
        description: "The iPhone XS combines elegance with performance. Featuring the A12 Bionic chip, a 5.8-inch Super Retina display, and a sophisticated dual-camera system."
    },
    {
        id: 7,
        name: "iPhone X",
        price: 800,
        variants: [["grey", require("@/public/landingPageExamples/appleStore/iphoneX.png").default.src]],
        description: "Discover the iPhone X, where innovation meets design. Powered by the A11 Bionic chip, it boasts a 5.8-inch Super Retina display and a revolutionary dual-camera system."
    },
];

export default function Page() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [currentIndex, currentIndexSet] = useState(0)
    const [variantIndex, variantIndexSet] = useState(0)

    const next = () => {
        currentIndexSet(prev => {
            let newIndex = prev + 1
            if (newIndex > iphones.length - 1) {
                newIndex = 0
            }

            return newIndex
        })
    }

    const prev = () => {
        currentIndexSet(prev => {
            let newIndex = prev - 1
            if (newIndex < 0) {
                newIndex = iphones.length - 1
            }

            return newIndex
        })
    }

    const findSafeIndex = (option: "up" | "down", seenValue: number) => {
        if (option === "up") {
            if (seenValue > iphones.length - 1) {
                let newValue = seenValue - iphones.length
                return newValue
            } else {
                return seenValue
            }

        } else {
            //down
            if (seenValue < 0) {//-2
                let newValue = iphones.length + seenValue
                return newValue
            } else {
                return seenValue
            }
        }
    }

    const changeVariant = (option: "next" | "prev", seenIphone: iphone) => {
        if (option === "next") {
            variantIndexSet(prev => {
                let newIndex = prev + 1
                if (newIndex > seenIphone.variants.length - 1) {
                    newIndex = 0
                }

                return newIndex
            })


        } else {
            //prev
            variantIndexSet(prev => {
                let newIndex = prev - 1
                if (newIndex < 0) {
                    newIndex = seenIphone.variants.length - 1
                }

                return newIndex
            })
        }
    }

    const changeUrl = (seenName: string, seenSearchParams: ReadonlyURLSearchParams, seenColor: string) => {
        const params = new URLSearchParams(seenSearchParams);

        params.set('name', seenName);
        params.set('color', seenColor);

        replace(`${pathname}?${params.toString()}`);
    }


    //load up url selection on page load
    useEffect(() => {
        const seenUrlName = searchParams.get("name")
        let phoneIndex = iphones.findIndex(eachPhone => eachPhone.name === seenUrlName)
        if (phoneIndex < 0) phoneIndex = 0

        const seenUrlVariant = searchParams.get("color")
        let variantIndex = iphones[phoneIndex].variants.findIndex(eachVariant => eachVariant[0] === seenUrlVariant)
        if (variantIndex < 0) variantIndex = 0

        currentIndexSet(phoneIndex)
        variantIndexSet(variantIndex)
    }, [])

    //write changes to url
    useEffect(() => {
        changeUrl(iphones[currentIndex].name, searchParams, iphones[currentIndex].variants[variantIndex][0])
    }, [currentIndex, variantIndex])

    //list all phones in the array
    //change the x coordinate to reflect how far they are away from the current index.
    return (
        <main className={styles.mainDiv} style={{}}>
            <div className={styles.mainHolder} style={{ height: "100svh", display: "flex", flexWrap: "wrap", gap: '1rem', overflowY: "auto" }}>
                <div style={{ alignSelf: "center", padding: "1rem", display: "flex", flexDirection: 'column', gap: "1rem" }}>
                    <div style={{ display: 'flex', position: "relative", alignItems: 'center', gap: ".5rem", marginBottom: "3rem" }}>
                        <Image className={styles.logo} alt='logo' src={require("@/public/landingPageExamples/appleStore/apple logo.svg").default.src} height={50} width={50} style={{ objectFit: "contain", fill: "var(----APColor1)" }} />
                        <h1 style={{ position: "relative", translate: "0 .2rem", color: "var(----APColor1)", fontWeight: "normal", fontSize: "3.3rem" }}>iPhone</h1>
                    </div>

                    <h1 style={{ color: "var(--APColor1)" }}>{iphones[currentIndex].name}</h1>

                    <p style={{ maxWidth: "350px" }}>{iphones[currentIndex].description}</p>

                    <h3>${iphones[currentIndex].price}.00</h3>

                    <div style={{ display: "flex", alignItems: "center", gap: '1rem' }}>
                        <div style={{ display: "flex", gap: ".5rem" }}>
                            <button onClick={prev}>prev</button>
                            <button onClick={next}>next</button>
                        </div>

                        <button>Add to cart</button>
                    </div>
                </div>

                <div style={{ flex: "1 1 300px", padding: '1rem', paddingRight: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative", overflowX: "clip" }}>
                        {iphones.map((eachIphone, eachIphoneIndex) => {
                            let usingTranslate = ``
                            let usingZIndex = 0
                            let usingScale = 1
                            let usingBlur = 0

                            for (let index = 0; index < 4; index++) {
                                //below check
                                const negIndex = index * -1
                                const xMultiplyer = 350
                                const yMultiplyer = 150
                                if (eachIphoneIndex === findSafeIndex("down", currentIndex + negIndex)) {
                                    usingTranslate = `${index * xMultiplyer}px ${negIndex * yMultiplyer}px`
                                    usingScale = 1 - ((index) / 3)
                                    usingBlur = index * 3
                                }


                                //above check
                                if (eachIphoneIndex === findSafeIndex("up", currentIndex + index)) {
                                    usingTranslate = `${(index * xMultiplyer) * 1.05}px ${index * yMultiplyer}px`
                                    usingZIndex = index + 1
                                    usingScale = 1 + ((index) / 10)
                                }
                            }


                            return (
                                <div key={eachIphone.id} style={{ position: "absolute", top: "50%", left: 0, zIndex: usingZIndex, translate: usingTranslate, scale: usingScale, filter: usingBlur > 0 ? `blur(${usingBlur}px)` : "", transition: "translate 1s, scale 1s, filter 1s" }}>
                                    <Image alt={`${eachIphone.name}'s image`} src={eachIphone.variants[variantIndex][1]} width={300} height={300} style={{ objectFit: "contain" }} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </main>
    )
}
