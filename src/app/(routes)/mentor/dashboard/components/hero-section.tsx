"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative overflow-hidden py-24 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-90" />
      <div className="container relative z-10 mx-auto px-4">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 text-5xl font-bold leading-tight md:text-6xl"
        >
          Empower Your Journey <br />
          <span className="text-yellow-300">as a Mentor</span>
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8 max-w-2xl text-xl"
        >
          Connect, inspire, and guide the next generation of professionals. Your expertise can shape careers and change lives.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button size="lg" className="bg-white text-purple-600 hover:bg-yellow-300 hover:text-purple-700 transition-all duration-300">
            Start Mentoring <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

