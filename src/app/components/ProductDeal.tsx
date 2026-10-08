import Link from 'next/link'
import React from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { buildProductUrl } from '@/lib/slug'
import { LaptopType } from '@/lib/types'
import { getProductSummary, getProductStock, getPricing } from '@/lib/productDisplay'
import DealCountdown from './DealCountdown'

const ProductDeal = ({ product }: { product: LaptopType }) => {
    const stock = getProductStock(product)
    const { price, oldPrice, savings, percent, isFrom } = getPricing(product)
    const soldOut = stock < 1
    const lowStock = stock > 0 && stock <= 3
    const conditionLabel =
        product.condition === 'new' ? 'New' : product.condition === 'refurbished' ? 'Refurbished' : 'Used'

    return (
        <Link href={buildProductUrl(product.name, product.dbID)} className="group block h-full">
            <article
                className={`h-full flex flex-col bg-white rounded-2xl border border-[#EDEAE1] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#12151C]/30 ${soldOut ? 'opacity-80' : ''}`}
            >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'grayscale' : ''}`}
                    />

                    {product.dealBadge && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-[#12151C] text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                            {product.dealBadge}
                        </span>
                    )}

                    {percent > 0 && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-md shadow-sm">
                            -{percent}%
                        </span>
                    )}

                    <span
                        className={`absolute bottom-3 left-3 text-white text-xs font-semibold px-2.5 py-1 rounded-md ${soldOut ? 'bg-gray-800' : lowStock ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                    >
                        {soldOut ? 'Sold out' : lowStock ? `Only ${stock} left` : `${stock} in stock`}
                    </span>

                    <span className="absolute bottom-3 right-3 bg-[#12151C]/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                        {conditionLabel}
                    </span>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5">
                    {product.reviews > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-[#12151C]">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                    )}

                    <h3 className="font-bold text-lg text-[#12151C] line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-sm text-[#6B7280] line-clamp-2 mb-3 min-h-[2.5rem]">
                        {getProductSummary(product)}
                    </p>

                    {product.dealEndsAt && (
                        <div className="mb-4">
                            <DealCountdown endsAt={product.dealEndsAt} />
                        </div>
                    )}

                    <div className="mt-auto">
                        <div className="flex items-end justify-between gap-2">
                            <div>
                                {isFrom && <span className="block text-xs text-[#6B7280]">From</span>}
                                <span className="text-2xl font-bold text-[#12151C]">
                                    ₦{price.toLocaleString()}
                                </span>
                                {oldPrice && (
                                    <span className="ml-2 text-sm text-gray-400 line-through">
                                        ₦{oldPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {savings > 0 && (
                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md whitespace-nowrap">
                                    Save ₦{savings.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div
                            className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${soldOut
                                    ? 'bg-gray-200 text-gray-500'
                                    : 'bg-[#12151C] text-white group-hover:bg-amber-500 group-hover:text-[#12151C]'
                                }`}
                        >
                            {soldOut ? 'Sold out — view details' : 'Grab this deal'}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default ProductDeal