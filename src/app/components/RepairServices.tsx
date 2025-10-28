import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Badge, Check, Clock, Shield, Wrench, Zap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const RepairServices = () => {
    const repairServices = [
        {
            icon: <Wrench className="w-8 h-8" />,
            title: 'Screen Replacement',
            description: 'Professional LCD/LED screen repair and replacement with warranty',
            price: 'From $99',
            duration: '2-4 hours'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Performance Upgrade',
            description: 'RAM, SSD upgrades to boost your laptop speed significantly',
            price: 'From $79',
            duration: '1-2 hours'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Virus Removal',
            description: 'Complete system cleanup and security setup',
            price: 'From $59',
            duration: '3-5 hours'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Hardware Repair',
            description: 'Motherboard, battery, and component repairs',
            price: 'From $149',
            duration: '1-2 days'
        }
    ];
    return (
        <>
            {/* Repair Services Section */}
            <section id="repairs" className="py-16 bg-gray-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">Professional Repair Services</h2>
                        <p className="text-xl text-gray-600">Expert technicians, fast turnaround, guaranteed satisfaction</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {repairServices.map((service, idx) => (
                            <Card key={idx} className="text-center hover:shadow-xl transition-shadow duration-300 border-2 hover:border-slate-900 bg-white">
                                <CardHeader>
                                    <div className="flex justify-center mb-4">
                                        <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                            {service.icon}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                                    <CardDescription className="text-base min-h-[60px]">{service.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="flex flex-col space-y-3">
                                    <div className="text-center w-full">
                                        <span className="text-2xl font-bold text-slate-900 block">{service.price}</span>
                                        <span className="text-sm text-gray-500">Duration: {service.duration}</span>
                                    </div>
                                    <Link href={'/repair'}>
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                                            Book Service
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 bg-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <Badge className="bg-amber-500 text-slate-900 border-0 mb-4 font-semibold">
                                    Emergency Service Available
                                </Badge>
                                <h3 className="text-3xl font-bold mb-4">Need Urgent Repair?</h3>
                                <p className="text-lg mb-6 text-gray-300">
                                    Get your laptop fixed within 24 hours. Our priority service ensures minimal downtime for your business or personal needs.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400" />
                                        <span>Free diagnostics included</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400" />
                                        <span>90-day warranty on all repairs</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400" />
                                        <span>Pick-up & delivery available</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400" />
                                        <span>Certified technicians only</span>
                                    </li>
                                </ul>
                                <Link href = {"/repair"}>
                                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Book One Now
                                </Button>
                                
                                </Link>
                            </div>
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=700&h=500&fit=crop&q=80"
                                    alt="Laptop repair service"
                                    className="rounded-2xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default RepairServices
