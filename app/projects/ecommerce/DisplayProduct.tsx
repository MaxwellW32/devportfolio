import React from 'react'
import { formatter, product } from './ecommerceGlobal'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'

export default function DisplayProduct({ product, fullscreen = true }: { product: product, fullscreen?: boolean }) {
    return (
        <div style={{ display: "grid", gridTemplateRows: "200px", backgroundColor: "#fff", color: "#000", padding: "1rem", height: "90vh" }}>
            <Image alt='image' src={product.imgSrc} width={1000} height={1000} style={{ aspectRatio: "1/1", height: "100%" }} />

            <h3 style={{ minHeight: "50px" }}>{product.name}</h3>

            <p>{formatter.format(product.price)}</p>

            <div style={{ justifySelf: "flex-end" }}>
                <AddToCartButton product={product} />
            </div>

            <p style={{ padding: "1rem", overflow: "auto" }}>{product.desc}</p>
        </div>
    )
}
