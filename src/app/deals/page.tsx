"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    BadgeCheck,
    PackageSearch,
    Percent,
    ShieldCheck,
    Timer,
    Truck,
} from 'lucide-react'
import Link from 'next/link'
import React, { useMemo } from 'react'
import ProductDeal from '../components/ProductDeal'
import { useLaptopStore } from '@/store/laptopStore'
import { useCountdown } from '@/lib/useCountdown'

const TIME_UNITS = [
    { key: 'days', label: 'days' },
    { key: 'hours', label: 'hrs' },
    { key: 'minutes', label: 'min' },
    { key: 'seconds', label: 'sec' },
]

const WHY_SHOP = [
    {
        icon: Percent,
        title: 'Prices we can prove',
        description:
            "Every deal price is checked against the last 30 days — if it's marked down, it actually came down.",
    },
    {
        icon: ShieldCheck,
        title: 'Every unit inspected',
        description:
            'Laptops are tested for battery health, screen, keyboard and ports before they ever get listed.',
    },
    {
        icon: Truck,
        title: 'Delivery included',
        description: 'Shipping is built into the deal price — the number you see is the number you pay.',
    },
    {
        icon: BadgeCheck,
        title: '7-day return window',
        description: "Not happy with it? Send it back within 7 days for a full refund, no questions asked.",
    },
]

const page = () => {
    const { laptopStoreData } = useLaptopStore()
    const dealLaptops = laptopStoreData.filter((laptop) => laptop.isDeal)

    // Drive the hero countdown off whichever active deal expires soonest —
    // real data instead of a fake shared timer.
    const soonestDeal = useMemo(() => {
        return dealLaptops
            .filter((l) => l.dealEndsAt)
            .sort((a, b) => (a.dealEndsAt! - b.dealEndsAt!))[0]
    }, [dealLaptops])

    const countdown = useCountdown(soonestDeal?.dealEndsAt)

    return (
        <div className="bg-[#FAF9F6] text-[#12151C]">
            {/* Hero */}
            <section className="bg-[#12151C] text-[#FAF9F6] h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
                    <div>
                        <Badge className="bg-amber-500 text-[#12151C] border-0 px-3 py-1 text-sm font-semibold mb-6 hover:bg-amber-500">
                            Deal of the week
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6 max-w-xl">
                            Laptops priced to move, not to impress.
                        </h1>
                        <p className="text-lg text-[#C8CBD3] max-w-lg mb-8">
                            We cut prices on inspected, warrantied laptops for a limited run each week —
                            once the timer runs out, these prices go back up.
                        </p>
                        <div className="flex flex-wrap gap-4 mb-10">
                            <Link href="#deals">
                                <Button
                                    size="lg"
                                    className="bg-amber-500 hover:bg-[#E64F16] text-[#12151C] font-semibold text-base px-7"
                                >
                                    Shop this week's deals
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/shop">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-[#3A3F4B] text-[#FAF9F6] bg-transparent hover:bg-[#1C2029] hover:text-[#FAF9F6] font-semibold text-base px-7"
                                >
                                    Browse full catalog
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#9BA0AB]">
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" /> Inspected before listing
                            </span>
                            <span className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#2DD4BF]" /> Delivery included
                            </span>
                            <span className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-[#2DD4BF]" /> 7-day returns
                            </span>
                        </div>
                    </div>

                    {/* Countdown panel — now driven by the soonest-expiring real deal */}
                    <div className="bg-[#181B23] border border-[#2A2E38] rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-2 text-[#9BA0AB] text-sm mb-6">
                            <Timer className="w-4 h-4 text-amber-500" />
                            {!countdown
                                ? 'New deals posted weekly'
                                : countdown.expired
                                ? 'This round of deals has closed'
                                : 'Next deal price change in'}
                        </div>

                        {countdown ? (
                            <>
                                <div className="grid grid-cols-4 gap-3">
                                    {TIME_UNITS.map((unit) => (
                                        <div key={unit.key} className="text-center">
                                            <div className="bg-[#12151C] rounded-lg py-4 font-mono text-3xl sm:text-4xl font-semibold tabular-nums">
                                                {String(countdown[unit.key as keyof typeof countdown]).padStart(2, '0')}
                                            </div>
                                            <div className="text-xs text-[#6B7280] mt-2">{unit.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[#6B7280] mt-6 leading-relaxed">
                                    {countdown.expired
                                        ? 'New deals get posted every week — check back soon or browse the full catalog.'
                                        : "When this hits zero, that item returns to standard pricing."}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-[#9BA0AB] leading-relaxed">
                                {dealLaptops.length > 0
                                    ? "Check individual listings below for their deal end times."
                                    : "No deals are running right now — check back soon."}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Deals Grid */}
            <section id="deals" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[#12151C] mb-2">
                                This week's deals
                            </h2>
                            <p className="text-[#6B7280]">
                                {dealLaptops.length > 0 && countdown && !countdown.expired
                                    ? `${dealLaptops.length} laptop${dealLaptops.length === 1 ? '' : 's'} marked down right now`
                                    : 'Restocking — new deals are added every week'}
                            </p>
                        </div>
                    </div>

                    {dealLaptops.length === 0 || countdown?.expired ? (
                        <div className="border border-dashed border-[#D8D5CC] rounded-2xl py-20 px-6 text-center">
                            <PackageSearch className="w-10 h-10 text-[#B5B0A3] mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-[#12151C] mb-2">
                                No deals are live right now
                            </h3>
                            <p className="text-[#6B7280] max-w-md mx-auto mb-6">
                                This round has sold out or hasn't started yet. The full catalog is still
                                open if you want to browse in the meantime.
                            </p>
                            <Link href="/shop">
                                <Button className="bg-[#12151C] hover:bg-[#22262F] text-white font-semibold">
                                    Browse all products
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dealLaptops.map((laptop) => (
                                <ProductDeal product={laptop} key={laptop.dbID} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Buy From Us */}
            <section className="py-20 bg-white border-t border-[#EDEAE1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-[#12151C] mb-12 max-w-md">
                        Why the deal price is the real price
                    </h2>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                        {WHY_SHOP.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex gap-4">
                                <div className="shrink-0 w-11 h-11 rounded-full bg-[#12151C] flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-[#2DD4BF]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#12151C] mb-1">{title}</h3>
                                    <p className="text-[#6B7280] leading-relaxed">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#FAF9F6] border-t border-[#EDEAE1]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#12151C] mb-4">
                        Not sure which one fits your budget?
                    </h2>
                    <p className="text-lg text-[#6B7280] mb-8">
                        Message us with what you'll use it for and we'll point you at the right deal.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/shop">
                            <Button
                                size="lg"
                                className="bg-amber-500 hover:bg-[#E64F16] text-[#12151C] font-semibold text-base px-8"
                            >
                                Browse all products
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default page