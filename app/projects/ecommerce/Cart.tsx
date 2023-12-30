"use client"

import { useAtom } from 'jotai'
import React, { useEffect, useMemo, useState } from 'react'
import { formatter, productCartGlobal } from './ecommerceGlobal'
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/saveToStorage'
import Image from 'next/image'
import styles from "./page.module.css"
import Link from 'next/link'

// const addIds = () => {
//     const newProducts: { [key in productCategory]: product[] } = JSON.parse(JSON.stringify(products))

//     // for (const key in newProducts) {
//     //     newProducts[key as productCategory] = newProducts[key as productCategory].map(eachProduct => {
//     //         eachProduct.id = uuidV4()
//     //         return eachProduct
//     //     })
//     // }

//     for (const key in newProducts) {
//         newProducts[key as productCategory].forEach(eachProduct => {
//             console.log(`id:`, `"${uuidV4()}",`);
//         })
//     }

//     // console.log(`$newProducts`, newProducts);
// }
// <button onClick={addIds}>make ids</button>



export default function Cart() {
    const [cartOpened, cartOpenedSet] = useState(false)
    const [cartProducts, cartProductsSet] = useAtom(productCartGlobal)

    //get cart from storage
    useEffect(() => {
        const seenCart = retreiveFromLocalStorage("cart")
        if (seenCart) {
            cartProductsSet(seenCart)
        }
    }, [])

    //save items to storage
    useEffect(() => {
        if (cartProducts) {
            saveToLocalStorage("cart", cartProducts)
        }
    }, [cartProducts])

    const totalPrice = useMemo(() => {
        if (!cartProducts) return 0

        return cartProducts.reduce((accumulatedTotal, eachProduct) => (eachProduct.product.price * (eachProduct.quantity > 0 ? eachProduct.quantity : 1)) + accumulatedTotal, 0)
    }, [cartProducts])

    const AmountOfItems = useMemo(() => {
        if (!cartProducts) return null

        return cartProducts.reduce((accumulatedTotal, eachProduct) => (eachProduct.quantity > 0 ? eachProduct.quantity : 1) + accumulatedTotal, 0)
    }, [cartProducts])


    return (
        <div style={{ position: "relative", }}>
            <div onClick={() => {
                cartOpenedSet(prev => !prev)
            }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: ".5rem" }}>
                {AmountOfItems !== null && AmountOfItems > 0 && <p>{AmountOfItems}</p>}

                <svg style={{ transform: "scaleX(-1)", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>
            </div>

            <div className={styles.cart} style={{ display: !cartOpened ? "none" : "flex", flexDirection: 'column', padding: "1rem", color: "#000", backgroundColor: "#fff" }}>
                <div style={{ margin: "0 1rem 0 auto", cursor: "pointer", display: "flex", gap: ".2rem", alignItems: 'center' }} onClick={() => { cartOpenedSet(false) }}>
                    <p>close</p>

                    <svg style={{ fill: "#000" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                </div>

                {cartProducts === undefined || cartProducts.length === 0 ? (
                    <p>No Items</p>
                ) : (
                    <div className={styles.cartProductsCont} style={{ display: "grid", }}>
                        <div className={styles.scrollBar} style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto" }}>
                            {cartProducts.map(eachCartObj => {
                                return (
                                    <div key={eachCartObj.product.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <Image alt={`${eachCartObj.product.name} img`} src={eachCartObj.product.imgSrc} width={100} height={100} style={{ objectFit: "cover", height: "2rem", width: "2rem", borderRadius: ".5rem", }} />

                                        <div style={{ display: "grid", gap: ".5rem", width: "100%", overflow: "auto" }}>
                                            <Link href={`/projects/ecommerce/${eachCartObj.product.forCategory}/${eachCartObj.product.slug}`}>
                                                {eachCartObj.product.name}
                                            </Link>

                                            <p>{formatter.format(eachCartObj.product.price * (eachCartObj.quantity > 0 ? eachCartObj.quantity : 1))}</p>

                                            <div style={{ display: "flex", gap: ".5rem", justifyContent: "center", overflowY: "clip" }}>
                                                <svg onClick={() => {
                                                    cartProductsSet(prevCart => {
                                                        if (!prevCart) return prevCart

                                                        return prevCart.filter(eachSmallCartObj => eachSmallCartObj.product.id !== eachCartObj.product.id)
                                                    })
                                                }} style={{ fill: 'var(--backgroundColor)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>

                                                <div style={{ padding: ".5rem", backgroundColor: "var(--backgroundColor)", cursor: "pointer" }}
                                                    onClick={() => {
                                                        cartProductsSet(prevCart => {
                                                            if (!prevCart) return prevCart

                                                            const newCart = prevCart.map(eachSmallCartObj => {
                                                                if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                    eachSmallCartObj.quantity--

                                                                    if (eachSmallCartObj.quantity < 1) {
                                                                        eachSmallCartObj.quantity = 1
                                                                    }
                                                                }

                                                                return eachSmallCartObj
                                                            })


                                                            return newCart
                                                        })
                                                    }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                                </div>

                                                <input style={{ textAlign: "center", padding: 0, width: "30%", backgroundColor: "#fff" }} type='number' value={eachCartObj.quantity} onChange={(e) => {
                                                    cartProductsSet(prevCart => {
                                                        if (!prevCart) return prevCart

                                                        const newCart = prevCart.map(eachSmallCartObj => {
                                                            if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                eachSmallCartObj.quantity = parseInt(e.target.value)
                                                            }

                                                            return eachSmallCartObj
                                                        })


                                                        return newCart
                                                    })
                                                }} />

                                                <div style={{ padding: ".5rem", backgroundColor: "var(--backgroundColor)", cursor: "pointer" }}
                                                    onClick={() => {
                                                        cartProductsSet(prevCart => {
                                                            if (!prevCart) return prevCart

                                                            const newCart = prevCart.map(eachSmallCartObj => {
                                                                if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                    eachSmallCartObj.quantity++
                                                                }

                                                                return eachSmallCartObj
                                                            })


                                                            return newCart
                                                        })
                                                    }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div style={{ margin: "1rem 1rem 1rem auto", display: "flex", gap: ".5rem", alignItems: "center", fontWeight: "bold" }}
                                onClick={() => {
                                    cartProductsSet(undefined)
                                    cartOpenedSet(false)
                                }} >
                                <p>Clear Cart</p>

                                <div >
                                    <svg style={{ fill: 'var(--backgroundColor)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                                </div>
                            </div>


                        </div>

                        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <p style={{ fontWeight: "bold" }}>Total: {formatter.format(totalPrice)}</p>

                            <Link href={`/projects/ecommerce/checkout`}>
                                <button className={styles.utilityButton}>Check Out</button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
