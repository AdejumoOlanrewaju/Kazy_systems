"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'

const ProductCard = ({ laptop }: { laptop: any }) => {
    const slug = laptop.name.replace("/\s+/g", "-")
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // don't trigger the "View Details" link underneath
        const alreadyInCart = useCartStore.getState().items.some((i) => i.id === laptop.dbID)
        if (alreadyInCart) {
            toast.info(`${laptop.name} is already in your cart`)
            return
        }
        addItem(laptop)
        toast.success(`${laptop.name} added to cart`)
    }
    return (
        <>
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-slate-900 overflow-hidden bg-white cursor-pointer pt-0">
                <div className="relative overflow-hidden bg-gray-100">
                    <img
                        src={laptop?.images?.[0]}
                        alt={laptop.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {laptop.inStock && (
                        <div className="absolute bottom-3 gap-1 left-3 flex items-center bg-green-500 text-white py-1 px-2 rounded-xl">
                            <Badge className="w-4 h-4 text-white border-0">

                            </Badge>
                            <span>In Stock</span>
                        </div>
                    )}

                    {laptop.isDeal && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                            {laptop.dealBadge}
                        </span>
                    )}
                </div>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold">{laptop.rating}</span>
                            <span className="text-xs text-gray-500">({laptop.reviews})</span>
                        </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{laptop.name}</CardTitle>
                    <CardDescription className="text-sm">{laptop.specs}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-3">
                    <div className="flex items-baseline space-x-2 w-full">
                        <span className="text-2xl font-bold text-slate-900">₦{laptop.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through">₦{laptop.oldPrice?.toLocaleString()}</span>
                        <Badge variant={'outline'} className="ml-auto text-green-600 border-green-600 text-xs">
                            Save ₦{(laptop.oldPrice - laptop.price).toLocaleString()}
                        </Badge>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Link href={`/product/${laptop.name.replace(/\s+/g, "-")}`} className="flex-1">
                            <Button
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                View Details
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Button
                            onClick={handleAddToCart}
                            disabled={!laptop.inStock}
                            variant="outline"
                            className="border-slate-900"
                            title="Add to cart"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}

export default ProductCard