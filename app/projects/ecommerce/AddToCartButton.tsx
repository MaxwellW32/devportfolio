"use client"
import React from 'react'
import { product, productCartGlobal } from './ecommerceGlobal'
import { useAtom } from 'jotai'
import styles from "./page.module.css"

export default function AddToCartButton({ product }: { product: product }) {
    const [, cartProductsSet] = useAtom(productCartGlobal)

    return (
        <button style={{}} className={styles.utilityButton} onClick={() => {
            cartProductsSet(prev => {
                let newCartProducts = prev ? [...prev] : [{ product: product, quantity: 1 }]
                if (newCartProducts.find(eachCartObj => eachCartObj.product.id === product.id) === undefined) {
                    //not in cart as yet
                    newCartProducts = [...newCartProducts, { product: product, quantity: 1 }]
                } else {
                    //in cart already
                    newCartProducts = newCartProducts.map(eachCartObj => {
                        if (eachCartObj.product.id === product.id) {
                            eachCartObj.quantity++
                        }

                        return eachCartObj
                    })
                }
                return newCartProducts
            })
        }}>Add To Cart</button>
    )
}
