"use client"
import React, { useRef, useState } from 'react'
import { formatter, product, productCategory, products } from './ecommerceGlobal'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import styles from "./page.module.css"
import Link from 'next/link'

export default function Search() {
    const [search, searchSet] = useState("")
    const [results, resultsSet] = useState<product[]>()

    const searchTimeOut = useRef<NodeJS.Timeout>()

    return (
        <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
                <input type="text" style={{ width: "100%", paddingRight: "3rem" }} placeholder="search..." value={search} onChange={(e) => {
                    searchSet(e.target.value)
                    if (searchTimeOut.current) clearTimeout(searchTimeOut.current)

                    if (e.target.value === "") {
                        resultsSet(undefined)
                        return
                    }

                    searchTimeOut.current = setTimeout(() => {
                        const resultsToAdd: product[] = []
                        const localSearch = e.target.value

                        Object.values(products).forEach(productArr => {
                            productArr.forEach(eachProduct => {
                                if (eachProduct.name.toLowerCase().includes(localSearch.toLowerCase()) || eachProduct.desc.toLowerCase().includes(localSearch.toLowerCase())) {
                                    resultsToAdd.push(eachProduct)
                                }
                            })
                        })

                        resultsSet(resultsToAdd)
                    }, 500);
                }} />

                <div style={{ position: "absolute", top: "50%", right: "1rem", translate: "0 -50%" }} onClick={() => {
                    if (results) {
                        resultsSet(undefined)
                        searchSet("")
                    }
                }}>
                    {results ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
                    )}
                </div>
            </div>

            {results && (
                <div className={styles.scrollBar} style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", position: "absolute", color: "#000", backgroundColor: "#fff", padding: "1rem", maxHeight: "60vh" }}>
                    {results.length > 0 ? (
                        < >
                            {results.map(eachProduct => {
                                return (
                                    <div key={eachProduct.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <Image alt={`${eachProduct.name} img`} src={eachProduct.imgSrc} width={100} height={100} style={{ objectFit: "cover", height: "2rem", width: "2rem", borderRadius: ".5rem", }} />

                                        <div style={{ display: "grid", gap: ".5rem", width: "100%", overflow: "auto" }}>
                                            <Link href={`/projects/ecommerce/${eachProduct.forCategory}/${eachProduct.slug}`}>
                                                {eachProduct.name}
                                            </Link>

                                            <p>{formatter.format(eachProduct.price)}</p>

                                            <div style={{ justifySelf: "center" }}>
                                                <AddToCartButton product={eachProduct} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <>No items found</>
                    )}
                </div>
            )}
        </div>
    )
}
