"use client"

import { motion, useAnimation, useInView } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef } from "react"
import { GradientBackground } from "./gradientbg"
import { ArrowRight, Code, Users, FileText, Send } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InterviewUICollage() {
    const images = [
        {
            src: "/placeholder.svg?height=300&width=400",
            alt: "Technical Interview Interface",
            icon: Code,
            color: "from-blue-400 to-blue-600",
            link : '/interview'
        },
        {
            src: "/placeholder.svg?height=300&width=400",
            alt: "Cultural Fit Assessment",
            icon: Users,
            color: "from-purple-400 to-purple-600",
            link : '/cultural-fit'
        },
        {
            src: "/placeholder.svg?height=300&width=400",
            alt: "Resume Enhancement Tool",
            icon: FileText,
            color: "from-green-400 to-green-600",
            link : '/resume-enhancer'
        },
        {
            src: "/placeholder.svg?height=300&width=400",
            alt: "Cold Approach Assistant",
            icon: Send,
            color: "from-red-400 to-red-600",
            link : '/cold-approach'
        },
    ]

    const controls = useAnimation()
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const router = useRouter()
    useEffect(() => {
        if (inView) {
            controls.start("visible")
        }
    }, [controls, inView])

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
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

    return (
        <section className="relative py-32 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"
                >
                    Experience Our Intuitive Interface
                </motion.h2>
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 perspective-1000"
                >
                    {images.map((image, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative group"
                            whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5, z: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="relative overflow-hidden rounded-xl shadow-2xl transform transition-transform duration-300 group-hover:rotate-3">
                                <Image
                                    src={image.src || "/placeholder.svg"}
                                    alt={image.alt}
                                    width={400}
                                    height={300}
                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${image.color} flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-300`}
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 0.9 }}
                                >
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                            className="mb-4"
                                        >
                                            <image.icon className="w-16 h-16 text-white mx-auto" />
                                        </motion.div>
                                        <p className="text-white text-2xl font-bold mb-4">{image.alt}</p>
                                        <motion.button
                                            className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold flex items-center space-x-2 group/button mx-auto"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(image.link)}
                                        >
                                            <span>Explore</span>
                                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                className="absolute -bottom-4 -right-4 w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-300"
                                whileHover={{ scale: 1.1, rotate: 0 }}
                            >
                                <span className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${image.color}`}>
                                    0{index + 1}
                                </span>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

