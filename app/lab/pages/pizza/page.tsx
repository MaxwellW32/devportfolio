"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./styles.module.css"
import Link from "next/link"
import Image from "next/image"

const colors = {
    primary: "#df4f2d"
}

export default function Page() {
    const [amtOfPizzaSlices, amtOfPizzaSlicesSet] = useState(9)
    const [rndIndexChosen, rndIndexChosenSet] = useState(Math.floor(Math.random() * amtOfPizzaSlices))
    const [mouseOverPizzaBox, mouseOverPizzaBoxSet] = useState(false)
    const menu = useRef<HTMLDivElement>(null!)
    const pizzaTableBackground = useRef<HTMLDivElement>(null!)

    const [pizzaFlavors, pizzaFlavorsSet] = useState<{
        [key: string]: {
            flavor: string;
            crust: string;
            price: number;
            size: string;
        }
    }>({
        pepperoni: {
            flavor: "pepperoni",
            crust: "Hand Tossed",
            price: 30,
            size: "large"
        },
        cheese: {
            flavor: "cheese",
            crust: "Stuffed Crust",
            price: 25,
            size: "large"
        },
        mushroom: {
            flavor: "mushroom",
            crust: "Deep Dish",
            price: 25,
            size: "large"
        },
    })

    const [activeFlavor, activeFlavorSet] = useState(Object.keys(pizzaFlavors)[0])

    useEffect(() => {
        const rndInterval = setInterval(() => {
            rndIndexChosenSet(Math.floor(Math.random() * amtOfPizzaSlices))
        }, 4000)

        return () => clearInterval(rndInterval)
    }, [])

    //handle resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 739) {
                menu.current.style.height = `${pizzaTableBackground.current.offsetHeight}px`
            } else {
                menu.current.style.height = `auto`
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])
    return (
        <div className={styles.pizzaMainDiv} style={{ backgroundColor: "#000", position: "relative", overflowX: "hidden" }}>
            <div ref={pizzaTableBackground} className={styles.pizzaTableBackground} style={{ aspectRatio: "16/9", background: `url(${require("@/public/landingPageExamples/pizzaSlice/pizzaTable.png").default.src}) left top`, backgroundSize: "contain", position: "relative", overflow: "hidden" }}>
                <div className={styles.woodenPizzaPeel} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: `url(${require("@/public/landingPageExamples/pizzaSlice/woodenpizzapeel.png").default.src}) left top`, backgroundSize: "contain" }}></div>

                <div className={styles.pizzaBox} style={{ height: "55%", aspectRatio: "1/1", position: 'absolute', rotate: "-90deg", top: "15%", left: '17%' }} onMouseEnter={() => { mouseOverPizzaBoxSet(true) }} onMouseLeave={() => { mouseOverPizzaBoxSet(false) }}>
                    {activeFlavor === "pepperoni" ? (
                        <>
                            {new Array(amtOfPizzaSlices).fill(0).map((eachPizza, eachPizzaIndex) => {
                                let offset = 0
                                let translateOffset = 0

                                if (eachPizzaIndex === 2) { offset = 3, translateOffset = 0 }
                                if (eachPizzaIndex === 3) { offset = 3, translateOffset = -5 }
                                if (eachPizzaIndex === 4) { offset = -3 }
                                if (eachPizzaIndex === 5) { offset = -1, translateOffset = -3 }
                                if (eachPizzaIndex === 6) { offset = 1, translateOffset = 3 }

                                return (
                                    <EachPizzaSlice key={eachPizzaIndex} imgSrc={require(`@/public/landingPageExamples/pizzaSlice/pizzaslices/slice ${eachPizzaIndex + 1}.png`).default.src} rotation={((-360 / amtOfPizzaSlices) * eachPizzaIndex) + offset} translateAmt={translateOffset} randomlyPull={eachPizzaIndex === rndIndexChosen && !mouseOverPizzaBox ? true : false} />
                                )
                            })}
                        </>
                    ) : activeFlavor === "cheese" ? (
                        <>
                            <img className={styles.pizzaImage} alt="Cheese pizza" src={require(`@/public/landingPageExamples/pizzaSlice/cheesepizza.png`).default.src} />
                        </>
                    ) : activeFlavor === "mushroom" ? (
                        <>
                            <img className={styles.pizzaImage} alt="Cheese pizza" src={require(`@/public/landingPageExamples/pizzaSlice/mushroompizza.png`).default.src} />
                        </>
                    ) : null}
                </div>
            </div>

            <div className={styles.menu} ref={menu} style={{}}>
                <img alt="pizzaLogo" style={{ height: "7rem" }} src={require(`@/public/landingPageExamples/pizzaSlice/pizza slice logo.png`).default.src} />

                <div style={{ textAlign: "center" }}>
                    <h2 style={{ marginTop: "1rem" }}>Welcome to CraveSlice</h2><br />
                    <h2>Satisfy Your <span style={{ color: colors.primary }}>Pizza</span> Cravings!</h2>
                </div>

                <div style={{ width: "60%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <h3>Toppings</h3>
                        <p>{pizzaFlavors[activeFlavor].flavor}</p>
                    </div>

                    <div>
                        <h3>Crust</h3>
                        <p>{pizzaFlavors[activeFlavor].crust}</p>
                    </div>

                    <div>
                        <h3>Size</h3>
                        <p>{pizzaFlavors[activeFlavor].size}</p>
                    </div>
                </div>


                <div style={{ background: `url(${require("@/public/landingPageExamples/pizzaSlice/splashbg.png").default.src})`, backgroundSize: "cover", height: "200px", aspectRatio: "16/9", display: "grid", justifyItems: "center", alignItems: "center", alignContent: "center" }}>
                    <p>Choose your Pizza</p>
                    <br />

                    <div >
                        <button className={styles.pizzaButtonNav} onClick={() => {
                            activeFlavorSet(prevFlavor => {
                                const flavorArr = Object.keys(pizzaFlavors)
                                let newIndex = flavorArr.indexOf(prevFlavor) - 1

                                if (newIndex < 0) {
                                    newIndex = flavorArr.length - 1
                                }

                                return flavorArr[newIndex]
                            })
                        }}>prev</button>

                        <button className={styles.pizzaButtonNav} onClick={() => {
                            activeFlavorSet(prevFlavor => {

                                const flavorArr = Object.keys(pizzaFlavors)
                                let newIndex = flavorArr.indexOf(prevFlavor) + 1

                                if (newIndex > flavorArr.length - 1) {
                                    newIndex = 0
                                }

                                return flavorArr[newIndex]

                            })
                        }}>next</button>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <div>
                        <p style={{ fontWeight: "bold" }}>{pizzaFlavors[activeFlavor].price.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        })}</p>
                    </div>

                    <button>Order Now</button>
                </div>
            </div>

            <div style={{ display: "flex", backgroundColor: "rgb(25, 25, 25)", justifyContent: 'center', paddingTop: "1rem", gap: "1rem", flexWrap: "wrap", position: "relative" }}>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <svg style={{ fill: colors.primary }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M280 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h57.7l16.4 30.3L256 192l-45.3-45.3c-12-12-28.3-18.7-45.3-18.7H64c-17.7 0-32 14.3-32 32v32h96c88.4 0 160 71.6 160 160c0 11-1.1 21.7-3.2 32h70.4c-2.1-10.3-3.2-21-3.2-32c0-52.2 25-98.6 63.7-127.8l15.4 28.6C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L418.2 128H480c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H459.6c-7.5 0-14.7 2.6-20.5 7.4L391.7 78.9l-14-26c-7-12.9-20.5-21-35.2-21H280zM462.7 311.2l28.2 52.2c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-28.2-52.2c2.3-.3 4.7-.4 7.1-.4c35.3 0 64 28.7 64 64s-28.7 64-64 64s-64-28.7-64-64c0-15.5 5.5-29.7 14.7-40.8zM187.3 376c-9.5 23.5-32.5 40-59.3 40c-35.3 0-64-28.7-64-64s28.7-64 64-64c26.9 0 49.9 16.5 59.3 40h66.4C242.5 268.8 190.5 224 128 224C57.3 224 0 281.3 0 352s57.3 128 128 128c62.5 0 114.5-44.8 125.8-104H187.3zM128 384a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" /></svg>

                    <p>Delivery</p>
                </div>

                <div style={{ display: "flex", gap: ".5rem" }}>
                    <svg style={{ fill: colors.primary }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M347.1 24.6c7.7-18.6 28-28.5 47.4-23.2l88 24C499.9 30.2 512 46 512 64c0 247.4-200.6 448-448 448c-18 0-33.8-12.1-38.6-29.5l-24-88c-5.3-19.4 4.6-39.7 23.2-47.4l96-40c16.3-6.8 35.2-2.1 46.3 11.6L207.3 368c70.4-33.3 127.4-90.3 160.7-160.7L318.7 167c-13.7-11.2-18.4-30-11.6-46.3l40-96z" /></svg>

                    <p>Call & Collect</p>
                </div>
            </div>

            <section className={styles.firstSection} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))", gap: '1rem' }}>
                <article>
                    <h3>About us</h3>
                    <p>At CraveSlice, we believe in crafting the perfect pizza experience for our customers. Our passion for quality ingredients, mouthwatering flavors, and excellent service sets us apart. With every slice, we aim to deliver a taste that will keep you coming back for more.</p>
                </article>

                <article>
                    <h3>Our Pizzas</h3>
                    <p>Indulge in a world of flavors with our diverse pizza menu. From classic Margherita to innovative specialty pizzas, each creation is a testament to our commitment to culinary excellence. We source the finest ingredients to ensure every bite is a burst of satisfaction.</p>
                </article>

                <article>
                    <h3>Quality Ingredients</h3>
                    <p>We take pride in using only the freshest and highest quality ingredients. Our dough is made in-house daily, our sauces are crafted from ripe tomatoes, and our toppings are carefully selected to guarantee a delicious and authentic taste in every pizza.</p>
                </article>

                <article>
                    <h3>Customization</h3>
                    <p>CraveSlice is all about personalization. Create your own pizza masterpiece by choosing from our wide range of toppings, sauces, and crust options. Express your unique taste and let us bring your pizza vision to life.</p>
                </article>

                <article>
                    <h3>Fast and Reliable Delivery</h3>
                    <p>Craving pizza but don&apos;t want to leave the house? No problem! CraveSlice offers fast and reliable delivery services straight to your doorstep. Enjoy the convenience of having your favorite pizza delivered hot and fresh.</p>
                </article>

                <article>
                    <h3>Special Deals</h3>
                    <p>Check out our special deals and promotions to get the best value for your cravings. We believe that great pizza should be accessible to everyone, and our deals reflect our commitment to providing quality at an affordable price.</p>
                </article>

                <article>
                    <h3>Join Our Loyalty Program</h3>
                    <p>Become a CraveSlice VIP by joining our loyalty program. Earn points with every purchase and enjoy exclusive discounts and special offers. It&apos;s our way of saying thank you for being a part of the CraveSlice family.</p>
                </article>
            </section>

            <footer style={{ padding: "2rem", display: "grid", gap: "1rem" }}>
                <p>There is no extra charge for delivery orders. However, please feel free to reward your driver for awesomeness. You must ask for limited time offers. Conditions Apply.</p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                    <div style={{ flex: "0 0 300px" }}>
                        <h4>Help and Service</h4>
                        <Link href={"/"}>Contact Us</Link>
                        <Link href={"/"}>Work With Us</Link>
                        <Link href={"/"}>FAQ</Link>
                    </div>

                    <div style={{ flex: "0 0 300px" }}>
                        <h4>Follow US</h4>

                        <div style={{ display: "flex", gap: ".3rem" }}>
                            <svg style={{ fill: "#df4f2d" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" /></svg>

                            <svg style={{ fill: "#df4f2d" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" /></svg>

                            <svg style={{ fill: "#df4f2d" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
                        </div>
                    </div>

                    <div style={{ flex: "0 0 300px" }}>
                        <h4>Legal</h4>

                        <p>Terms of use</p>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", height: "75px", gap: '1rem' }}>
                    <img alt="Open For Lunch" src="https://cache.dominos.com/olo/6.121.2/assets/build/market/JM/_en/images/img/footer-links/footerOpenLunch.gif" />

                    <img alt="Sponsor" src="https://cache.dominos.com/olo/6.121.2/assets/build/market/JM/_en/images/img/footer-links/footer-sponsor2.jpg" />

                    <img alt="Powered by FAC" src="https://cache.dominos.com/olo/6.121.2/assets/build/market/JM/_en/images/img/footer-links/poweredByFAC.gif" />

                    <img alt="general.credit_cards" src="https://cache.dominos.com/olo/6.121.2/assets/build/market/JM/_en/images/img/footer-links/credit-card-icons.png" />
                </div>

                <p style={{ textAlign: "center" }}>© 2023 Max Brands Inc. All rights reserved</p>
            </footer>
        </div>
    )
}

function EachPizzaSlice({ imgSrc, rotation, translateAmt, randomlyPull }: { imgSrc: string, rotation: number, translateAmt: number, randomlyPull: boolean }) {

    return (
        <div className={styles.pizzaSliceFocusPoint} style={{ height: "100%", aspectRatio: "1/1", rotate: `${rotation}deg`, position: "absolute", transform: `translateX(${translateAmt}%)` }}>
            {/* <img src={imgSrc} className={`${styles.pizzaSlice} ${randomlyPull ? styles.moveSideToSide : ""}`} alt="pizzaSlice" style={{ height: "100%", aspectRatio: "1/1", objectFit: "contain", position: "relative", rotate: "90deg" }} /> */}
            <Image priority={true} src={imgSrc} width={500} height={500} className={`${styles.pizzaSlice} ${randomlyPull ? styles.moveSideToSide : ""}`} alt="pizzaSlice" style={{ height: "100%", aspectRatio: "1/1", objectFit: "contain", position: "relative", rotate: "90deg" }} />
        </div>
    )
}