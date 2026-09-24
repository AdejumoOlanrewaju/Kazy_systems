import React from 'react'
import { motion } from "framer-motion";
const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center gap-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <motion.p
                className="text-amber-700 font-medium text-2xl mt-1 absolute top-[55%] sm:top-[40%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Kazy Systems
            </motion.p>
        </div>
    )
}

export default LoadingOverlay



