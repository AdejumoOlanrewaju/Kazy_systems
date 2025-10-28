"use client"
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import React from 'react'

const WhatsappBtn = (prop: any) => {
    const handleWhatsAppOrder = (product: any) => {
        const {name, price, specs} = product.product
        const message = `Hi, I'm interested in ordering:\n\n*${name}*\nPrice: $${price}\nSpecs: ${specs}\n\nPlease provide more information.`;
        const whatsappUrl = `https://wa.me/2349165210359?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
    };
    return (
        <div>
            <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg h-14"
                onClick={() => handleWhatsAppOrder(prop)}
            >
                <MessageCircle className="w-5 h-5 mr-2" />
                Order via WhatsApp
            </Button>
        </div>
    )
}

export default WhatsappBtn
