"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { submitLead } from '@/lib/leadService'

const WHATSAPP_NUMBER = '2349165210359'
const PHONE_NUMBER = '+2349165210359'
const PHONE_DISPLAY = '0916 521 0359'
const EMAIL = 'olanrewajuadejumo56@gmail.com'
const STORE_ADDRESS = '123 Tech Street, Allen Avenue, Ikeja, Lagos State, Nigeria'

const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to know more about your laptops."
)}`
const DIRECTIONS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    STORE_ADDRESS
)}`

const FAQS = [
    {
        question: 'How long does laptop repair take?',
        answer:
            'Most repairs are completed within 24-48 hours. Complex repairs may take 2-3 days. We offer express service for urgent repairs.',
    },
    {
        question: 'Do you deliver nationwide?',
        answer:
            'Yes, we deliver to all states in Nigeria. Delivery typically takes 2-5 business days depending on your location. Free delivery for orders above ₦500,000.',
    },
    {
        question: "Can I return a product if I'm not satisfied?",
        answer:
            "If you’re not satisfied with your purchase or experience any issues with our repair service, please contact us. Our team is available 24/7 to discuss your concerns and help find the best possible solution.",
    },


]

const page = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [contactForm, setContactForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleContactChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setContactForm((prev) => ({ ...prev, [name]: value }))
        if (submitted) setSubmitted(false)
    }

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await submitLead('contact', contactForm)
            setSubmitted(true)
            setContactForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
        } catch (err) {
            console.error('Failed to save contact lead:', err)
            alert('Something went wrong. Please try again or reach us via WhatsApp.')
        }
        setSubmitting(false)
    }

    return (
        <div>
            {/* Contact Hero */}
            <section className="bg-slate-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge className="bg-amber-500 text-slate-900 border-0 px-4 py-1.5 font-semibold mb-5 hover:bg-amber-500">
                        Get in touch
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Talk to a real person</h1>
                    <p className="text-xl text-gray-300 max-w-xl mx-auto">
                        WhatsApp, call, or email pick whichever gets you an answer fastest.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <Card className="text-center border-2 border-slate-100 hover:border-amber-400 transition-colors">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-amber-50 p-5 rounded-full">
                                        <MessageCircle className="w-9 h-9 text-amber-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl mb-1">WhatsApp</CardTitle>
                                <CardDescription>Chat with us instantly for quick responses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold">{PHONE_DISPLAY}</p>
                                    <p className="text-sm text-gray-500">Available 24/7</p>
                                </div>
                                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="block">
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-12">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Start WhatsApp chat
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="text-center border-2 border-slate-100 hover:border-amber-400 transition-colors">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-amber-50 p-5 rounded-full">
                                        <Phone className="w-9 h-9 text-amber-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl mb-1">Phone call</CardTitle>
                                <CardDescription>Speak directly with our team</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold">{PHONE_DISPLAY}</p>
                                    <p className="text-sm text-gray-500">Mon - Sat: 9AM - 7PM</p>
                                </div>
                                <a href={`tel:${PHONE_NUMBER}`} className="block">
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-12">
                                        <Phone className="w-5 h-5 mr-2" />
                                        Call us now
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="text-center border-2 border-slate-100 hover:border-amber-400 transition-colors">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="bg-amber-50 p-5 rounded-full">
                                        <Mail className="w-9 h-9 text-amber-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl mb-1">Email</CardTitle>
                                <CardDescription>Send us a detailed message</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-slate-900 font-bold text-sm break-all">{EMAIL}</p>
                                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                                </div>
                                <a
                                    href={`mailto:${EMAIL}?subject=${encodeURIComponent('Website enquiry')}`}
                                    className="block"
                                >
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-12">
                                        <Mail className="w-5 h-5 mr-2" />
                                        Send email
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
                            <Card className="border-2 border-slate-100">
                                <CardContent className="pt-6">
                                    <form className="space-y-4" onSubmit={handleContactSubmit}>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                    First name
                                                </label>
                                                <Input
                                                    type="text"
                                                    name="firstName"
                                                    value={contactForm.firstName}
                                                    onChange={handleContactChange}
                                                    placeholder="John"
                                                    required
                                                    className="w-full focus-visible:ring-amber-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                    Last name
                                                </label>
                                                <Input
                                                    type="text"
                                                    name="lastName"
                                                    value={contactForm.lastName}
                                                    onChange={handleContactChange}
                                                    placeholder="Doe"
                                                    required
                                                    className="w-full focus-visible:ring-amber-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Email address
                                            </label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={contactForm.email}
                                                onChange={handleContactChange}
                                                placeholder="john.doe@example.com"
                                                required
                                                className="w-full focus-visible:ring-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Phone number
                                            </label>
                                            <Input
                                                type="tel"
                                                name="phone"
                                                value={contactForm.phone}
                                                onChange={handleContactChange}
                                                placeholder="+234 XXX XXX XXXX"
                                                required
                                                className="w-full focus-visible:ring-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                name="subject"
                                                value={contactForm.subject}
                                                onChange={handleContactChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="product-inquiry">Product inquiry</option>
                                                <option value="repair-service">Repair service</option>
                                                <option value="order-status">Order status</option>
                                                <option value="technical-support">Technical support</option>
                                                <option value="complaint">Complaint</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Your message
                                            </label>
                                            <Textarea
                                                name="message"
                                                value={contactForm.message}
                                                onChange={handleContactChange}
                                                placeholder="Tell us how we can help you..."
                                                required
                                                rows={5}
                                                className="w-full focus-visible:ring-amber-500"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={submitting}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-60"
                                        >
                                            {submitting ? 'Sending...' : submitted ? 'Message sent' : 'Send message'}
                                        </Button>
                                        {submitted && (
                                            <p className="text-sm text-emerald-600 text-center flex items-center justify-center gap-1.5">
                                                <Check className="w-4 h-4" />
                                                We'll get back to you within 24 hours.
                                            </p>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Visit Us & FAQ */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Visit our store</h3>
                                <Card className="border-2 border-slate-100">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-amber-50 p-3 rounded-lg shrink-0">
                                                <MapPin className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Our location</h4>
                                                <p className="text-gray-600">123 Tech Street, Allen Avenue</p>
                                                <p className="text-gray-600">Ikeja, Lagos State</p>
                                                <p className="text-gray-600">Nigeria</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-amber-50 p-3 rounded-lg shrink-0">
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Business hours</h4>
                                                <p className="text-gray-600">Monday - Friday: 9:00 AM - 7:00 PM</p>
                                                <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
                                                <p className="text-gray-600">Sunday: Closed</p>
                                            </div>
                                        </div>

                                        <a href={DIRECTIONS_LINK} target="_blank" rel="noopener noreferrer" className="block">
                                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                                                <MapPin className="w-5 h-5 mr-2" />
                                                Get directions
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-slate-900 text-white border-0">
                                <CardHeader>
                                    <CardTitle className="text-xl">Need immediate help?</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Our team is ready to assist you
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        'Fast response time',
                                        'Expert technical support',
                                        'WhatsApp available 24/7',
                                        'Free consultation',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                            Frequently asked questions
                        </h2>
                        <p className="text-lg text-gray-600">Find quick answers to common questions</p>
                    </div>

                    <div className="space-y-3">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx
                            return (
                                <Card
                                    key={faq.question}
                                    className={`border-2 transition-colors cursor-pointer ${isOpen ? 'border-amber-400' : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                >
                                    <CardHeader className="py-4">
                                        <div className="flex justify-between items-center gap-4">
                                            <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </CardHeader>
                                    {isOpen && (
                                        <CardContent className="pt-0 pb-5">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </CardContent>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default page