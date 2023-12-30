"use client"
import React, { useEffect, useRef, useState } from 'react'
import { formatter, product } from './ecommerceGlobal'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import Link from 'next/link'
import styles from "./page.module.css"
export default function DisplayProduct({ product, fullscreen = true }: { product: product, fullscreen?: boolean }) {
    const [descOverFlowing, descOverFlowingSet] = useState(false)
    const [showDescriptionFull, showDescriptionFullSet] = useState(false)

    const descRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        if (descRef.current) {
            descOverFlowingSet(descRef.current.scrollHeight > descRef.current.clientHeight);
        }
    }, [])

    return (
        <div style={{ display: "grid", backgroundColor: "#fff", color: "#000", padding: "1rem", alignContent: "flex-start" }}>
            <Image alt='image' src={product.imgSrc} width={1000} height={1000} style={{ height: !fullscreen ? "200px" : "", width: !fullscreen ? "" : "60%", objectFit: "contain", }} />

            <h3 style={{ minHeight: "50px" }}>
                <Link href={`/projects/ecommerce/${product.forCategory}/${product.slug}`}>
                    {product.name}
                </Link>
            </h3>

            <p>{formatter.format(product.price)}</p>

            <div style={{ justifySelf: !fullscreen ? "flex-end" : "flex-start" }}>
                <AddToCartButton product={product} />
            </div>

            <p ref={descRef} className={styles.descText} style={{ display: showDescriptionFull ? "block" : "-webkit-box", maxHeight: "200px", overflow: !showDescriptionFull ? "hidden" : "auto" }}>
                {product.desc}
            </p>

            {descOverFlowing && (
                <p style={{ color: "var(--backgroundColor)", fontWeight: "bold", cursor: "pointer" }} onClick={() => { showDescriptionFullSet(prev => !prev) }}>{showDescriptionFull ? "Show Less" : "Show More"}</p>
            )}
        </div>
    )
}
