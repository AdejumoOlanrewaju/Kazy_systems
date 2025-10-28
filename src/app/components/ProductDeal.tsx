import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LaptopType } from '@/lib/types'
import { ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ProductDeal = ({product}: {product : LaptopType}) => {
    return (
        <>
            <Card key={product.id} className="pt-0 group hover:shadow-2xl transition-all duration-300 border-2 hover:border-red-500 overflow-hidden bg-white cursor-pointer relative">
                {/* Discount Badge */}
                <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 rounded-bl-2xl font-bold text-lg z-10">
                    -{product.discount}%
                </div>

                <div className="relative overflow-hidden bg-gray-100">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 font-semibold animate-pulse">
                        {product.dealBadge}
                    </Badge>
                    {product.inStock && (
                        <Badge className="absolute bottom-3 left-3 bg-green-500 text-white border-0">
                            In Stock - Hurry!
                        </Badge>
                    )}
                </div>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.specs}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2 w-full">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-red-600">${product.price}</span>
                            <span className="text-sm text-gray-400 line-through">${product.oldPrice}</span>
                        </div>
                        <Badge className="ml-auto bg-green-100 text-green-700 border-green-300 text-xs px-2 py-1">
                            Save ${(product?.oldPrice)! - (product?.price)!}
                        </Badge>
                    </div>
                    <Link href={`/product/${product.name.replace(/\s+/g, "-")}`}>
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                            Grab This Deal
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </>
    )
}

export default ProductDeal
