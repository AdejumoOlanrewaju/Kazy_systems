"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import React, { useState } from 'react'

const page = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return (
        <div>
            {/* Contact Hero */}
            <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge className="bg-amber-500 text-slate-900 border-0 px-4 py-2 text-lg font-bold mb-4">
                        📞 Get In Touch
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold mb-4">Contact Us</h1>
                    <p className="text-2xl text-gray-300">We're here to help! Reach out to us anytime</p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">How Can We Help You?</h2>
                        <p className="text-xl text-gray-600">Choose your preferred way to reach us</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-100 p-6 rounded-full">
                                        <MessageCircle className="w-12 h-12 text-black" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl mb-2">WhatsApp</CardTitle>
                                <CardDescription className="text-base">Chat with us instantly for quick responses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold text-lg mb-1">+234 XXX XXX XXXX</p>
                                    <p className="text-sm text-gray-600">Available 24/7</p>
                                </div>
                                <Button className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold text-lg h-12">
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Start WhatsApp Chat
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-100 p-6 rounded-full">
                                        <Phone className="w-12 h-12 text-black" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl mb-2">Phone Call</CardTitle>
                                <CardDescription className="text-base">Speak directly with our team</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold text-lg mb-1">+234 XXX XXX XXXX</p>
                                    <p className="text-sm text-gray-600">Mon - Sat: 9AM - 7PM</p>
                                </div>
                                <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold text-lg h-12">
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call Us Now
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-500">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-100 p-6 rounded-full">
                                        <Mail className="w-12 h-12 text-black" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl mb-2">Email</CardTitle>
                                <CardDescription className="text-base">Send us a detailed message</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold text-lg mb-1">info@techmart.com</p>
                                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                                </div>
                                <Button className="w-full bg-purple-950 hover:bg-black text-white font-semibold text-lg h-12">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Send Email
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
                            <Card className="border-2 border-slate-200">
                                <CardContent className="pt-6">
                                    <form className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                    First Name *
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="John"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                    Last Name *
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Doe"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Email Address *
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="john.doe@example.com"
                                                required
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Phone Number *
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+234 XXX XXX XXXX"
                                                required
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Subject *
                                            </label>
                                            <select
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="product-inquiry">Product Inquiry</option>
                                                <option value="repair-service">Repair Service</option>
                                                <option value="order-status">Order Status</option>
                                                <option value="technical-support">Technical Support</option>
                                                <option value="complaint">Complaint</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Your Message *
                                            </label>
                                            <Textarea
                                                placeholder="Tell us how we can help you..."
                                                required
                                                rows={5}
                                                className="w-full"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg"
                                        >
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Visit Us & FAQ */}
                        <div className="space-y-8">
                            {/* Visit Our Store */}
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-6">Visit Our Store</h3>
                                <Card className="border-2 border-slate-200">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <MapPin className="w-6 h-6 text-black" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Our Location</h4>
                                                <p className="text-gray-600">123 Tech Street, Allen Avenue</p>
                                                <p className="text-gray-600">Ikeja, Lagos State</p>
                                                <p className="text-gray-600">Nigeria</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <Clock className="w-6 h-6 text-black" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Business Hours</h4>
                                                <p className="text-gray-600">Monday - Friday: 9:00 AM - 7:00 PM</p>
                                                <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
                                                <p className="text-gray-600">Sunday: Closed</p>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            Get Directions
                                        </Button>

                                        {/* Map placeholder */}
                                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <MapPin className="w-12 h-12 mx-auto mb-2" />
                                                <p className="text-sm">Interactive Map</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Info */}
                            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Need Immediate Help?</CardTitle>
                                    <CardDescription className="text-gray-300">Our team is ready to assist you</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span>Fast response time</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span>Expert technical support</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span>WhatsApp available 24/7</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span>Free consultation</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Find quick answers to common questions</p>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-2 hover:border-slate-900 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">What are your payment methods?</CardTitle>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${openFaq === 1 ? 'rotate-90' : ''}`} />
                                </div>
                            </CardHeader>
                            {openFaq === 1 && (
                                <CardContent>
                                    <p className="text-gray-600">We accept bank transfers, card payments, and cash on delivery. Payment details will be shared via WhatsApp when you place your order.</p>
                                </CardContent>
                            )}
                        </Card>

                        <Card className="border-2 hover:border-slate-900 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Do you offer warranty on laptops?</CardTitle>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${openFaq === 2 ? 'rotate-90' : ''}`} />
                                </div>
                            </CardHeader>
                            {openFaq === 2 && (
                                <CardContent>
                                    <p className="text-gray-600">Yes! All our laptops come with manufacturer warranty ranging from 1 to 3 years depending on the brand and model.</p>
                                </CardContent>
                            )}
                        </Card>

                        <Card className="border-2 hover:border-slate-900 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">How long does laptop repair take?</CardTitle>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${openFaq === 3 ? 'rotate-90' : ''}`} />
                                </div>
                            </CardHeader>
                            {openFaq === 3 && (
                                <CardContent>
                                    <p className="text-gray-600">Most repairs are completed within 24-48 hours. Complex repairs may take 2-3 days. We offer express service for urgent repairs.</p>
                                </CardContent>
                            )}
                        </Card>

                        <Card className="border-2 hover:border-slate-900 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Do you deliver nationwide?</CardTitle>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${openFaq === 4 ? 'rotate-90' : ''}`} />
                                </div>
                            </CardHeader>
                            {openFaq === 4 && (
                                <CardContent>
                                    <p className="text-gray-600">Yes, we deliver to all states in Nigeria. Delivery typically takes 2-5 business days depending on your location. Free delivery for orders above ₦500,000.</p>
                                </CardContent>
                            )}
                        </Card>

                        <Card className="border-2 hover:border-slate-900 transition-colors cursor-pointer" onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Can I return a product if I'm not satisfied?</CardTitle>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${openFaq === 5 ? 'rotate-90' : ''}`} />
                                </div>
                            </CardHeader>
                            {openFaq === 5 && (
                                <CardContent>
                                    <p className="text-gray-600">Yes, we have a 30-day return policy. Products must be in original condition with all accessories and packaging. Contact us for the return process.</p>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </div>
            </section>


        </div>
    )
}

export default page
