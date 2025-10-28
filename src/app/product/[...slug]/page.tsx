import { Button } from '@/components/ui/button'
import { Check, MessageCircle, Shield, Star } from 'lucide-react'
import React from 'react'
import { laptops } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import WhatsappBtn from '@/app/components/WhatsappBtn'
import ProductDetailsUI from '@/app/components/ProductDetailsUI'

const page = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
    
    const paramsName = (await params).slug.join("").replace(/-/g, " ")
  
    return (
        <>
            <div>
                {/* Product Details */}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                   <ProductDetailsUI paramsName = {paramsName}/>
                </div>
            </div>
        </>
    )
}



export default page
