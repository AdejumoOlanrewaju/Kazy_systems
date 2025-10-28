"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { laptops } from '@/lib/data'
import { ChevronRight, Clock, DollarSign, MessageCircle, Shield, Star, Truck } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import ProductDeal from '../components/ProductDeal'
import { useLaptopStore } from '@/store/laptopStore'

const page = () => {
    const [dealTimer, setDealTimer] = useState({
        days: 2,
        hours: 15,
        minutes: 23,
        seconds: 45,
    });

    useEffect(() => {
        // Check if we already have an end time in localStorage
        let endTime = localStorage.getItem("dealEndTime");

        if (!endTime) {
            // If not set, create one (e.g., 2 days, 15 hours, 23 minutes, 45 seconds from now)
            const newEndTime =
                Date.now() + (2 * 24 * 60 * 60 + 15 * 60 * 60 + 23 * 60 + 45) * 1000;
            localStorage.setItem("dealEndTime", newEndTime.toString());
            endTime = newEndTime.toString();
        }

        const timer = setInterval(() => {
            const timeLeft = Number(endTime) - Date.now();

            if (timeLeft <= 0) {
                clearInterval(timer);
                localStorage.removeItem("dealEndTime");
                setDealTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            setDealTimer({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    const { laptopStoreData } = useLaptopStore()
    const dealLaptops = laptopStoreData.filter(laptop => laptop.isDeal)
    return (
        <div>
            {/* Deals Hero */}
            <section className="bg-gradient-to-r from-red-900 via-orange-700 to-amber-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge className="bg-white text-red-600 border-0 px-4 py-2 text-lg font-bold mb-4">
                        🔥 HOT DEALS
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold mb-4">Unbeatable Prices!</h1>
                    <p className="text-2xl mb-8">Save up to 21% on premium laptops</p>

                    {/* Countdown Timer */}
                    <div className="flex justify-center items-center space-x-4 mb-8">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                            <div className="text-4xl font-bold">{dealTimer.days}</div>
                            <div className="text-sm">DAYS</div>
                        </div>
                        <div className="text-3xl font-bold">:</div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                            <div className="text-4xl font-bold">{dealTimer.hours}</div>
                            <div className="text-sm">HOURS</div>
                        </div>
                        <div className="text-3xl font-bold">:</div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                            <div className="text-4xl font-bold">{dealTimer.minutes}</div>
                            <div className="text-sm">MINS</div>
                        </div>
                        <div className="text-3xl font-bold">:</div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                            <div className="text-4xl font-bold">{dealTimer.seconds}</div>
                            <div className="text-sm">SECS</div>
                        </div>
                    </div>

                    <p className="text-lg">⏰ Deals end soon! Don't miss out on these incredible savings</p>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="py-16 bg-white">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-slate-900 mb-2">Today's Best Deals</h2>
                        <p className="text-lg text-gray-600">Limited quantities available - First come, first served!</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {
                            dealLaptops.length === 0 ? (<p>No Deals Available</p>) : dealLaptops.map((laptop) => (
                                <ProductDeal product={laptop} key={laptop.dbID} />
                            ))
                        }
                    </div>
                </div>
            </section>

            {/* Why Buy From Us */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Shop Our Deals?</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <Card className="text-center border-2 py-10">
                            <CardHeader>
                                <div className="flex justify-center mb-3">
                                    <div className="bg-green-100 p-4 rounded-full">
                                        <DollarSign className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-lg">Best Prices</CardTitle>
                                <CardDescription>Guaranteed lowest prices or we'll match it</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center border-2 py-10">
                            <CardHeader>
                                <div className="flex justify-center mb-3">
                                    <div className="bg-blue-100 p-4 rounded-full">
                                        <Shield className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-lg">Authentic Products</CardTitle>
                                <CardDescription>100% genuine laptops with warranty</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center border-2 py-10">
                            <CardHeader>
                                <div className="flex justify-center mb-3">
                                    <div className="bg-amber-100 p-4 rounded-full">
                                        <Truck className="w-8 h-8 text-amber-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-lg">Free Delivery</CardTitle>
                                <CardDescription>Free shipping on all deal items</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center border-2 py-10">
                            <CardHeader>
                                <div className="flex justify-center mb-3">
                                    <div className="bg-purple-100 p-4 rounded-full">
                                        <Clock className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-lg">Limited Time</CardTitle>
                                <CardDescription>Exclusive deals that won't last long</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">Don't Miss Out!</h2>
                    <p className="text-xl mb-8 text-gray-300">
                        These deals are selling fast. Contact us now to secure your laptop at an unbeatable price.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {/* <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-8">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Chat on WhatsApp
                        </Button> */}
                        <Link href = {"/shop"}>
                            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-lg px-8">
                                Browse All Products
                            </Button>

                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default page
