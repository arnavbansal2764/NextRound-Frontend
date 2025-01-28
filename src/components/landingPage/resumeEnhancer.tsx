"use client"

import { motion, useAnimation } from "framer-motion"
import { FileText, Edit, TrendingUp, CheckSquare, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { GradientBackground } from "./gradientbg"
import { Button } from "@/components/ui/button"

export default function ResumeEnhancer() {
    const features = [
        {
            icon: <Edit className="h-8 w-8 text-blue-500" />,
            title: "AI-Powered Suggestions",
            description: "Get intelligent recommendations to improve your resume content.",
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-green-500" />,
            title: "ATS Optimization",
            description: "Ensure your resume passes through Applicant Tracking Systems.",
        },
        {
            icon: <CheckSquare className="h-8 w-8 text-purple-500" />,
            title: "Industry-Specific Keywords",
            description: "Tailor your resume with relevant keywords for your target industry.",
        },
    ]

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    }

    return (
        <section className="relative py-24 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        animate={controls}
                        variants={containerVariants}
                        ref={ref}
                    >
                        <motion.h2
                            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                            variants={itemVariants}
                        >
                            Elevate Your Resume
                        </motion.h2>
                        <motion.p className="text-xl text-gray-600 dark:text-gray-300 mb-10" variants={itemVariants}>
                            Stand out from the crowd with our AI-powered resume enhancement tool. Optimize your resume for both human
                            recruiters and applicant tracking systems.
                        </motion.p>
                        <motion.ul className="space-y-6 mb-10" variants={containerVariants}>
                            {features.map((feature, index) => (
                                <motion.li key={index} variants={itemVariants} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">{feature.icon}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                        <motion.div variants={itemVariants}>
                            <Button className="group">
                                Enhance Your Resume
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="lg:w-1/2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, scale: 0.8 },
                            visible: {
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 100,
                                    delay: 0.4,
                                },
                            },
                        }}
                    >
                        <div className="relative">
                            <Image
                                src="/placeholder.svg?height=400&width=600"
                                alt="Resume Enhancement Tool"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 mix-blend-overlay rounded-lg"></div>
                            <motion.div
                                className="absolute -top-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <FileText className="h-6 w-6" />
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-4 -right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <TrendingUp className="h-6 w-6" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

