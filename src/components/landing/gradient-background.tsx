"use client"

import { motion } from "framer-motion"


export function GradientBackground() {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

            {/* Animated gradient orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-700 rounded-full filter blur-3xl opacity-20 dark:opacity-30"
                animate={{
                    x: [0, 30, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            />

            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full filter blur-3xl opacity-20 dark:opacity-30"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            />

            <motion.div
                className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400 dark:bg-cyan-700 rounded-full filter blur-3xl opacity-20 dark:opacity-30"
                animate={{
                    x: [0, 40, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            />
        </div>
    )
}

