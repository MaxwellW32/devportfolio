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

    return (
        <div style={{ position: "relative", zIndex: 1, flexBasis: "300px" }}>
            <p onClick={() => { cartOpenedSet(prev => !prev) }} style={{ cursor: "pointer", }}>cart {cartProducts && cartProducts.length > 0 && cartProducts.length}</p>

            <div style={{ display: !cartOpened ? "none" : "", position: "absolute", padding: "1rem", backgroundColor: "orange" }}>
                {cartProducts === undefined ? (
                    <p>No Items</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateRows: "1fr auto", maxHeight: "60vh", }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto" }}>
                            {cartProducts.map(eachCartObj => {
                                return (
                                    <div key={eachCartObj.product.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <Image alt={`${eachCartObj.product.name} img`} src={eachCartObj.product.imgSrc} width={100} height={100} style={{ objectFit: "cover", height: "2rem", width: "2rem", borderRadius: ".5rem", }} />

                                        <div style={{ display: "grid", gap: ".5rem", width: "100%", overflow: "auto" }}>
                                            <p>{eachCartObj.product.name}</p>

                                            <p>{formatter.format(eachCartObj.product.price * (eachCartObj.quantity > 0 ? eachCartObj.quantity : 1))}</p>

                                            <div style={{ display: "flex", gap: ".5rem", justifyContent: "center" }}>
                                                <p onClick={() => {
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
                                                }}>-</p>

                                                <input style={{ textAlign: "center", padding: 0, width: "50%" }} type='number' value={eachCartObj.quantity} onChange={(e) => {
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

                                                <p onClick={() => {
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
                                                }}>+</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div>
                            <p>Total: {formatter.format(totalPrice)}</p>

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
