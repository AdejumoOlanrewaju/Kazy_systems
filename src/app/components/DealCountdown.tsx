"use client"
import React from "react"
import { Clock } from "lucide-react"
import { useCountdown } from "@/lib/useCountdown"
import { span } from "framer-motion/client"

const DealCountdown = ({ endsAt }: { endsAt?: number | null }) => {
  const parts = useCountdown(endsAt)
  if (!parts) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full w-fit">
      <Clock className="w-3.5 h-3.5" />
      {parts.expired ? (
        <span>Deal ended</span>
      ) : (
        <div>
          <span>Deal has just</span>
          <span>
            {parts.days > 0 && ` ${parts.days}d `}
            {String(parts.hours).padStart(2, "0")}:{String(parts.minutes).padStart(2, "0")}:{String(parts.seconds).padStart(2, "0")} left
          </span>
        </div>
      )}
    </div>
  )
}

export default DealCountdown