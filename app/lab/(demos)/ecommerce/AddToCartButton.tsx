"use client"
import React from 'react'
import { product, productCartGlobal } from './ecommerceGlobal'
import { useAtom } from 'jotai'
import styles from "./page.module.css"
import { toast } from 'react-hot-toast'

export default function AddToCartButton({ product }: { product: product }) {
    const [, cartProductsSet] = useAtom(productCartGlobal)

    return (
        <button style={{}} className={styles.utilityButton} onClick={() => {
            cartProductsSet(prev => {
                let newCartProducts = prev ? [...prev] : []

                if (newCartProducts.find(eachCartObj => eachCartObj.product.id === product.id) === undefined) {
                    //not in cart as yet
                    toast.success(`${product.name} added to cart`)
                    newCartProducts = [...newCartProducts, { product: product, quantity: 1 }]
                } else {
                    //in cart already
                    toast.success("added extra to cart")

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
