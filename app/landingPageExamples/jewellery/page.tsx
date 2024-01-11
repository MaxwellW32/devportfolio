"use client"
import { useEffect, useLayoutEffect, useRef } from 'react'
import styles from './styles.module.css'
import { Playfair_Display } from 'next/font/google'
import Image from 'next/image'

const playfair_display = Playfair_Display({
    subsets: ['latin'],
    weight: ["400", "500", "700"],
    variable: '--font-playfair_display',
    display: 'swap',
})


const arrivalItems = [
    {
        title: "Antique Art Deco 18K Gold Platinum Kashmir Sapphire Diamond Flexible Ring - AGL/SSEF/GIA",
        price: 39_704_100.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1777-5_720x.jpg?v=1699302784",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1777-1_360x.jpg?v=1699302783"
    },
    {
        title: "Antique Victorian 18K Yellow Gold Fancy Yellow Old Mine Diamond Bangle - GIA",
        price: 12_268_200.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/B0081-3_360x.jpg?v=1699302446",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/B0081-2_360x.jpg?v=1699302447"
    },
    {
        title: "Antique Georgian 18K Yellow Gold and Silver Top Old Mine Diamond Stud Earrings",
        price: 3_891_000.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/E0076-5_360x.jpg?v=1699302027",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/E0076-3_360x.jpg?v=1699302028"
    }, {
        title: "Antique Victorian 14K Yellow Gold Natural Sapphire and Diamond Three Stone Band - Size 4 3/4",
        price: 436_800.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1784-3_360x.jpg?v=1699301165",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1784-2_360x.jpg?v=1699301165"
    }, {
        title: "Vintage Retro 14K Yellow Gold Diamond and Emerald Engraved Bangle Bracelet",
        price: 436800.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/B0083-3_360x.jpg?v=1699300978",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/B0083-2_360x.jpg?v=1699300976"
    }, {
        title: "Antique Victorian 18K Yellow Gold Natural Ruby and Diamond Five Stone Band - GIA",
        price: 595600.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1778-3_360x.jpg?v=1699300851",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1778-2_360x.jpg?v=1699300852"
    }, {
        title: "Antique Victorian 15K Yellow Gold Garnet and Emerald Bangle Bracelet",
        price: 309700.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/B0082-3_360x.jpg?v=1699300229",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/B0082-2_360x.jpg?v=1699300230"
    }, {
        title: "Antique Art Deco 14K Yellow Gold Classic Milgrain Wedding Band - Size 7",
        price: 111200.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1783-2_360x.jpg?v=1699299517",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1783-1_360x.jpg?v=1699299518"
    }, {
        title: "Antique Art Deco Platinum Old European Diamond and Ruby Engagement Ring - GIA",
        price: 1786700.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1772-3_360x.jpg?v=1698080942",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1772-2_360x.jpg?v=1698080944"
    }, {
        title: "Antique Art Deco Platinum Arbutus Blossom Engraved Wedding Band - Size 7 1/2",
        price: 123100.00,
        image: "https://theantiqueparlour.com/cdn/shop/files/R1762-2_360x.jpg?v=1698080620",
        hoverImage: "https://theantiqueparlour.com/cdn/shop/files/R1762-1_360x.jpg?v=1698080619"
    }

]


export default function Page() {

    const navItemsContainer = useRef<HTMLUListElement>(null!)
    const arrivalItemsRefs = useRef<HTMLDivElement[]>([])

    const addToArrivalItemsRefs = (seenRef: HTMLDivElement | null, arrIndex: number) => {
        if (!seenRef) return
        arrivalItemsRefs.current[arrIndex] = seenRef
    }

    //animate all nav items 
    useEffect(() => {
        navItemsContainer.current.style.opacity = "1"

        navItemsContainer.current.childNodes.forEach((eachChild, eachChildIndex) => {
            const seenEl = eachChild as HTMLLIElement | HTMLDivElement
            seenEl.classList.add(styles.animOpacity)
            seenEl.style.animationDelay = `${eachChildIndex * 150}ms`
        })
    }, [])

    //intersection observer for arrivalItems
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(eachEntry => {
                if (eachEntry.isIntersecting) {
                    const seenDiv = eachEntry.target as HTMLElement
                    seenDiv.style.animationPlayState = "running";

                } else {
                    const seenDiv = eachEntry.target as HTMLElement
                    seenDiv.style.animationPlayState = "paused";
                }
            })
        })

        arrivalItemsRefs.current.forEach(eachSeenDiv => {
            observer.observe(eachSeenDiv)
        })
    }, [])

    //intersection observer for normal Animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(eachEntry => {
                if (eachEntry.isIntersecting) {
                    const seenDiv = eachEntry.target as HTMLElement
                    seenDiv.style.animationPlayState = "running";

                } else {
                    const seenDiv = eachEntry.target as HTMLElement
                    seenDiv.style.animationPlayState = "paused";
                }
            })
        })

        const seenEls = document.querySelectorAll(`.${styles.fadeBottomUp}`)
        seenEls.forEach(eachSeenDiv => {
            observer.observe(eachSeenDiv)
        })
    }, [])

    return (
        <div className={`${styles.artisticMainDiv} ${playfair_display.variable}`} style={{ backgroundColor: "#fff" }}>
            <nav style={{ background: "linear-gradient(to right, pink, #d48592)", display: "grid", gridTemplateColumns: "min(1020px, 100%)", justifyContent: "center", zIndex: "10", position: "relative" }}>
                <div className={styles.transformTopDown} style={{ backgroundColor: "#fff", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", padding: '.5rem 1rem', gap: "1rem" }}>
                    <Image width={200} height={70} style={{ height: "4rem" }} src={require("@/public/landingPageExamples/fashionStore/artlogo.png").default.src} alt='logo' />

                    <p style={{ color: "#cd7b86" }} className={styles.makeBold}>FREE INSURED SHIPPING ON ALL DOMESTIC U.S ORDERS!</p>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
                    </div>
                </div>

                <ul ref={navItemsContainer} className={`${styles.navItemsCont}`} style={{ display: "flex", overflowX: "auto", opacity: 0 }}>
                    <li>our collection <svg style={{ height: "1rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                        <ul>
                            <li>Bracelets</li>
                            <li>Earrings</li>
                            <li>Necklaces</li>
                            <li>Pendants</li>
                        </ul>
                    </li>

                    <li>shop by era <svg style={{ height: "1rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                        <ul>
                            <li>Georgian</li>
                            <li>Victorian</li>
                            <li>Art Nouveau</li>
                            <li>Edwardian</li>
                            <li>Art Deco</li>
                            <li>Retro</li>
                        </ul>
                    </li>

                    <li>about us</li>
                    <li>blog</li>
                    <li>sell your jewels</li>
                    <li>contact</li>

                    <div style={{ flex: 1, backgroundColor: "#cd7b86", display: "grid", justifyItems: 'center', alignItems: "center", padding: "1rem" }}>
                        <svg style={{ fill: "#000" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" /></svg>
                    </div>
                </ul>
            </nav>

            <section className={`${styles.darkBackdrop}`} style={{ paddingBlock: "5rem", backgroundImage: `url(${require("@/public/landingPageExamples/fashionStore/artsectionbg1.png").default.src})`, backgroundColor: "pink" }}>
                <h2 className={`${styles.fadeRotateIn}`}>ANTIQUE JEWELRY!</h2>

                <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 400px) )", gap: "1rem", marginTop: "2rem", marginBottom: "3rem", justifyContent: "space-around" }}>
                    <div className={`${styles.heroItemsCont} ${styles.fadeBottomUp}`}>
                        <h3>ANTIQUE ENGAGEMENT RINGS</h3>
                        <p>A curated collection of Old European Cut, Old Mine Cut, and other old cut diamond engagement rings.</p>
                        <button style={{ backgroundColor: "rgba(141, 30, 49, 0.6)" }}>shop all</button>
                    </div>

                    <div className={`${styles.heroItemsCont} ${styles.fadeBottomUp}`}>
                        <h3>ANTIQUE WEDDING BANDS</h3>
                        <p>A curated collection of the most classic, timeless, and finest antique wedding bands at your fingertips. </p>
                        <button style={{ border: "3px solid #fff" }}>shop bracelets</button>
                    </div>
                </div>
            </section>

            <section style={{ display: "grid", gap: "1rem" }}>
                <h2 style={{ color: "pink" }}>NEW ARRIVALS!</h2>

                <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr) )", gap: "1rem", perspective: '200px', transformStyle: 'preserve-3d' }}>
                    {arrivalItems.map((eachItem, eachItemIndex) => {

                        return (
                            <div key={eachItemIndex} ref={(e) => addToArrivalItemsRefs(e, eachItemIndex)} className={`${styles.arrivalItem} ${styles.itemAnim}`} style={{ animationDelay: `${eachItemIndex * 50}ms` }}>
                                <div style={{ position: "relative" }}>
                                    <img style={{ objectFit: "cover", width: "100%", aspectRatio: "1/1", position: "relative" }} src={eachItem.image} alt='itemImg'

                                        onMouseEnter={(e) => {
                                            const seenIm = e.target as HTMLImageElement
                                            seenIm.src = eachItem.hoverImage
                                        }}
                                        onMouseLeave={(e) => {
                                            const seenIm = e.target as HTMLImageElement
                                            seenIm.src = eachItem.image
                                        }} />

                                    <button style={{ position: "absolute", bottom: "1rem", left: "50%", translate: "-50% 0", whiteSpace: "nowrap", width: "80%", textAlign: "center", backgroundColor: "#fff", paddingBlock: ".5rem", textTransform: "capitalize" }}>Quick View</button>
                                </div>

                                <p>{eachItem.title}</p>
                                <p>{eachItem.price.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                })}</p>
                            </div>
                        )
                    })}
                </div>

                <button className={styles.viewAllButton} style={{ justifySelf: "center", whiteSpace: "nowrap", textAlign: "center", backgroundColor: "#fff", paddingBlock: ".5rem", textTransform: "capitalize" }}>View All</button>
            </section>

            <footer style={{ backgroundColor: "#69181a", padding: "4rem 2rem", color: "#fff", display: "grid", justifyItems: "center", gap: "2rem", overflow: 'hidden' }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    <div className={`${styles.fadeBottomUp}`} style={{ flex: "1 0 250px", animationDelay: "0ms" }}>
                        <h3>DON&apos;T SEE WHAT YOU&apos;RE LOOKING FOR?</h3>
                        <br />
                        <p>Contact us by email with your request and we will work with you privately to source what you are looking for! You can set up an appointment at our office or an interactive appointment through FaceTime. It would be our pleasure to help you find the heirloom of your dreams.</p>
                    </div>

                    <div className={`${styles.fadeBottomUp}`} style={{ flex: "1 0 250px", animationDelay: "500ms" }}>
                        <h3>HAVE A QUESTION?</h3>
                        <br />

                        <ul style={{ display: "grid", gap: ".4rem" }}>
                            <li>About Us</li>
                            <li>Contact Us</li>
                            <li>Return Policy</li>
                            <li>Privacy Policy</li>
                            <li>Terms & Conditions</li>
                            <li>Frequently Asked Questions</li>
                        </ul>
                    </div>

                    <div className={`${styles.fadeBottomUp}`} style={{ flex: "1 0 250px", animationDelay: "1000ms" }}>
                        <h3>SIGN UP AND SAVE</h3>
                        <br />

                        <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>

                        <div style={{ borderBottom: "3px solid #fff", display: "flex", marginTop: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                            <input style={{ padding: ".5rem", flex: 1 }} type='text' placeholder='Enter your email' />

                            <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" /></svg>
                        </div>

                        <div style={{ fill: "#fff", display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "1rem" }}>
                            <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 3.094c4.206 0 4.7.019 6.363.094 1.538.069 2.369.325 2.925.544.738.287 1.262.625 1.813 1.175s.894 1.075 1.175 1.813c.212.556.475 1.387.544 2.925.075 1.662.094 2.156.094 6.363s-.019 4.7-.094 6.363c-.069 1.538-.325 2.369-.544 2.925-.288.738-.625 1.262-1.175 1.813s-1.075.894-1.813 1.175c-.556.212-1.387.475-2.925.544-1.663.075-2.156.094-6.363.094s-4.7-.019-6.363-.094c-1.537-.069-2.369-.325-2.925-.544-.737-.288-1.263-.625-1.813-1.175s-.894-1.075-1.175-1.813c-.212-.556-.475-1.387-.544-2.925-.075-1.663-.094-2.156-.094-6.363s.019-4.7.094-6.363c.069-1.537.325-2.369.544-2.925.287-.737.625-1.263 1.175-1.813s1.075-.894 1.813-1.175c.556-.212 1.388-.475 2.925-.544 1.662-.081 2.156-.094 6.363-.094zm0-2.838c-4.275 0-4.813.019-6.494.094-1.675.075-2.819.344-3.819.731-1.037.4-1.913.944-2.788 1.819S1.486 4.656 1.08 5.688c-.387 1-.656 2.144-.731 3.825-.075 1.675-.094 2.213-.094 6.488s.019 4.813.094 6.494c.075 1.675.344 2.819.731 3.825.4 1.038.944 1.913 1.819 2.788s1.756 1.413 2.788 1.819c1 .387 2.144.656 3.825.731s2.213.094 6.494.094 4.813-.019 6.494-.094c1.675-.075 2.819-.344 3.825-.731 1.038-.4 1.913-.944 2.788-1.819s1.413-1.756 1.819-2.788c.387-1 .656-2.144.731-3.825s.094-2.212.094-6.494-.019-4.813-.094-6.494c-.075-1.675-.344-2.819-.731-3.825-.4-1.038-.944-1.913-1.819-2.788s-1.756-1.413-2.788-1.819c-1-.387-2.144-.656-3.825-.731C20.812.275 20.275.256 16 .256z"></path><path d="M16 7.912a8.088 8.088 0 0 0 0 16.175c4.463 0 8.087-3.625 8.087-8.088s-3.625-8.088-8.088-8.088zm0 13.338a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 1 1 0 10.5zM26.294 7.594a1.887 1.887 0 1 1-3.774.002 1.887 1.887 0 0 1 3.774-.003z"></path></svg>
                            <svg aria-hidden="true" viewBox="0 0 14222 14222"><path d="M14222 7112c0 3549.352-2600.418 6491.344-6000 7024.72V9168h1657l315-2056H8222V5778c0-562 275-1111 1159-1111h897V2917s-814-139-1592-139c-1624 0-2686 984-2686 2767v1567H4194v2056h1806v4968.72C2600.418 13603.344 0 10661.352 0 7112 0 3184.703 3183.703 1 7111 1s7111 3183.703 7111 7111zm-8222 7025c362 57 733 86 1111 86-377.945 0-749.003-29.485-1111-86.28zm2222 0v-.28a7107.458 7107.458 0 0 1-167.717 24.267A7407.158 7407.158 0 0 0 8222 14137zm-167.717 23.987C7745.664 14201.89 7430.797 14223 7111 14223c319.843 0 634.675-21.479 943.283-62.013z"></path></svg>
                            <svg aria-hidden="true" viewBox="0 0 21 20"><path d="M-.196 15.803q0 1.23.812 2.092t1.977.861h14.946q1.165 0 1.977-.861t.812-2.092V3.909q0-1.23-.82-2.116T17.539.907H2.593q-1.148 0-1.969.886t-.82 2.116v11.894zm7.465-2.149V6.058q0-.115.066-.18.049-.016.082-.016l.082.016 7.153 3.806q.066.066.066.164 0 .066-.066.131l-7.153 3.806q-.033.033-.066.033-.066 0-.098-.033-.066-.066-.066-.131z"></path></svg>
                            <svg aria-hidden="true" viewBox="0 0 256 256"><path d="M0 128.002c0 52.414 31.518 97.442 76.619 117.239-.36-8.938-.064-19.668 2.228-29.393 2.461-10.391 16.47-69.748 16.47-69.748s-4.089-8.173-4.089-20.252c0-18.969 10.994-33.136 24.686-33.136 11.643 0 17.268 8.745 17.268 19.217 0 11.704-7.465 29.211-11.304 45.426-3.207 13.578 6.808 24.653 20.203 24.653 24.252 0 40.586-31.149 40.586-68.055 0-28.054-18.895-49.052-53.262-49.052-38.828 0-63.017 28.956-63.017 61.3 0 11.152 3.288 19.016 8.438 25.106 2.368 2.797 2.697 3.922 1.84 7.134-.614 2.355-2.024 8.025-2.608 10.272-.852 3.242-3.479 4.401-6.409 3.204-17.884-7.301-26.213-26.886-26.213-48.902 0-36.361 30.666-79.961 91.482-79.961 48.87 0 81.035 35.364 81.035 73.325 0 50.213-27.916 87.726-69.066 87.726-13.819 0-26.818-7.47-31.271-15.955 0 0-7.431 29.492-9.005 35.187-2.714 9.869-8.026 19.733-12.883 27.421a127.897 127.897 0 0 0 36.277 5.249c70.684 0 127.996-57.309 127.996-128.005C256.001 57.309 198.689 0 128.005 0 57.314 0 0 57.309 0 128.002z"></path></svg>
                            <svg aria-hidden="true" viewBox="0 0 2859 3333"><path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z"></path></svg>
                        </div>
                    </div>
                </div>

                <div className={`${styles.creditCardsCont} ${styles.fadeBottomUp}`} style={{ display: "flex", gap: '.5rem', animationDelay: "1000ms" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" aria-labelledby="pi-american_express"><title id="pi-american_express">American Express</title><g fill="none"><path fill="#000" d="M35,0 L3,0 C1.3,0 0,1.3 0,3 L0,21 C0,22.7 1.4,24 3,24 L35,24 C36.7,24 38,22.7 38,21 L38,3 C38,1.3 36.6,0 35,0 Z" opacity=".07"></path><path fill="#006FCF" d="M35,1 C36.1,1 37,1.9 37,3 L37,21 C37,22.1 36.1,23 35,23 L3,23 C1.9,23 1,22.1 1,21 L1,3 C1,1.9 1.9,1 3,1 L35,1"></path><path fill="#FFF" d="M8.971,10.268 L9.745,12.144 L8.203,12.144 L8.971,10.268 Z M25.046,10.346 L22.069,10.346 L22.069,11.173 L24.998,11.173 L24.998,12.412 L22.075,12.412 L22.075,13.334 L25.052,13.334 L25.052,14.073 L27.129,11.828 L25.052,9.488 L25.046,10.346 L25.046,10.346 Z M10.983,8.006 L14.978,8.006 L15.865,9.941 L16.687,8 L27.057,8 L28.135,9.19 L29.25,8 L34.013,8 L30.494,11.852 L33.977,15.68 L29.143,15.68 L28.065,14.49 L26.94,15.68 L10.03,15.68 L9.536,14.49 L8.406,14.49 L7.911,15.68 L4,15.68 L7.286,8 L10.716,8 L10.983,8.006 Z M19.646,9.084 L17.407,9.084 L15.907,12.62 L14.282,9.084 L12.06,9.084 L12.06,13.894 L10,9.084 L8.007,9.084 L5.625,14.596 L7.18,14.596 L7.674,13.406 L10.27,13.406 L10.764,14.596 L13.484,14.596 L13.484,10.661 L15.235,14.602 L16.425,14.602 L18.165,10.673 L18.165,14.603 L19.623,14.603 L19.647,9.083 L19.646,9.084 Z M28.986,11.852 L31.517,9.084 L29.695,9.084 L28.094,10.81 L26.546,9.084 L20.652,9.084 L20.652,14.602 L26.462,14.602 L28.076,12.864 L29.624,14.602 L31.499,14.602 L28.987,11.852 L28.986,11.852 Z"></path></g></svg>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 165.521 105.965" aria-labelledby="pi-apple_pay"><title id="pi-apple_pay">Apple Pay</title><path fill="#000" d="M150.698 0H14.823c-.566 0-1.133 0-1.698.003-.477.004-.953.009-1.43.022-1.039.028-2.087.09-3.113.274a10.51 10.51 0 0 0-2.958.975 9.932 9.932 0 0 0-4.35 4.35 10.463 10.463 0 0 0-.975 2.96C.113 9.611.052 10.658.024 11.696a70.22 70.22 0 0 0-.022 1.43C0 13.69 0 14.256 0 14.823v76.318c0 .567 0 1.132.002 1.699.003.476.009.953.022 1.43.028 1.036.09 2.084.275 3.11a10.46 10.46 0 0 0 .974 2.96 9.897 9.897 0 0 0 1.83 2.52 9.874 9.874 0 0 0 2.52 1.83c.947.483 1.917.79 2.96.977 1.025.183 2.073.245 3.112.273.477.011.953.017 1.43.02.565.004 1.132.004 1.698.004h135.875c.565 0 1.132 0 1.697-.004.476-.002.952-.009 1.431-.02 1.037-.028 2.085-.09 3.113-.273a10.478 10.478 0 0 0 2.958-.977 9.955 9.955 0 0 0 4.35-4.35c.483-.947.789-1.917.974-2.96.186-1.026.246-2.074.274-3.11.013-.477.02-.954.022-1.43.004-.567.004-1.132.004-1.699V14.824c0-.567 0-1.133-.004-1.699a63.067 63.067 0 0 0-.022-1.429c-.028-1.038-.088-2.085-.274-3.112a10.4 10.4 0 0 0-.974-2.96 9.94 9.94 0 0 0-4.35-4.35A10.52 10.52 0 0 0 156.939.3c-1.028-.185-2.076-.246-3.113-.274a71.417 71.417 0 0 0-1.431-.022C151.83 0 151.263 0 150.698 0z"></path><path fill="#FFF" d="M150.698 3.532l1.672.003c.452.003.905.008 1.36.02.793.022 1.719.065 2.583.22.75.135 1.38.34 1.984.648a6.392 6.392 0 0 1 2.804 2.807c.306.6.51 1.226.645 1.983.154.854.197 1.783.218 2.58.013.45.019.9.02 1.36.005.557.005 1.113.005 1.671v76.318c0 .558 0 1.114-.004 1.682-.002.45-.008.9-.02 1.35-.022.796-.065 1.725-.221 2.589a6.855 6.855 0 0 1-.645 1.975 6.397 6.397 0 0 1-2.808 2.807c-.6.306-1.228.511-1.971.645-.881.157-1.847.2-2.574.22-.457.01-.912.017-1.379.019-.555.004-1.113.004-1.669.004H14.801c-.55 0-1.1 0-1.66-.004a74.993 74.993 0 0 1-1.35-.018c-.744-.02-1.71-.064-2.584-.22a6.938 6.938 0 0 1-1.986-.65 6.337 6.337 0 0 1-1.622-1.18 6.355 6.355 0 0 1-1.178-1.623 6.935 6.935 0 0 1-.646-1.985c-.156-.863-.2-1.788-.22-2.578a66.088 66.088 0 0 1-.02-1.355l-.003-1.327V14.474l.002-1.325a66.7 66.7 0 0 1 .02-1.357c.022-.792.065-1.717.222-2.587a6.924 6.924 0 0 1 .646-1.981c.304-.598.7-1.144 1.18-1.623a6.386 6.386 0 0 1 1.624-1.18 6.96 6.96 0 0 1 1.98-.646c.865-.155 1.792-.198 2.586-.22.452-.012.905-.017 1.354-.02l1.677-.003h135.875"></path><g><g><path fill="#000" d="M43.508 35.77c1.404-1.755 2.356-4.112 2.105-6.52-2.054.102-4.56 1.355-6.012 3.112-1.303 1.504-2.456 3.959-2.156 6.266 2.306.2 4.61-1.152 6.063-2.858"></path><path fill="#000" d="M45.587 39.079c-3.35-.2-6.196 1.9-7.795 1.9-1.6 0-4.049-1.8-6.698-1.751-3.447.05-6.645 2-8.395 5.1-3.598 6.2-.95 15.4 2.55 20.45 1.699 2.5 3.747 5.25 6.445 5.151 2.55-.1 3.549-1.65 6.647-1.65 3.097 0 3.997 1.65 6.696 1.6 2.798-.05 4.548-2.5 6.247-5 1.95-2.85 2.747-5.6 2.797-5.75-.05-.05-5.396-2.101-5.446-8.251-.05-5.15 4.198-7.6 4.398-7.751-2.399-3.548-6.147-3.948-7.447-4.048"></path></g><g><path fill="#000" d="M78.973 32.11c7.278 0 12.347 5.017 12.347 12.321 0 7.33-5.173 12.373-12.529 12.373h-8.058V69.62h-5.822V32.11h14.062zm-8.24 19.807h6.68c5.07 0 7.954-2.729 7.954-7.46 0-4.73-2.885-7.434-7.928-7.434h-6.706v14.894z"></path><path fill="#000" d="M92.764 61.847c0-4.809 3.665-7.564 10.423-7.98l7.252-.442v-2.08c0-3.04-2.001-4.704-5.562-4.704-2.938 0-5.07 1.507-5.51 3.82h-5.252c.157-4.86 4.731-8.395 10.918-8.395 6.654 0 10.995 3.483 10.995 8.89v18.663h-5.38v-4.497h-.13c-1.534 2.937-4.914 4.782-8.579 4.782-5.406 0-9.175-3.222-9.175-8.057zm17.675-2.417v-2.106l-6.472.416c-3.64.234-5.536 1.585-5.536 3.95 0 2.288 1.975 3.77 5.068 3.77 3.95 0 6.94-2.522 6.94-6.03z"></path><path fill="#000" d="M120.975 79.652v-4.496c.364.051 1.247.103 1.715.103 2.573 0 4.029-1.09 4.913-3.899l.52-1.663-9.852-27.293h6.082l6.863 22.146h.13l6.862-22.146h5.927l-10.216 28.67c-2.34 6.577-5.017 8.735-10.683 8.735-.442 0-1.872-.052-2.261-.157z"></path></g></g></svg>
                    <svg viewBox="0 0 38 24" aria-labelledby="pi-discover" fill="none" xmlns="http://www.w3.org/2000/svg"><title id="pi-discover">Discover</title><path fill="#000" opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32z" fill="#fff"></path><path d="M3.57 7.16H2v5.5h1.57c.83 0 1.43-.2 1.96-.63.63-.52 1-1.3 1-2.11-.01-1.63-1.22-2.76-2.96-2.76zm1.26 4.14c-.34.3-.77.44-1.47.44h-.29V8.1h.29c.69 0 1.11.12 1.47.44.37.33.59.84.59 1.37 0 .53-.22 1.06-.59 1.39zm2.19-4.14h1.07v5.5H7.02v-5.5zm3.69 2.11c-.64-.24-.83-.4-.83-.69 0-.35.34-.61.8-.61.32 0 .59.13.86.45l.56-.73c-.46-.4-1.01-.61-1.62-.61-.97 0-1.72.68-1.72 1.58 0 .76.35 1.15 1.35 1.51.42.15.63.25.74.31.21.14.32.34.32.57 0 .45-.35.78-.83.78-.51 0-.92-.26-1.17-.73l-.69.67c.49.73 1.09 1.05 1.9 1.05 1.11 0 1.9-.74 1.9-1.81.02-.89-.35-1.29-1.57-1.74zm1.92.65c0 1.62 1.27 2.87 2.9 2.87.46 0 .86-.09 1.34-.32v-1.26c-.43.43-.81.6-1.29.6-1.08 0-1.85-.78-1.85-1.9 0-1.06.79-1.89 1.8-1.89.51 0 .9.18 1.34.62V7.38c-.47-.24-.86-.34-1.32-.34-1.61 0-2.92 1.28-2.92 2.88zm12.76.94l-1.47-3.7h-1.17l2.33 5.64h.58l2.37-5.64h-1.16l-1.48 3.7zm3.13 1.8h3.04v-.93h-1.97v-1.48h1.9v-.93h-1.9V8.1h1.97v-.94h-3.04v5.5zm7.29-3.87c0-1.03-.71-1.62-1.95-1.62h-1.59v5.5h1.07v-2.21h.14l1.48 2.21h1.32l-1.73-2.32c.81-.17 1.26-.72 1.26-1.56zm-2.16.91h-.31V8.03h.33c.67 0 1.03.28 1.03.82 0 .55-.36.85-1.05.85z" fill="#231F20"></path><path d="M20.16 12.86a2.931 2.931 0 100-5.862 2.931 2.931 0 000 5.862z" fill="url(#pi-paint0_linear)"></path><path opacity=".65" d="M20.16 12.86a2.931 2.931 0 100-5.862 2.931 2.931 0 000 5.862z" fill="url(#pi-paint1_linear)"></path><path d="M36.57 7.506c0-.1-.07-.15-.18-.15h-.16v.48h.12v-.19l.14.19h.14l-.16-.2c.06-.01.1-.06.1-.13zm-.2.07h-.02v-.13h.02c.06 0 .09.02.09.06 0 .05-.03.07-.09.07z" fill="#231F20"></path><path d="M36.41 7.176c-.23 0-.42.19-.42.42 0 .23.19.42.42.42.23 0 .42-.19.42-.42 0-.23-.19-.42-.42-.42zm0 .77c-.18 0-.34-.15-.34-.35 0-.19.15-.35.34-.35.18 0 .33.16.33.35 0 .19-.15.35-.33.35z" fill="#231F20"></path><path d="M37 12.984S27.09 19.873 8.976 23h26.023a2 2 0 002-1.984l.024-3.02L37 12.985z" fill="#F48120"></path><defs><linearGradient id="pi-paint0_linear" x1="21.657" y1="12.275" x2="19.632" y2="9.104" gradientUnits="userSpaceOnUse"><stop stopColor="#F89F20"></stop><stop offset=".25" stopColor="#F79A20"></stop><stop offset=".533" stopColor="#F68D20"></stop><stop offset=".62" stopColor="#F58720"></stop><stop offset=".723" stopColor="#F48120"></stop><stop offset="1" stopColor="#F37521"></stop></linearGradient><linearGradient id="pi-paint1_linear" x1="21.338" y1="12.232" x2="18.378" y2="6.446" gradientUnits="userSpaceOnUse"><stop stopColor="#F58720"></stop><stop offset=".359" stopColor="#E16F27"></stop><stop offset=".703" stopColor="#D4602C"></stop><stop offset=".982" stopColor="#D05B2E"></stop></linearGradient></defs></svg>
                    <svg aria-labelledby="pi-metapay" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><title id="pi-metapay">Meta Pay</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32z" fill="#fff"></path><path d="M4.983 12.986c0 .348.076.614.176.776a.6.6 0 00.524.3c.257 0 .491-.063.943-.688.362-.5.788-1.204 1.076-1.645l.486-.747c.337-.518.728-1.095 1.176-1.486.366-.319.76-.496 1.158-.496.667 0 1.302.386 1.788 1.111.532.794.79 1.793.79 2.825 0 .613-.12 1.064-.326 1.42-.2.345-.587.688-1.238.688v-.981c.558 0 .697-.513.697-1.1 0-.836-.195-1.764-.624-2.427-.305-.47-.7-.757-1.134-.757-.47 0-.848.354-1.274.986-.226.336-.457.745-.718 1.207l-.287.508c-.576 1.02-.722 1.254-1.01 1.637-.504.672-.935.927-1.502.927-.674 0-1.1-.291-1.363-.73C4.106 13.956 4 13.486 4 12.95l.983.035z" fill="#0081FB"></path><path d="M4.775 10.18C5.225 9.486 5.875 9 6.622 9c.432 0 .861.128 1.31.494.49.4 1.013 1.06 1.665 2.146l.234.39c.565.94.886 1.424 1.074 1.652.242.293.411.38.631.38.558 0 .697-.512.697-1.099l.867-.027c0 .613-.12 1.064-.326 1.42-.2.345-.587.688-1.238.688-.405 0-.764-.088-1.16-.462-.306-.287-.663-.798-.937-1.257l-.816-1.363c-.41-.684-.785-1.194-1.003-1.425-.234-.249-.534-.549-1.014-.549-.388 0-.718.273-.994.69l-.837-.498z" fill="url(#pi-paint0_linear_1164_3)"></path><path d="M6.606 9.988c-.388 0-.718.273-.994.69-.39.588-.629 1.466-.629 2.308 0 .348.076.614.176.776l-.838.552C4.106 13.956 4 13.486 4 12.95c0-.973.267-1.987.775-2.77C5.225 9.485 5.875 9 6.622 9l-.016.988z" fill="url(#pi-paint1_linear_1164_3)"></path><path d="M15.01 9.191h1.138l1.933 3.498 1.934-3.498h1.112v5.747h-.928v-4.405l-1.695 3.05h-.87l-1.696-3.05v4.405h-.927V9.191zm9.023 2.143c-.665 0-1.066.5-1.162 1.12h2.258c-.046-.638-.415-1.12-1.096-1.12zm-2.081 1.474c0-1.305.843-2.254 2.097-2.254 1.234 0 1.971.937 1.971 2.323v.255h-3.148c.111.674.559 1.129 1.28 1.129.576 0 .936-.176 1.277-.497l.493.603c-.465.427-1.055.674-1.803.674-1.358 0-2.167-.99-2.167-2.233zm5.193-1.392h-.854v-.76h.854V9.402h.895v1.256h1.297v.76H28.04v1.924c0 .657.21.89.726.89.236 0 .371-.02.57-.053v.752c-.248.07-.485.102-.742.102-.966 0-1.45-.528-1.45-1.584v-2.032zm5.96.739a1.207 1.207 0 00-1.17-.788c-.766 0-1.256.543-1.256 1.428 0 .863.451 1.433 1.22 1.433.603 0 1.034-.351 1.206-.788v-1.285zM34 14.938h-.878v-.6c-.246.353-.693.703-1.417.703-1.164 0-1.941-.975-1.941-2.246 0-1.283.796-2.241 1.99-2.241.591 0 1.055.236 1.368.653v-.55H34v4.281z" fill="#000000"></path><defs><linearGradient id="pi-paint0_linear_1164_3" x1="5.93" y1="12.703" x2="12.196" y2="13.019" gradientUnits="userSpaceOnUse"><stop stopColor="#0064E1"></stop><stop offset=".4" stopColor="#0064E1"></stop><stop offset=".83" stopColor="#0073EE"></stop><stop offset="1" stopColor="#0082FB"></stop></linearGradient><linearGradient id="pi-paint1_linear_1164_3" x1="5.424" y1="13.399" x2="5.424" y2="11.089" gradientUnits="userSpaceOnUse"><stop stopColor="#0082FB"></stop><stop offset="1" stopColor="#0064E0"></stop></linearGradient></defs></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" aria-labelledby="pi-google_pay"><title id="pi-google_pay">Google Pay</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"></path><path d="M18.093 11.976v3.2h-1.018v-7.9h2.691a2.447 2.447 0 0 1 1.747.692 2.28 2.28 0 0 1 .11 3.224l-.11.116c-.47.447-1.098.69-1.747.674l-1.673-.006zm0-3.732v2.788h1.698c.377.012.741-.135 1.005-.404a1.391 1.391 0 0 0-1.005-2.354l-1.698-.03zm6.484 1.348c.65-.03 1.286.188 1.778.613.445.43.682 1.03.65 1.649v3.334h-.969v-.766h-.049a1.93 1.93 0 0 1-1.673.931 2.17 2.17 0 0 1-1.496-.533 1.667 1.667 0 0 1-.613-1.324 1.606 1.606 0 0 1 .613-1.336 2.746 2.746 0 0 1 1.698-.515c.517-.02 1.03.093 1.49.331v-.208a1.134 1.134 0 0 0-.417-.901 1.416 1.416 0 0 0-.98-.368 1.545 1.545 0 0 0-1.319.717l-.895-.564a2.488 2.488 0 0 1 2.182-1.06zM23.29 13.52a.79.79 0 0 0 .337.662c.223.176.5.269.785.263.429-.001.84-.17 1.146-.472.305-.286.478-.685.478-1.103a2.047 2.047 0 0 0-1.324-.374 1.716 1.716 0 0 0-1.03.294.883.883 0 0 0-.392.73zm9.286-3.75l-3.39 7.79h-1.048l1.281-2.728-2.224-5.062h1.103l1.612 3.885 1.569-3.885h1.097z" fill="#5F6368"></path><path d="M13.986 11.284c0-.308-.024-.616-.073-.92h-4.29v1.747h2.451a2.096 2.096 0 0 1-.9 1.373v1.134h1.464a4.433 4.433 0 0 0 1.348-3.334z" fill="#4285F4"></path><path d="M9.629 15.721a4.352 4.352 0 0 0 3.01-1.097l-1.466-1.14a2.752 2.752 0 0 1-4.094-1.44H5.577v1.17a4.53 4.53 0 0 0 4.052 2.507z" fill="#34A853"></path><path d="M7.079 12.05a2.709 2.709 0 0 1 0-1.735v-1.17H5.577a4.505 4.505 0 0 0 0 4.075l1.502-1.17z" fill="#FBBC04"></path><path d="M9.629 8.44a2.452 2.452 0 0 1 1.74.68l1.3-1.293a4.37 4.37 0 0 0-3.065-1.183 4.53 4.53 0 0 0-4.027 2.5l1.502 1.171a2.715 2.715 0 0 1 2.55-1.875z" fill="#EA4335"></path></svg>
                    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path></svg>
                    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-paypal"><title id="pi-paypal">PayPal</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"></path><path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"></path><path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" aria-labelledby="pi-shopify_pay"><title id="pi-shopify_pay">Shop Pay</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000"></path><path d="M35.889 0C37.05 0 38 .982 38 2.182v19.636c0 1.2-.95 2.182-2.111 2.182H2.11C.95 24 0 23.018 0 21.818V2.182C0 .982.95 0 2.111 0H35.89z" fill="#5A31F4"></path><path d="M9.35 11.368c-1.017-.223-1.47-.31-1.47-.705 0-.372.306-.558.92-.558.54 0 .934.238 1.225.704a.079.079 0 00.104.03l1.146-.584a.082.082 0 00.032-.114c-.475-.831-1.353-1.286-2.51-1.286-1.52 0-2.464.755-2.464 1.956 0 1.275 1.15 1.597 2.17 1.82 1.02.222 1.474.31 1.474.705 0 .396-.332.582-.993.582-.612 0-1.065-.282-1.34-.83a.08.08 0 00-.107-.035l-1.143.57a.083.083 0 00-.036.111c.454.92 1.384 1.437 2.627 1.437 1.583 0 2.539-.742 2.539-1.98s-1.155-1.598-2.173-1.82v-.003zM15.49 8.855c-.65 0-1.224.232-1.636.646a.04.04 0 01-.069-.03v-2.64a.08.08 0 00-.08-.081H12.27a.08.08 0 00-.08.082v8.194a.08.08 0 00.08.082h1.433a.08.08 0 00.081-.082v-3.594c0-.695.528-1.227 1.239-1.227.71 0 1.226.521 1.226 1.227v3.594a.08.08 0 00.081.082h1.433a.08.08 0 00.081-.082v-3.594c0-1.51-.981-2.577-2.355-2.577zM20.753 8.62c-.778 0-1.507.24-2.03.588a.082.082 0 00-.027.109l.632 1.088a.08.08 0 00.11.03 2.5 2.5 0 011.318-.366c1.25 0 2.17.891 2.17 2.068 0 1.003-.736 1.745-1.669 1.745-.76 0-1.288-.446-1.288-1.077 0-.361.152-.657.548-.866a.08.08 0 00.032-.113l-.596-1.018a.08.08 0 00-.098-.035c-.799.299-1.359 1.018-1.359 1.984 0 1.46 1.152 2.55 2.76 2.55 1.877 0 3.227-1.313 3.227-3.195 0-2.018-1.57-3.492-3.73-3.492zM28.675 8.843c-.724 0-1.373.27-1.845.746-.026.027-.069.007-.069-.029v-.572a.08.08 0 00-.08-.082h-1.397a.08.08 0 00-.08.082v8.182a.08.08 0 00.08.081h1.433a.08.08 0 00.081-.081v-2.683c0-.036.043-.054.069-.03a2.6 2.6 0 001.808.7c1.682 0 2.993-1.373 2.993-3.157s-1.313-3.157-2.993-3.157zm-.271 4.929c-.956 0-1.681-.768-1.681-1.783s.723-1.783 1.681-1.783c.958 0 1.68.755 1.68 1.783 0 1.027-.713 1.783-1.681 1.783h.001z" fill="#fff"></path></svg>
                    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-venmo"><title id="pi-venmo">Venmo</title><g fill="none" fillRule="evenodd"><rect fillOpacity=".07" fill="#000" rx="3"></rect><path fill="#3D95CE" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M24.675 8.36c0 3.064-2.557 7.045-4.633 9.84h-4.74L13.4 6.57l4.151-.402 1.005 8.275c.94-1.566 2.099-4.025 2.099-5.702 0-.918-.154-1.543-.394-2.058l3.78-.783c.437.738.634 1.499.634 2.46z" fill="#FFF" fillRule="nonzero"></path></g></svg>
                    <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
                </div>

                <div className={`${styles.fadeBottomUp}`} style={{ animationDelay: "1500ms" }}>
                    <p style={{ marginBottom: "1rem" }}>© 2023 Grand Diamonds</p>
                    <p>© The Grand Diamonds</p>
                </div>
            </footer>
        </div>
    )
}
