"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedGradientProps {
  className?: string
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ className }) => {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      animate={{
        background: [
          'linear-gradient(to right, #8e2de2, #4a00e0)',
          'linear-gradient(to right, #00c6ff, #0072ff)',
          'linear-gradient(to right, #f857a6, #ff5858)',
          'linear-gradient(to right, #8e2de2, #4a00e0)',
        ],
      }}
      transition={{
        duration: 10,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  )
}

