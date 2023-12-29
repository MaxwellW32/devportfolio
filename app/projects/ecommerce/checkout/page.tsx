"use client"
import { useAtom } from 'jotai'
import React from 'react'
import { productCartGlobal } from '../ecommerceGlobal'

export default function page() {
    const [cartProducts, cartProductsSet] = useAtom(productCartGlobal)

    return (
        <main>
            <section>
                {cartProducts === undefined ? (
                    <p>nothing here keep shopping</p>
                ) : (
                    <p>Seeing items</p>
                )}
            </section>
        </main>
    )
}
