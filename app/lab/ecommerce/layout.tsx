import Link from "next/link"
import styles from "./page.module.css"
import Cart from "./Cart"
import Search from "./Search"

export default function EcommerceRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <nav className={styles.nav} style={{ backgroundColor: "#000", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", top: 0, zIndex: 99, margin: "0 auto" }}>
                <ul className={styles.mainMenu}>
                    <li>
                        <Link href={"/projects/ecommerce"}>home</Link>
                    </li>

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

                <Search />

                <Cart />
            </nav>

            {children}

            <footer>
                <div>
                    small nav
                </div>

                <p>Contact US</p>
            </footer>
        </>
    )
}
