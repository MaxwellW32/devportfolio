"use client"
import React, { useRef, useState } from 'react'
import { formatter, product, products } from './ecommerceGlobal'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'

export default function Search() {
    const [search, searchSet] = useState("")
    const [results, resultsSet] = useState<product[]>()

    const searchTimeOut = useRef<NodeJS.Timeout>()

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", margin: " 1rem 1rem 1rem auto", alignItems: "center", position: "relative" }}>
            <div>
                <input type="text" placeholder="search..." value={search} onChange={(e) => {
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

                {results && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", position: "absolute", backgroundColor: "orange", padding: "1rem", zIndex: 1, maxHeight: "60vh" }}>
                        {results.map(eachProduct => {
                            return (
                                <div key={eachProduct.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                    <Image alt={`${eachProduct.name} img`} src={eachProduct.imgSrc} width={100} height={100} style={{ objectFit: "cover", height: "2rem", width: "2rem", borderRadius: ".5rem", }} />

                                    <div style={{ display: "grid", gap: ".5rem", width: "100%", overflow: "auto" }}>
                                        <p>{eachProduct.name}</p>

                                        <p>{formatter.format(eachProduct.price)}</p>

                                        <AddToCartButton product={eachProduct} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
            </div>
        </div>
    )
}
