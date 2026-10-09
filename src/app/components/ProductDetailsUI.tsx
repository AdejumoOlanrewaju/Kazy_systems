"use client"
import React, { useState, useEffect } from 'react'
import { Check, MessageCircle, Shield, ShoppingCart, Star } from 'lucide-react'
import { useLaptopStore } from '@/store/laptopStore'
import { useCartStore } from '@/store/cartStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import WhatsappBtn from './WhatsappBtn'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ProductConfiguration } from '@/lib/types'
import { getConfigurationLabel, getEffectivePrice, isDealLive } from '@/lib/productDisplay'
import DealCountdown from './DealCountdown'
import ReviewsSection from './ReviewsSection'

const ProductDetailsUI = ({ productId }: { productId: string }) => {
    const { laptopStoreData, loadingStore } = useLaptopStore()
    const laptopProduct = laptopStoreData.find(
        (lap) => lap.dbID === productId || lap.id === productId
    )
    const [mainImage, setMainImage] = useState<string | undefined>(undefined)
    const [selectedConfig, setSelectedConfig] = useState<ProductConfiguration | null>(null)

    useEffect(() => {
        setMainImage(laptopProduct?.images?.[0])
    }, [laptopProduct?.dbID, laptopProduct?.id, laptopProduct?.images])

    useEffect(() => {
        setSelectedConfig(laptopProduct?.configurations?.[0] || null)
    }, [laptopProduct?.dbID, laptopProduct?.id, laptopProduct?.configurations])

    const addItem = useCartStore((state) => state.addItem)

    // Everything below reads from these, not from laptopProduct directly —
    // this is what actually makes picking a configuration DO something.
    const hasConfigurations = (laptopProduct?.configurations?.length ?? 0) > 0
    const effectivePrice = laptopProduct
        ? getEffectivePrice(laptopProduct, selectedConfig ?? undefined)
        : undefined
    const displayPrice = effectivePrice?.price
    const displayOldPrice = effectivePrice?.oldPrice
    const dealLive = laptopProduct ? isDealLive(laptopProduct) : false
    const displayStock = selectedConfig ? selectedConfig.stockQuantity : (laptopProduct?.stockQuantity ?? 0)

    const handleAddToCart = () => {
        if (!laptopProduct) return
        if (hasConfigurations && !selectedConfig) {
            toast.error("Please select a configuration first")
            return
        }
        const cartId = selectedConfig ? `${laptopProduct.dbID}_${selectedConfig.id}` : laptopProduct.dbID
        const alreadyInCart = useCartStore.getState().items.some((i) => i.id === cartId)
        if (alreadyInCart) {
            toast.info(`${laptopProduct.name} is already in your cart`)
            return
        }
        addItem(laptopProduct, selectedConfig || undefined)
        toast.success(`${laptopProduct.name} added to cart`)
    }

    const inStock = displayStock > 0
    const lowStock = inStock && displayStock <= 3
    const savings =
        displayOldPrice && displayPrice
            ? displayOldPrice - displayPrice
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
                                    className={`bg-white rounded-lg p-2 border transition-colors flex items-center justify-center ${mainImage === img
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
                                    className={`border-0 text-white ${inStock ? (lowStock ? 'bg-amber-600' : 'bg-emerald-600') : 'bg-red-500'
                                        }`}
                                >
                                    {inStock
                                        ? lowStock
                                            ? `Only ${displayStock} left`
                                            : `${displayStock} in stock`
                                        : 'Out of stock'}
                                </Badge>
                                <Badge className={`border-0 text-white ${laptopProduct?.condition === "new" ? "bg-emerald-600" :
                                    laptopProduct?.condition === "refurbished" ? "bg-blue-600" : "bg-amber-600"
                                    }`}>
                                    {laptopProduct?.condition === "new" ? "New" : laptopProduct?.condition === "refurbished" ? "Refurbished" : "Used"}
                                </Badge>
                            </div>

                            <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
                                {laptopProduct?.name}
                            </h1>

                            {laptopProduct?.conditionNotes && (
                                <p className="text-sm text-gray-500 mb-3">{laptopProduct.conditionNotes}</p>
                            )}

                            {/* <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor((laptopProduct?.rating)!)
                                                ? 'fill-amber-500 text-amber-500'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold text-slate-900">{laptopProduct?.rating}</span>
                                <span className="text-gray-500 text-sm">({laptopProduct?.reviews} reviews)</span>
                            </div> */}

                            {(laptopProduct?.reviews ?? 0) > 0 ? (
                                <a href="#reviews" className="flex items-center gap-3">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.round(laptopProduct?.rating ?? 0) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-slate-900">{laptopProduct?.rating}</span>
                                    <span className="text-gray-500 text-sm">({laptopProduct?.reviews} reviews)</span>
                                </a>
                            ) : (
                                <a href="#reviews" className="text-sm text-gray-500 hover:text-slate-900">No reviews yet</a>
                            )}
                        </div>

                        {hasConfigurations && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-900">Choose Configuration</h3>
                                <div className="flex flex-wrap gap-2">
                                    {laptopProduct!.configurations!.map((config) => (
                                        <button
                                            key={config.id}
                                            onClick={() => setSelectedConfig(config)}
                                            disabled={config.stockQuantity < 1}
                                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${selectedConfig?.id === config.id
                                                ? "border-slate-900 bg-slate-900 text-white"
                                                : "border-gray-200 text-gray-700 hover:border-gray-400"
                                                } ${config.stockQuantity < 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                                        >
                                            {getConfigurationLabel(config)}
                                            {config.stockQuantity < 1 && " (Out of stock)"}                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-b border-gray-200 py-6">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-5xl font-bold text-slate-900">
                                    ₦{displayPrice?.toLocaleString()}
                                </span>
                                {displayOldPrice ? (
                                    <span className="text-xl text-gray-400 line-through">
                                        ₦{displayOldPrice.toLocaleString()}
                                    </span>
                                ) : null}
                                {dealLive && savings > 0 && (
                                    <Badge variant={'outline'} className="ml-3 text-green-600 border-green-600 text-xs">
                                        -{laptopProduct?.discount}%
                                    </Badge>
                                )}
                            </div>
                            {savings > 0 && (
                                <span className="inline-block mt-3 text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                    You save ₦{savings.toLocaleString()}
                                </span>
                            )}
                            {dealLive && laptopProduct?.dealEndsAt && (
                                <div className="mt-3">
                                    <DealCountdown endsAt={laptopProduct.dealEndsAt} />
                                </div>
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

                        {laptopProduct?.specSheet && laptopProduct.specSheet.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Specifications</h3>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {laptopProduct.specSheet.map((spec, i) => (
                                        <div
                                            key={i}
                                            className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                        >
                                            <span className="text-gray-500">{spec.label}</span>
                                            <span className="text-slate-900 font-medium text-right">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                            <WhatsappBtn product={laptopProduct} configuration = {selectedConfig} />
                            <p className="sm:text-center text-sm text-gray-500 flex items-center justify-center gap-1.5">
                                <MessageCircle className="w-5 h-5" />
                                Or chat with us on WhatsApp to place your order
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {!loadingStore && laptopProduct && <ReviewsSection productId={laptopProduct.dbID} />}
        </>
    )
}

export default ProductDetailsUI