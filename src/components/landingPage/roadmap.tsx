"use client"

import { motion, useAnimation, useScroll, useTransform } from "framer-motion"
import { CheckCircle, ChevronRight, Code, Users, FileText, Send } from "lucide-react"
import { GradientBackground } from "./gradientbg"
import { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { useRouter } from "next/navigation"

export default function Roadmap() {
    const steps = [
        {
            title: "Technical Interview Prep",
            description: "Master coding challenges and system design questions",
            features: ["AI-powered code analysis", "Real-time feedback", "Extensive problem library"],
            icon: Code,
            color: "from-blue-400 to-blue-600",
            page: "/interview",
        },
        {
            title: "Cultural Fit Assessment",
            description: "Align your values with potential employers",
            features: ["Company culture insights", "Personalized fit scores", "Interview strategy tips"],
            icon: Users,
            color: "from-purple-400 to-purple-600",
            page: "/cultural-fit",
        },
        {
            title: "Resume Enhancement",
            description: "Optimize your resume for maximum impact",
            features: ["AI-driven suggestions", "Industry-specific keywords", "ATS optimization"],
            icon: FileText,
            color: "from-green-400 to-green-600",
            page: "/resume-enhancer",
        },
        {
            title: "Cold Approach Mastery",
            description: "Stand out with personalized outreach",
            features: ["Tailored message templates", "Follow-up strategies", "Network expansion tips"],
            icon: Send,
            color: "from-red-400 to-red-600",
            page: "/cold-approach",
        },
    ]

    const controls = useAnimation()
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])
    const pathOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

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
                staggerChildren: 0.3,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
    }
    const router = useRouter();
    return (
        <section className="relative py-32 overflow-hidden perspective-1000">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-6xl font-bold text-center mb-24 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"
                >
                    Your Path to Interview Success
                </motion.h2>
                <motion.div
                    className="max-w-6xl mx-auto relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    ref={ref}
                >
                    <svg
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full"
                        viewBox="0 0 100 400"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M50,0 Q70,100 30,200 Q10,300 50,400"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            style={{ pathLength, opacity: pathOpacity }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#9333ea" />
                                <stop offset="50%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`flex mb-32 last:mb-0 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                            style={{ perspective: 1000 }}
                            onClick={()=>router.push(step.page)}
                        >
                            <motion.div
                                className={`w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 relative ${index % 2 === 0 ? "mr-16" : "ml-16"}`}
                                whileHover={{ scale: 1.05, rotateY: index % 2 === 0 ? 5 : -5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => router.push(step.page)}
                            >
                                <motion.div
                                    className={`absolute top-8 -mt-2 w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-lg`}
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    onClick={() => router.push(step.page)}
                                >
                                    <step.icon size={32} />
                                </motion.div>
                                <div className={`ml-20 ${index % 2 === 0 ? "" : "text-right"}`} onClick={() => router.push(step.page)}>
                                    <h3
                                        className={`text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${step.color}`}
                                        onClick={() => router.push(step.page)}
                                    >
                                        {step.title}
                                    </h3>
                                    <p onClick={() => router.push(step.page)} className="text-gray-600 dark:text-gray-300 mb-6">{step.description}</p>
                                    <ul onClick={() => router.push(step.page)} className={`space-y-3 ${index % 2 === 0 ? "" : "flex flex-col items-end"}`}>
                                        {step.features.map((feature, featureIndex) => (
                                            <motion.li
                                                key={featureIndex}
                                                className="flex items-center space-x-2"
                                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + featureIndex * 0.1 }}
                                                onClick={() => router.push(step.page)}
                                            >
                                                <CheckCircle className={`h-5 w-5 text-${step.color.split("-")[1]}-500 flex-shrink-0`} onClick={() => router.push(step.page)} />
                                                <span className="text-sm text-gray-600 dark:text-gray-300" onClick={() => router.push(step.page)}>{feature}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                                <motion.div
                                    className={`absolute ${index % 2 === 0 ? "-right-8" : "-left-8"} top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center`}
                                    whileHover={{ scale: 1.2, rotate: index % 2 === 0 ? 90 : -90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(step.page)}
                                >
                                    <ChevronRight
                                        className={`h-8 w-8 text-${step.color.split("-")[1]}-600 ${index % 2 === 0 ? "" : "rotate-180"}`}
                                        onClick={() => router.push(step.page)}
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

