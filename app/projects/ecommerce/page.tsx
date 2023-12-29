import styles from "./page.module.css"
import Link from "next/link"
import Image from "next/image"
import { products, type productCategory } from "./ecommerceGlobal"
import Cart from "./Cart"
import AddToCartButton from "./AddToCartButton"
import { isInObj } from "@/useful/functions"
import DisplayProduct from "./DisplayProduct"
import Search from "./Search"

type sortingMethods = "price-highlow" | "price-lowhigh" | "none"

export default function TechHaven({ searchParams }: { searchParams: { product: string, sort: sortingMethods } }) {
    const selectedCategory: productCategory = isInObj(products, searchParams.product) ?? "headphones"

    const bestSeller = products[selectedCategory].find(eachProduct => eachProduct.bestSeller) ?? products[selectedCategory][0]

    const sortingMethod: sortingMethods = searchParams.sort === ("price-highlow" || "price-lowhigh") ? searchParams.sort : "none"

    console.log(`$searchParams.sort`, searchParams.sort);
    console.log(`$sortingMethod`, sortingMethod);

    return (
        <div>
            <nav style={{ backgroundColor: "#000", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: "1rem" }}>
                <ul className={styles.mainMenu}>
                    <li>
                        <Link href={"/"}>about us</Link>
                    </li>

                    <li>
                        <Link href={"/"}>shipping</Link>
                    </li>

                    <li>
                        <Link href={"/"}>find stores</Link>
                    </li>
                </ul>

                <Cart />

                <Search />
            </nav>

            <main>
                <section style={{ position: "relative", paddingTop: 0 }}>
                    <Image alt="bg" src="/projects/ecommerce/bg.jpg" priority={true} width={1920} height={1192} style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, filter: "blur(4px)" }} />

                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255,0,0,.6)" }}></div>

                    <div style={{ position: "relative", }}>
                        <ul className={styles.secondNav}>
                            <li style={{ backgroundColor: selectedCategory === "desktops" ? "var(--backgroundColor)" : "" }}>
                                <Link href={`?product=desktops`}>desktops</Link>
                            </li>

                            <li style={{ backgroundColor: selectedCategory === "tablets" ? "var(--backgroundColor)" : "" }}>
                                <Link href={`?product=tablets`}>tablets</Link>
                            </li>

                            <li style={{ backgroundColor: selectedCategory === "phones" ? "var(--backgroundColor)" : "" }}>
                                <Link href={`?product=phones`}>phones</Link>
                            </li>

                            <li style={{ backgroundColor: selectedCategory === "cameras" ? "var(--backgroundColor)" : "" }}>
                                <Link href={`?product=cameras`}>cameras</Link>
                            </li>

                            <li style={{ backgroundColor: selectedCategory === "headphones" ? "var(--backgroundColor)" : "" }}>
                                <Link href={`?product=headphones`}>headphones</Link>
                            </li>
                        </ul>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                            <Image alt={`${bestSeller.name} image`} src={bestSeller.imgSrc} width={1920} height={1080} style={{ objectFit: "cover", flex: "1 1 300px", width: "min(300px, 100%)" }} />

                            <div style={{ flex: "2 1 300px", display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", padding: "1rem" }}>
                                <h1>{bestSeller.name}</h1>

                                <p>{bestSeller.desc}</p>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <AddToCartButton product={bestSeller} />

                                    <Link href={`/projects/ecommerce/${selectedCategory}/${bestSeller.slug}`}>
                                        <button className={styles.utilityButton}>Details</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ backgroundColor: "#eee", color: "#000", display: "flex", flexDirection: "column", }}>
                    <h2 style={{ marginBottom: "2rem" }}>Other items</h2>

                    {sortingMethod === "none" ? (
                        <Link style={{ marginLeft: "auto" }} href={`?product=${selectedCategory}&sort=price-highlow`}>Sort price high-low</Link>
                    ) : (
                        <Link style={{ marginLeft: "auto" }} href={`?product=${selectedCategory}`}>Sort price low-high</Link>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%), 1fr))", gap: "1rem" }}>
                        {products[selectedCategory].sort((productA, productB) => {
                            if (sortingMethod === "none") {
                                return productA.price - productB.price
                            } else {
                                return productB.price - productA.price
                            }
                        }).map(eachProduct => {
                            return (
                                <DisplayProduct key={eachProduct.id} product={eachProduct} />
                            )
                        })}
                    </div>
                </section>

                <section>
                    <h2>Contact Us</h2>

                    <h2>FAQ</h2>

                    <div>
                        <p>Question</p>

                        <div>
                            <p>answer</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div>
                    small nav
                </div>

                <p>Contact US</p>
            </footer>
        </div>
    )
}

function DisplayStarRating({ rating, maxRating = 5 }: { rating: number, maxRating?: number }) {
    // Calculate the number of full stars
    const fullStars = Math.floor(rating);

    // Calculate the remaining decimal value for half stars
    const halfStar = (rating - fullStars) >= 0.5 ? 1 : 0;

    // Calculate the number of empty stars
    const emptyStars = maxRating - fullStars - halfStar;

    // Create an array to hold the star images
    const stars = [];

    // Append full star images
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>
        );
    }

    // Append half star image if necessary
    if (halfStar) {
        stars.push(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M320 376.4l.1-.1 26.4 14.1 85.2 45.5-16.5-97.6-4.8-28.7 20.7-20.5 70.1-69.3-96.1-14.2-29.3-4.3-12.9-26.6L320.1 86.9l-.1 .3V376.4zm175.1 98.3c2 12-3 24.2-12.9 31.3s-23 8-33.8 2.3L320.1 439.8 191.8 508.3C181 514 167.9 513.1 158 506s-14.9-19.3-12.9-31.3L169.8 329 65.6 225.9c-8.6-8.5-11.7-21.2-7.9-32.7s13.7-19.9 25.7-21.7L227 150.3 291.4 18c5.4-11 16.5-18 28.8-18s23.4 7 28.8 18l64.3 132.3 143.6 21.2c12 1.8 22 10.2 25.7 21.7s.7 24.2-7.9 32.7L470.5 329l24.6 145.7z" /></svg>
        );
    }

    // Append empty star images
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.6 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z" /></svg>
        );
    }


    return (
        <div className={styles.ratingStar}>
            {stars.map((each, index) => {
                return (
                    <div key={index}>
                        {each}
                    </div>
                )
            })}
        </div>
    );
};
