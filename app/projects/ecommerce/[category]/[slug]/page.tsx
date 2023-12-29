import { isInObj } from '@/useful/functions';
import React from 'react'
import { productCategory, products } from '../../ecommerceGlobal';
import DisplayProduct from '../../DisplayProduct';

export default function Page({ params }: { params: { category: string, slug: string } }) {
    const category = isInObj(products, params.category) as productCategory
    if (!category) return <p>Category not seen</p>

    const seenProduct = products[category].find(eachProduct => eachProduct.slug === params.slug)
    if (!seenProduct) return <p>Product not seen</p>

    return (
        <main>
            <DisplayProduct product={seenProduct} />
        </main>
    )
}
