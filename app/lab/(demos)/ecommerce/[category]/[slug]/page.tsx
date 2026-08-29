import { isInObj } from '@/useful/functions';
import { productCategory, products } from '../../ecommerceGlobal';
import DisplayProduct from '../../DisplayProduct';

export default async function Page({ params }: { params: Promise<{ category: string, slug: string }> }) {
    const { category: categoryParam, slug } = await params
    const category = isInObj(products, categoryParam) as productCategory
    if (!category) return <p>Category not seen</p>

    const seenProduct = products[category].find(eachProduct => eachProduct.slug === slug)
    if (!seenProduct) return <p>Product not seen</p>

    return (
        <main>
            <DisplayProduct product={seenProduct} />
        </main>
    )
}
