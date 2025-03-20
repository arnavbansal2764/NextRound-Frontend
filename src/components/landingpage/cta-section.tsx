"use client"

import { motion, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Landmark, Building, GraduationCap, BookOpen } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import Link from "next/link"
import { GradientBackground } from "./gradient-background"

export default function CTASection() {
    const controls = useAnimation()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    useEffect(() => {
        if (inView) {
            controls.start("visible")
        }
    }, [controls, inView])

    const benefits = [
        "Realistic UPSC interview simulations with expert panelists",
        "Specialized HCS & PCS interview preparation",
        "Subject-specific practice for optional papers",
        "Bilingual support in English & Hindi",
        "Detailed performance analysis and feedback",
        "Personalized improvement suggestions",
    ]

    const examTypes = [
        {
            icon: <Landmark className="h-10 w-10 text-white" />,
            name: "UPSC CSE",
            color: "from-emerald-600 to-emerald-800",
        },
        {
            icon: <Building className="h-10 w-10 text-white" />,
            name: "State PCS",
            color: "from-blue-600 to-blue-800",
        },
        {
            icon: <GraduationCap className="h-10 w-10 text-white" />,
            name: "HCS",
            color: "from-purple-600 to-purple-800",
        },
        {
            icon: <BookOpen className="h-10 w-10 text-white" />,
            name: "Subject-wise",
            color: "from-red-600 to-red-800",
        },
    ]

    return (
        <section className="relative py-24 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    ref={ref}
                    className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                    initial="hidden"
                    animate={controls}
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.6 },
                        },
                    }}
                >
                    <div className="p-8 md:p-12">
                        <motion.div
                            className="text-center mb-12"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.6, delay: 0.1 },
                                },
                            }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                                Ready to Excel in Civil Service Interviews?
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Join thousands of successful candidates who have transformed their interview performance with
                                NextRound's specialized civil service preparation.
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.2,
                                    },
                                },
                            }}
                        >
                            {examTypes.map((exam, index) => (
                                <motion.div
                                    key={index}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    className={`bg-gradient-to-r ${exam.color} rounded-xl p-4 text-center text-white`}
                                >
                                    <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                        {exam.icon}
                                    </div>
                                    <h3 className="font-bold">{exam.name}</h3>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="grid md:grid-cols-2 gap-4 mb-12"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.3,
                                    },
                                },
                            }}
                        >
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start space-x-3"
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-gray-200">{benefit}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="flex flex-col sm:flex-row justify-center gap-4"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.6, delay: 0.5 },
                                },
                            }}
                        >
                            <Button
                                size="lg"
                                asChild
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 group"
                            >
                                <Link href="/sign-up">
                                    Start Your Free Trial
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/pricing">View Pricing</Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

