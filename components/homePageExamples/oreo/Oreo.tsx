import React from 'react'
import OreoMainNav1 from './oreoMainnav1/OreoMainnav1'
import Image from 'next/image'
import Link from 'next/link'
import styles from "./oreo.module.css"
import OreoProductSlider, { oreoProduct } from './OreoProductSlider'


const oreoProducts: oreoProduct[] = [
    {
        name: "Oreo Vanilla",
        image: require(`@/public/homePageExamples/oreo/products/vanilla.png`).default.src,
        backgroundColor: "#FFF1E0",
        ingredients: "Classic Oreo with a twist of smooth vanilla cream.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/vanilla.jpg`).default.src,
    },
    {
        name: "Oreo Golden",
        image: require(`@/public/homePageExamples/oreo/products/golden.png`).default.src,
        backgroundColor: "#FFD700",
        ingredients: "Golden biscuits with a delicious cream filling.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/golden.jpg`).default.src,
    },
    {
        name: "Oreo Brownie",
        image: require(`@/public/homePageExamples/oreo/products/brownie.png`).default.src,
        backgroundColor: "#4E342E",
        ingredients: "Rich chocolate brownie flavor packed in every bite.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/brownie.jpg`).default.src,
    },
    {
        name: "Oreo Birthday Party",
        image: require(`@/public/homePageExamples/oreo/products/birthday.png`).default.src,
        backgroundColor: "#FFC0CB",
        ingredients: "A festive blend of birthday cake flavor and colorful sprinkles.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/cake.webp`).default.src,
    },
    {
        name: "Oreo Double Creme",
        image: require(`@/public/homePageExamples/oreo/products/double.png`).default.src,
        backgroundColor: "#FFFFF0",
        ingredients: "Double the cream for twice the fun.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/creme.jpeg`).default.src,
    },
    {
        name: "Oreo Cadbury Coated",
        image: require(`@/public/homePageExamples/oreo/products/cadbury.png`).default.src,
        backgroundColor: "#4C2882",
        ingredients: "Luxurious Cadbury chocolate coating over the classic Oreo.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/cadburry.jpg`).default.src,
    },
    {
        name: "Oreo Doughnuts",
        image: require(`@/public/homePageExamples/oreo/products/doughnuts.png`).default.src,
        backgroundColor: "#FFC0CB",
        ingredients: "Doughnut-inspired Oreos, a sweet twist on a classic.",
        secondImage: require(`@/public/homePageExamples/oreo/products/second image/doughnuts.jpg`).default.src,
    }
]

export default function Oreo() {
    return (
        <div className={styles.oreoParentDiv}>
            <OreoMainNav1
                homeButtonEl={
                    <Link href={`/homepages/Oreo`}>
                        <Image alt='oreoLogo' priority={true} height={200} width={200} style={{ aspectRatio: "1/1", height: "7rem", width: "auto", objectFit: "contain" }} src={require(`@/public/homePageExamples/oreo/oreo logo.png`).default.src} />
                    </Link>
                }
                menuInfoArr={[
                    {
                        title: "Home",
                        link: "/",
                    },
                    {
                        title: "Products",
                        link: "/",
                    },
                    {
                        title: "Recipes",
                        link: "/",
                    },
                    {
                        title: "History",
                        link: "/",
                    },
                    {
                        title: "Fan Creations",
                        link: "/",
                    }
                ]}
                mobileNavButtonEl={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" /></svg>
                }

                themeSwitcherEl={
                    <div>cart</div>
                }
            />

            <main>
                <div style={{ position: "relative", display: "grid", minHeight: "400px", alignItems: 'center', paddingBottom: "3rem", color: "#fff", }}>
                    <Image alt='oreobg' fill={true} src={require(`@/public/homePageExamples/oreo/oreo bg 2.png`).default.src} style={{ objectFit: "cover", zIndex: -1, objectPosition: "left" }} />

                    <div style={{ maxWidth: "500px", display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", overflowX: "clip" }}>
                        <h1>Welcome to the world of</h1>
                        <h1 style={{ fontSize: "2rem", scale: 2.3, transformOrigin: "left center" }}>Oreo</h1>

                        <h3 style={{ marginTop: "1rem" }}>Where Every Cookie is an Adventure!</h3>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
                            <button style={{ backgroundColor: "#fff", color: "#000" }}>Our Flavours</button>
                            <button style={{ backgroundColor: "var(--oreoPrimaryColor)" }}>Shop Now</button>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: "#fff" }}>
                    <div style={{ backgroundColor: "#fff", position: "relative", top: "-2rem", borderRadius: "40%", padding: "1rem 1rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                        <h2 style={{ color: "#000", textAlign: "center", marginBottom: "1rem" }}>What goes in to an Oreo?</h2>

                        <div className={styles.ingredientsCont}>
                            <div>
                                <Image alt='ingredientImg' width={200} height={200} src={require(`@/public/homePageExamples/oreo/wheatflour.jpg`).default.src} style={{ objectFit: "cover" }} />
                                <h3>Wheat Flour</h3>
                                <p>Provides a light structure with lower protein, perfect for a delicate crunch</p>
                            </div>

                            <div>
                                <Image alt='ingredientImg' width={200} height={200} src={require(`@/public/homePageExamples/oreo/sugar.webp`).default.src} style={{ objectFit: "cover" }} />
                                <h3>Sugar</h3>
                                <p>Sweetens each bite, enhancing the Oreo&apos;s irresistible taste.</p>
                            </div>

                            <div>
                                <Image alt='ingredientImg' width={200} height={200} src={require(`@/public/homePageExamples/oreo/canola.webp`).default.src} style={{ objectFit: "cover" }} />
                                <h3>Canola Oil</h3>
                                <p>Offers a rich texture and beneficial fats for a smooth mouthfeel.</p>
                            </div>

                            <div>
                                <Image alt='ingredientImg' width={200} height={200} src={require(`@/public/homePageExamples/oreo/cocoa.jpg`).default.src} style={{ objectFit: "cover" }} />
                                <h3>Cocoa</h3>
                                <p>Infuses the Oreos with a deep, chocolatey essence.</p>
                            </div>

                            <div>
                                <Image alt='ingredientImg' width={200} height={200} src={require(`@/public/homePageExamples/oreo/chocolate.jpg`).default.src} style={{ objectFit: "cover" }} />
                                <h3>Chocolate</h3>
                                <p>Derived from cocoa beans for that authentic chocolate indulgence.</p>
                            </div>

                        </div>
                    </div>

                    <OreoProductSlider oreoProducts={oreoProducts} />
                </div>


            </main>

            <footer></footer>
        </div>
    )
}
