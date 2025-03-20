"use client"

import { motion, useAnimation } from "framer-motion"
import { Code2, Users2, Brain, CheckCircle2, Zap, Target } from "lucide-react"
import { GradientBackground } from "./gradient-background"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

export default function Features() {
    const features = [
        {
            icon: <Code2 className="h-12 w-12 text-purple-500" />,
            title: "Technical Interview Preparation",
            description: "Practice coding challenges, system design questions, and get real-time feedback on your solutions.",
            image: "/placeholder.svg?height=300&width=400",
            color: "from-purple-400 to-purple-600",
            items: [
                "In-depth code analysis",
                "System design exercises",
                "Algorithm optimization tips",
                "Real-world problem scenarios",
            ],
        },
        {
            icon: <Users2 className="h-12 w-12 text-blue-500" />,
            title: "Behavioral Interview Training",
            description: "Master the art of behavioral interviews with our comprehensive preparation system.",
            image: "/placeholder.svg?height=300&width=400",
            color: "from-blue-400 to-blue-600",
            items: [
                "STAR method coaching",
                "Common question practice",
                "Response structure guidance",
                "Communication skills enhancement",
            ],
        },
        {
            icon: <Brain className="h-12 w-12 text-cyan-500" />,
            title: "Cultural Fit Assessment",
            description: "Understand company cultures and assess your alignment with potential employers.",
            image: "/placeholder.svg?height=300&width=400",
            color: "from-cyan-400 to-cyan-600",
            items: [
                "Company values analysis",
                "Work style evaluation",
                "Team dynamics insights",
                "Cultural adaptation strategies",
            ],
        },
        {
            icon: <Target className="h-12 w-12 text-red-500" />,
            title: "Cold Approach Assistant",
            description: "Craft personalized outreach messages and expand your professional network effectively.",
            image: "/placeholder.svg?height=300&width=400",
            color: "from-red-400 to-red-600",
            items: [
                "Personalized outreach templates",
                "Follow-up strategies",
                "Network expansion tactics",
                "Response rate optimization",
            ],
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

    return (
        <section className="relative py-32 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                        Comprehensive Interview Preparation
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Everything you need to succeed in your next interview, from technical skills to cultural fit.
                    </p>
                </motion.div>

                <div className="space-y-32">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            ref={index === 0 ? ref : undefined}
                            initial="hidden"
                            animate={controls}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.2,
                                        delayChildren: index * 0.1,
                                    },
                                },
                            }}
                            className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}
                        >
                            <motion.div
                                className="lg:w-1/2"
                                variants={{
                                    hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                                    visible: {
                                        opacity: 1,
                                        x: 0,
                                        transition: { duration: 0.6 },
                                    },
                                }}
                            >
                                <motion.div
                                    className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                                    variants={{
                                        hidden: { scale: 0 },
                                        visible: {
                                            scale: 1,
                                            transition: { type: "spring", stiffness: 200 },
                                        },
                                    }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3
                                    className={`text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${feature.color}`}
                                >
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{feature.description}</p>
                                <ul className="space-y-4">
                                    {feature.items.map((item, itemIndex) => (
                                        <motion.li
                                            key={itemIndex}
                                            variants={{
                                                hidden: { opacity: 0, x: -20 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                            className="flex items-start space-x-3"
                                        >
                                            <CheckCircle2
                                                className={`h-6 w-6 text-${feature.color.split("-")[1]}-500 mt-0.5 flex-shrink-0`}
                                            />
                                            <span className="text-gray-700 dark:text-gray-200">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                className="lg:w-1/2"
                                variants={{
                                    hidden: { opacity: 0, scale: 0.8 },
                                    visible: {
                                        opacity: 1,
                                        scale: 1,
                                        transition: {
                                            type: "spring",
                                            stiffness: 100,
                                            delay: 0.2,
                                        },
                                    },
                                }}
                            >
                                <div className="relative">
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 blur-xl rounded-2xl transform -rotate-6`}
                                    ></div>
                                    <motion.div
                                        className="relative bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl overflow-hidden"
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: index % 2 === 0 ? 2 : -2,
                                            transition: { type: "spring", stiffness: 400 },
                                        }}
                                    >
                                        <Image
                                            src={feature.image || "/placeholder.svg"}
                                            alt={feature.title}
                                            width={400}
                                            height={300}
                                            className="rounded-xl w-full h-auto"
                                        />

                                        <motion.div
                                            className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                        >
                                            <Zap className="h-8 w-8" />
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

