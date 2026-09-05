"use client"
import React, { useState } from 'react'
import { Award, Clock, MessageCircle, Package, Shield, ShoppingCart, TrendingUp, Truck, Wrench, Zap } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';



const features = [
    { icon: <Truck className="w-6 h-6" />, text: 'Free Shipping', subtext: 'On orders $500+' },
    { icon: <Shield className="w-6 h-6" />, text: '1-Year Warranty', subtext: 'All products' },
    { icon: <Package className="w-6 h-6" />, text: 'Easy Returns', subtext: '30-day policy' },
    { icon: <Clock className="w-6 h-6" />, text: '24/7 Support', subtext: 'Always here' }
];

const Hero = () => {

    return (
        <>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                    }}></div>
                </div>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6">
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-4 py-1">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Limited Time Sale - Up to 20% Off
                            </Badge>
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                Premium Laptops
                                <span className="block text-amber-400">Expert Repairs</span>
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Shop the latest laptops from top brands with unbeatable prices. Professional repair services with same-day turnaround available.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={"/shop"}>
                                    <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg px-8">
                                        Shop Now
                                    </Button>

                                </Link>
                                <Link href={"/deals"}>
                                    <Button size="lg" variant="outline" className="text-white bg-black border-2 border-white hover:bg-white hover:text-slate-900 text-lg px-8">
                                        View Deals
                                    </Button>

                                </Link>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex flex-col items-center space-y-2 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                        <div className="text-amber-400">{feature.icon}</div>
                                        <span className="text-sm text-center font-semibold">{feature.text}</span>
                                        <span className="text-xs text-gray-400 text-center">{feature.subtext}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 rounded-3xl blur-3xl opacity-20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&h=500&fit=crop&q=80"
                                alt="Premium laptop showcase"
                                className="relative rounded-3xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Hero
