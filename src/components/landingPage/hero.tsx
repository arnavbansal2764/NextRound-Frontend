"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Users, Target, ArrowRight, Briefcase, FileText, Send } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  return (
    <div className="relative pt-20 pb-20 overflow-hidden">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r  from-blue-600 to-purple-600 mb-6">
              Your All-in-One Interview Preparation Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Master technical interviews, cultural fit assessments, resume enhancement, and strategic job approaches
              with NextRound's AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Link href="/sign-up">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Watch Demo</Link>
              </Button>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
          >
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-purple-500" />,
                title: "AI-Powered Analysis",
                description: "Get detailed feedback on your technical and behavioral responses",
              },
              {
                icon: <Users className="h-6 w-6 text-blue-500" />,
                title: "Cultural Fit Assessment",
                description: "Understand how well you align with company values and culture",
              },
              {
                icon: <FileText className="h-6 w-6 text-green-500" />,
                title: "Resume Enhancement",
                description: "Optimize your resume with AI-driven suggestions",
              },
              {
                icon: <Send className="h-6 w-6 text-red-500" />,
                title: "Cold Approach Assistant",
                description: "Craft personalized outreach messages for your dream jobs",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

