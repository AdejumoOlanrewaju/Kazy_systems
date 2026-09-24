"use client"
import React, { useState } from 'react'
import { Check, MessageCircle, Shield, ShoppingCart, Star } from 'lucide-react'
import { useLaptopStore } from '@/store/laptopStore'
import { useCartStore } from '@/store/cartStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import WhatsappBtn from './WhatsappBtn'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const ProductDetailsUI = ({ productId }: { productId: string }) => {
    const { laptopStoreData, loadingStore } = useLaptopStore()
    const laptopProduct = laptopStoreData.find(
        (lap) => lap.dbID === productId || lap.id === productId
    )
    const [mainImage, setMainImage] = useState<string | undefined>(undefined)

    React.useEffect(() => {
        setMainImage(laptopProduct?.images?.[0])
    }, [laptopProduct?.dbID, laptopProduct?.id, laptopProduct?.images])

    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = () => {
        if (!laptopProduct) return
        const alreadyInCart = useCartStore.getState().items.some((i) => i.id === laptopProduct.dbID)
        if (alreadyInCart) {
            toast.info(`${laptopProduct.name} is already in your cart`)
            return
        }
        addItem(laptopProduct)
        toast.success(`${laptopProduct.name} added to cart`)
    }

    const inStock = (laptopProduct?.stockQuantity ?? 0) > 0
    const lowStock = inStock && (laptopProduct?.stockQuantity ?? 0) <= 3
    const savings =
        laptopProduct?.oldPrice && laptopProduct?.price
            ? laptopProduct.oldPrice - laptopProduct.price
            : 0

    return (
        <>
            {loadingStore ? (
                <div className="grid lg:grid-cols-2 gap-12">
                    <Skeleton className="h-[520px] rounded-2xl" />
                    <div className="mt-4">
                        <div className="flex flex-col gap-5">
                            <Skeleton className="h-[30px] rounded-xl" />
                            <Skeleton className="h-[30px] rounded-xl" />
                            <Skeleton className="h-[30px] rounded-xl" />
                        </div>
                        <div className="flex flex-col gap-5 mt-20">
                            <Skeleton className="h-[40px] rounded-xl" />
                            <Skeleton className="h-[30px] rounded-xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <img
                                src={mainImage}
                                alt={laptopProduct?.name}
                                className="w-full h-[330px] sm:h-[450px] object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {laptopProduct?.images.map((img, i) => (
                                <button
                                    type="button"
                                    onClick={() => setMainImage(img)}
                                    key={i}
                                    className={`bg-white rounded-lg p-2 border transition-colors flex items-center justify-center ${
                                        mainImage === img
                                            ? 'border-amber-500 ring-2 ring-amber-500/40'
                                            : 'border-gray-200 hover:border-amber-400'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${laptopProduct?.name} view ${i}`}
                                        className="w-full h-[50px] sm:h-[76px] rounded object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-amber-500 text-slate-900 border-0 font-semibold hover:bg-amber-500">
                                    {laptopProduct?.tag}
                                </Badge>
                                <Badge
                                    className={`border-0 text-white ${
                                        inStock ? (lowStock ? 'bg-amber-600' : 'bg-emerald-600') : 'bg-red-500'
                                    }`}
                                >
                                    {inStock
                                        ? lowStock
                                            ? `Only ${laptopProduct?.stockQuantity} left`
                                            : `${laptopProduct?.stockQuantity} in stock`
                                        : 'Out of stock'}
                                </Badge>
                            </div>

                            <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
                                {laptopProduct?.name}
                            </h1>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < Math.floor((laptopProduct?.rating)!)
                                                    ? 'fill-amber-500 text-amber-500'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold text-slate-900">{laptopProduct?.rating}</span>
                                <span className="text-gray-500 text-sm">({laptopProduct?.reviews} reviews)</span>
                            </div>
                        </div>

                        <div className="border-t border-b border-gray-200 py-6">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-5xl font-bold text-slate-900">
                                    ₦{laptopProduct?.price.toLocaleString()}
                                </span>
                                {laptopProduct?.oldPrice ? (
                                    <span className="text-xl text-gray-400 line-through">
                                        ₦{laptopProduct.oldPrice.toLocaleString()}
                                    </span>
                                ) : null}
                            </div>
                            {savings > 0 && (
                                <span className="inline-block mt-3 text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                    You save ₦{savings.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{laptopProduct?.description}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Key features</h3>
                            <ul className="space-y-2">
                                {laptopProduct?.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div className="text-sm text-gray-700">
                                <span className="font-semibold text-slate-900">Warranty: </span>
                                {laptopProduct?.warranty}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                size="lg"
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold disabled:opacity-60"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {inStock ? 'Add to cart' : 'Out of stock'}
                            </Button>
                            <WhatsappBtn product={laptopProduct} />
                            <p className="sm:text-center text-sm text-gray-500 flex items-center justify-center gap-1.5">
                                <MessageCircle className="w-5 h-5" />
                                Or chat with us on WhatsApp to place your order
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProductDetailsUI