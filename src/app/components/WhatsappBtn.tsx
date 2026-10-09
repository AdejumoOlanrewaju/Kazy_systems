"use client"
import React from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LaptopType, ProductConfiguration } from "@/lib/types"
import { buildProductUrl } from "@/lib/slug"
import { getConfigurationLabel, getEffectivePrice, isDealLive } from "@/lib/productDisplay"

const WHATSAPP_NUMBER = "2349165210359"

const CONDITION_LABEL = { new: "New", used: "Used", refurbished: "Refurbished" } as const

type Props = {
  product?: LaptopType
  configuration?: ProductConfiguration | null
}

const WhatsappBtn = ({ product, configuration }: Props) => {
  if (!product) return null

  const config = configuration ?? undefined
  const hasConfigs = (product.configurations?.length ?? 0) > 0
  const needsChoice = hasConfigs && !config
  const stock = config ? config.stockQuantity : product.stockQuantity
  const disabled = needsChoice || (!needsChoice && stock < 1)

  const handleClick = () => {
    // Same pricing logic as the product page, so the message always matches
    // what the customer was looking at (deal price, selected configuration).
    const { price, oldPrice } = getEffectivePrice(product, config)
    const onDeal = isDealLive(product) && (product.discount ?? 0) > 0
    const condition = product.condition || "used"

    const specs = !config
      ? (product.specSheet ?? []).slice(0, 3).map((s) => `${s.label}: ${s.value}`).join(", ")
      : ""

    const priceNote = oldPrice
      ? onDeal
        ? ` (deal price — regular ₦${oldPrice.toLocaleString()})`
        : ` (was ₦${oldPrice.toLocaleString()})`
      : ""

    const lines: (string | null)[] = [
      "Hello, I'd like to order this laptop:",
      "",
      `*${product.name}*`,
      config ? `Configuration: ${getConfigurationLabel(config)}` : null,
      specs ? `Specs: ${specs}` : null,
      `Condition: ${CONDITION_LABEL[condition]}`,
      `Price: ₦${price.toLocaleString()}${priceNote}`,
      "",
      `${window.location.origin}${buildProductUrl(product.name, product.dbID)}`,
    ]

    const message = lines.filter((l): l is string => l !== null).join("\n")
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      size="lg"
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Order via WhatsApp
    </Button>
  )
}

export default WhatsappBtn