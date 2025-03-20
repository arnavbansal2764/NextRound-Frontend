"use client"

import { motion } from "framer-motion"
import { GradientBackground } from "./gradient-background"
import { Building, GraduationCap, BookOpen, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ExamCategories() {
    const router = useRouter()

    const categories = [
        {
            title: "UPSC CSE",
            icon: <Landmark className="h-10 w-10 text-emerald-500" />,
            description: "Comprehensive preparation for Union Public Service Commission Civil Services Examination",
            color: "from-emerald-400 to-emerald-600",
            link: "/upsc/main",
            subjects: ["General Studies", "CSAT", "Optional Papers", "Ethics", "Essay"],
        },
        {
            title: "State PCS",
            icon: <Building className="h-10 w-10 text-blue-500" />,
            description: "Specialized preparation for Provincial Civil Services examinations across different states",
            color: "from-blue-400 to-blue-600",
            link: "/pcs",
            subjects: ["State GK", "Administration", "Current Affairs", "State History"],
        },
        {
            title: "HCS",
            icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
            description: "Tailored interview preparation for Haryana Civil Services examination",
            color: "from-purple-400 to-purple-600",
            link: "/hcs",
            subjects: ["Haryana GK", "Administration", "Current Affairs", "Haryana History"],
        },
        {
            title: "Subject-wise",
            icon: <BookOpen className="h-10 w-10 text-red-500" />,
            description: "Focused preparation on specific UPSC subjects to strengthen your knowledge base",
            color: "from-red-400 to-red-600",
            link: "/upsc/subjects",
            subjects: ["Economics", "Geography", "History", "Polity", "Science & Tech"],
        },
    ]
    

    return (
        <section className="relative py-24 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600">
                        Specialized Exam Preparation
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Tailored interview simulations for various civil service examinations to help you excel
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col"
                        >
                            <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    {category.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                                <p className="text-white/80">{category.description}</p>
                            </div>

                            <div className="p-6 flex-grow">
                                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Key Focus Areas:</h4>
                                <ul className="space-y-2 mb-6">
                                    {category.subjects.map((subject, i) => (
                                        <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} mr-2`}></div>
                                            {subject}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="px-6 pb-6 mt-auto">
                                <Button
                                    onClick={() => router.push(category.link)}
                                    className={`w-full bg-gradient-to-r ${category.color} text-white hover:opacity-90`}
                                >
                                    Explore {category.title}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

