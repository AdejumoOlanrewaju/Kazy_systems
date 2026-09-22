import { Metadata } from 'next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ProductDetailsUI from '@/app/components/ProductDetailsUI'
import { extractIdFromSlug } from '@/lib/slug'

type Props = { params: Promise<{ slug: string }> }

// Fetches the product once here, shared by generateMetadata and the page itself.
async function getProduct(productId: string) {
    const snap = await getDoc(doc(db, "products", productId))
    if (!snap.exists()) return null
    return { dbID: snap.id, ...snap.data() } as any
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const productId = extractIdFromSlug(slug)
    const product = await getProduct(productId)

    if (!product) {
        return {
            title: "Product Not Found",
        }
    }

    const title = product.name
    const description = product.description
        ? product.description.slice(0, 155) // Google truncates around here anyway
        : `${product.name} — ₦${product.price?.toLocaleString()}. Available now at Kayzee Global Computer Networks.`
    const image = product.images?.[0]

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [{ url: image, width: 1200, height: 630, alt: product.name }] : undefined,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : undefined,
        },
    }
}

const page = async ({ params }: Props) => {
    const { slug } = await params
    const productId = extractIdFromSlug(slug)

    return (
        <>
            <div>
                {/* Product Details */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                   <ProductDetailsUI productId={productId} />
                </div>
            </div>
        </>
    )
}

export default page