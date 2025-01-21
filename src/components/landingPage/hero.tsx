"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Users, Target, ArrowRight } from "lucide-react";
import Image from "next/image";

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
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              Ace Your Next Interview with Confidence
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Comprehensive interview preparation platform combining AI-powered
              technical assessments and cultural fit analysis to help you land
              your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Link href="/sign-up">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
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
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-purple-500" />,
                title: "AI-Powered Analysis",
                description:
                  "Get detailed feedback on your technical and behavioral responses",
              },
              {
                icon: <Users className="h-6 w-6 text-blue-500" />,
                title: "Cultural Fit Assessment",
                description:
                  "Understand how well you align with company values and culture",
              },
              {
                icon: <Target className="h-6 w-6 text-green-500" />,
                title: "Personalized Coaching",
                description:
                  "Receive tailored recommendations to improve your interview skills",
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
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Screenshot showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>
            <div className="relative z-20 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=1200"
                alt="NextRound Interview UI"
                width={1200}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 mix-blend-overlay"></div>
            </div>
            {/* Floating elements */}
            <motion.div
              className="absolute top-1/4 -left-8 w-16 h-16 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
              animate={{
                x: [0, 30, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
            <motion.div
              className="absolute top-1/3 -right-8 w-20 h-20 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
              animate={{
                x: [0, -30, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
            <motion.div
              className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 9,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
