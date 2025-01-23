"use client"

import type React from "react"
import { motion } from "framer-motion"

const AnimatedBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900"
                animate={{
                    background: [
                        "linear-gradient(to bottom right, #E6F3FF, #F0E6FF)",
                        "linear-gradient(to bottom right, #E6FFFA, #FFE6E6)",
                        "linear-gradient(to bottom right, #FFF0E6, #E6F7FF)",
                    ],
                }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white dark:bg-gray-800 opacity-20"
                    style={{
                        width: Math.random() * 40 + 10,
                        height: Math.random() * 40 + 10,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 100 - 50],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                    }}
                />
            ))}
        </div>
    )
}

export default AnimatedBackground

