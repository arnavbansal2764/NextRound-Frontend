"use client"

import { motion } from "framer-motion"
import { Users, Award, GraduationCap, Building } from "lucide-react"
import { useInView } from "react-intersection-observer"

export default function Stats() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    
    const stats = [
        {
            icon: <Users className="h-8 w-8 text-purple-500" />,
            value: "15,000+",
            label: "Active Users",
            delay: 0,
        },
        {
            icon: <Award className="h-8 w-8 text-blue-500" />,
            value: "92%",
            label: "Success Rate",
            delay: 0.1,
        },
        {
            icon: <GraduationCap className="h-8 w-8 text-emerald-500" />,
            value: "750+",
            label: "UPSC Selections",
            delay: 0.2,
        },
        {
            icon: <Building className="h-8 w-8 text-red-500" />,
            value: "1200+",
            label: "State PCS Selections",
            delay: 0.3,
        },
    ]

    return (
        <section className="relative py-16 overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: stat.delay, duration: 0.5 }}
                            whileHover={{
                                y: -5,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            }}
                        >
                            <div className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-700">{stat.icon}</div>
                            <motion.div
                                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={inView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: stat.delay + 0.2, duration: 0.5 }}
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-gray-600 dark:text-gray-300 mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

