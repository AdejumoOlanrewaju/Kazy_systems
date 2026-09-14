"use client"
import React, { useState } from 'react'
import { Check, MessageCircle, Shield, ShoppingCart, Star } from 'lucide-react'
import { useLaptopStore } from '@/store/laptopStore'
import { useCartStore } from '@/store/cartStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import WhatsappBtn from './WhatsappBtn'
import FetchDataStore from './FetchDataStore'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const ProductDetailsUI = ({ paramsName }: { paramsName: string }) => {
    const { laptopStoreData, loadingStore } = useLaptopStore()
    const laptopProduct = laptopStoreData.find(lap => lap.name === paramsName)
    const [mainImage, setMainImage] = useState<string | undefined>(laptopProduct?.images[0])
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

    return (
        <>
            {
                loadingStore ? (
                    <div className="grid lg:grid-cols-2 gap-12">
                        <Skeleton className='h-[664px] rounded-xl'></Skeleton>
                        <div className='mt-4 '>
                            <div className='flex flex-col gap-5'>
                                <Skeleton className='h-[30px] rounded-xl'></Skeleton>
                                <Skeleton className='h-[30px] rounded-xl'></Skeleton>
                                <Skeleton className='h-[30px] rounded-xl'></Skeleton>
                            </div>

                            <div className='flex flex-col gap-5 mt-20'>
                                <Skeleton className='h-[40px] rounded-xl'></Skeleton>
                                <Skeleton className='h-[30px] rounded-xl'></Skeleton>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Product Image */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl shadow-lg">
                                <img
                                    src={mainImage}
                                    alt={laptopProduct?.name}
                                    className="w-full h-[632px] rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {laptopProduct?.images.map((img, i) => (
                                    <div onClick={() => setMainImage(img)} key={i} className="bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition-shadow">
                                        <img
                                            src={img}
                                            alt={`${laptopProduct?.name} view ${i}`}
                                            className="w-full h-[120px] rounded"

                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <Badge className="bg-slate-900 text-white border-0 mb-3">
                                    {laptopProduct?.tag}
                                </Badge>
                                <h1 className="text-4xl font-bold text-slate-900 mb-3">{laptopProduct?.name}</h1>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor((laptopProduct?.rating)!) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold">{laptopProduct?.rating}</span>
                                    <span className="text-gray-500">({laptopProduct?.reviews} reviews)</span>
                                </div>
                                <Badge className={`text-white border-0 ${laptopProduct?.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {laptopProduct?.inStock ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                            </div>

                            <div className="border-t border-b border-gray-200 py-6">
                                <div className="flex items-baseline space-x-4">
                                    <span className="text-5xl font-bold text-slate-900">₦{laptopProduct?.price.toLocaleString()}</span>
                                    <span className="text-2xl text-gray-400 line-through">₦{laptopProduct?.oldPrice?.toLocaleString()}</span>
                                    <Badge className="text-green-600 border-green-600 text-lg px-3 py-1">
                                        Save ₦{((laptopProduct?.oldPrice)! - (laptopProduct?.price)!).toLocaleString()}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Description</h3>
                                <p className="text-gray-700 leading-relaxed">{laptopProduct?.description}</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Key Features</h3>
                                <ul className="space-y-2">
                                    {laptopProduct?.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start space-x-3">
                                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-100 rounded-xl p-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-semibold">Warranty:</span>
                                    <span>{laptopProduct?.warranty}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={!laptopProduct?.inStock}
                                    size="lg"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Add to Cart
                                </Button>
                                <WhatsappBtn product={laptopProduct} />
                                <p className="text-center text-sm text-gray-600">
                                    Or click to chat with us on WhatsApp and place your order
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default ProductDetailsUI