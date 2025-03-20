"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, ArrowRight, Play, CheckCircle } from "lucide-react"
import Image from "next/image"
import { GradientBackground } from "./gradient-background"

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
            <GradientBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6"
                        >
                            <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                AI-Powered Interview Preparation
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600">
                                Master Your Interviews
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            Comprehensive AI-powered interview preparation for UPSC, HCS, PCS, Subject-Specific assessments and Technical Interviews with
                            personalized feedback and realistic simulations.
                        </motion.p>

                        <motion.div
                            className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <Button
                                size="lg"
                                asChild
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 group w-full sm:w-auto"
                            >
                                <Link href="/sign-up">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="group w-full sm:w-auto">
                                <Link href="/demo" className="flex items-center justify-center">
                                    <Play className="mr-2 h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110" />
                                    Watch Demo
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="space-y-3"
                        >
                            {[
                                "Realistic interview simulations with expert panelists",
                                "Specialized HCS & PCS interview preparation",
                                "Subject-specific practice for optional papers",
                                "Bilingual support in English & Hindi",
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    className="flex items-start"
                                >
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-2xl">
                            <Image
                                src="/placeholder.svg?height=600&width=800"
                                alt="NextRound UPSC Interview Interface"
                                width={800}
                                height={600}
                                className="rounded-xl"
                                priority
                            />

                            <motion.div
                                className="absolute -top-6 -right-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-2xl shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                            >
                                <span className="font-bold">UPSC CSE</span>
                                <div className="text-xs mt-1">Interview Preparation</div>
                            </motion.div>

                            <motion.div
                                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium">Bilingual Support</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl rounded-full transform -translate-y-1/4 translate-x-1/4 z-0"></div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 5V19M12 19L5 12M12 19L19 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>
            </div>
        </div>
    )
}

