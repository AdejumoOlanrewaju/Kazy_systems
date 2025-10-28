import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const PromoBanner = () => {
    return (
        <>
            {/* Promo Banner */}
            <section className="py-12 bg-gradient-to-r from-orange-700 to-amber-500">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                            <h3 className="text-4xl font-bold mb-4">Special Budget Laptops Sale!</h3>
                            <p className="text-xl lg:max-w-[50ch] mb-6 text-orange-50">
                                Discover high-performance, budget-friendly laptops designed for your needs. Hurry—limited stock available!
                            </p>
                            {/* <ul className="space-y-2 mb-6">
                                <li className="flex items-center space-x-3">
                                    <Check className="w-5 h-5 text-orange-100" />
                                    <span>RTX 40 Series Graphics</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Check className="w-5 h-5 text-orange-100" />
                                    <span>High Refresh Rate Displays</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Check className="w-5 h-5 text-orange-100" />
                                    <span>Up to 15% Off This Week</span>
                                </li>
                            </ul> */}
                            <Link href={"/shop"}>
                            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                                Shop Budget Laptops
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            
                            </Link>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&h=500&fit=crop&q=80"
                                alt="Gaming laptop"
                                className="rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default PromoBanner
