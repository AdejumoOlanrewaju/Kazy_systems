"use client"

import React, { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Award, Check, MessageCircle, Shield, Wrench, Zap } from "lucide-react"
import { submitLead } from "@/lib/leadService"

const Page = () => {
  const [repairForm, setRepairForm] = useState({
    name: "",
    email: "",
    phone: "",
    laptopBrand: "",
    issue: "",
    description: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleRepairFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setRepairForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRepairSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate (extra safety)
    if (!repairForm.name || !repairForm.email || !repairForm.phone || !repairForm.issue) {
      alert("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    try {
      // Save first — this is the permanent record, independent of WhatsApp.
      await submitLead("repair", repairForm)
    } catch (err) {
      console.error("Failed to save repair lead:", err)
      // Don't block the user — still let them reach us via WhatsApp.
    }
    setSubmitting(false)

    const message = `*Laptop Repair Request*%0A
Name: ${repairForm.name}%0A
Email: ${repairForm.email}%0A
Phone: ${repairForm.phone}%0A
Laptop Brand: ${repairForm.laptopBrand}%0A
Issue: ${repairForm.issue}%0A
Description: ${repairForm.description}`

    const whatsappUrl = `https://wa.me/2349165210359?text=${message}`
    window.open(whatsappUrl, "_blank")

    // Reset form
    setRepairForm({
      name: "",
      email: "",
      phone: "",
      laptopBrand: "",
      issue: "",
      description: "",
    })
  }

  return (
    <section id="repairs" className="py-16 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Professional Repair Services</h2>
          <p className="text-xl text-gray-600">
            Fill out the form below to request a laptop repair
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Repair Services List */}
          <div className="space-y-6">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">Our Repair Services</CardTitle>
                <CardDescription>Expert technicians ready to help</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: <Wrench className="w-6 h-6 text-white" />,
                    title: "Screen Replacement",
                    desc: "Professional LCD/LED screen repair",
                    price: "From $99 • 2-4 hours",
                  },
                  {
                    icon: <Zap className="w-6 h-6 text-white" />,
                    title: "Performance Upgrade",
                    desc: "RAM, SSD upgrades for better speed",
                    price: "From $79 • 1-2 hours",
                  },
                  {
                    icon: <Shield className="w-6 h-6 text-white" />,
                    title: "Virus Removal",
                    desc: "Complete system cleanup and security",
                    price: "From $59 • 3-5 hours",
                  },
                  {
                    icon: <Award className="w-6 h-6 text-white" />,
                    title: "Hardware Repair",
                    desc: "Motherboard, battery repairs",
                    price: "From $149 • 1-2 days",
                  },
                ].map((service, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-slate-900 p-3 rounded-lg">{service.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{service.title}</h4>
                      <p className="text-sm text-gray-600">{service.desc}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{service.price}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Why Choose Us?</h3>
              <ul className="space-y-3">
                {[
                  "Free diagnostics included",
                  "90-day warranty on all repairs",
                  "Certified technicians only",
                  "Fast turnaround time",
                  "Genuine parts only",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Repair Request Form */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl">Request a Repair</CardTitle>
              <CardDescription>
                Fill out the form and we'll contact you via WhatsApp
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRepairSubmit} className="space-y-4">
                {[
                  { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name" },
                  { label: "Email Address", name: "email", type: "email", placeholder: "your.email@example.com" },
                  { label: "Phone Number", name: "phone", type: "tel", placeholder: "+234 XXX XXX XXXX" },
                  { label: "Laptop Brand/Model", name: "laptopBrand", type: "text", placeholder: "e.g., HP Pavilion 15" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      {field.label} *
                    </label>
                    <Input
                      type={field.type}
                      name={field.name}
                      value={(repairForm as any)[field.name]}
                      onChange={handleRepairFormChange}
                      placeholder={field.placeholder}
                      required
                      className="w-full"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Issue Type *
                  </label>
                  <select
                    name="issue"
                    value={repairForm.issue}
                    onChange={handleRepairFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select an issue</option>
                    <option value="Screen Replacement">Screen Replacement</option>
                    <option value="Performance Upgrade">Performance Upgrade</option>
                    <option value="Virus Removal">Virus Removal</option>
                    <option value="Hardware Repair">Hardware Repair</option>
                    <option value="Battery Replacement">Battery Replacement</option>
                    <option value="Keyboard Repair">Keyboard Repair</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Describe the Problem *
                  </label>
                  <Textarea
                    name="description"
                    value={repairForm.description}
                    onChange={handleRepairFormChange}
                    placeholder="Please describe the issue in detail..."
                    required
                    rows={4}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {submitting ? "Submitting..." : "Submit via WhatsApp"}
                </Button>

                <p className="text-xs text-center text-gray-600">
                  By submitting, you'll be redirected to WhatsApp with your repair details
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Page