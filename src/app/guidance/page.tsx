"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, BookOpen } from "lucide-react"
import toast from "react-hot-toast"
import AnimatedBackground from "@/components/animated-background"

interface Course {
    courseName: string
    courseLink: string
}

interface ApiResponse {
    courses: Course[]
}

export default function CareerGuidancePage() {
    const [currentStatus, setCurrentStatus] = useState("")
    const [endGoal, setEndGoal] = useState("")
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const promise = axios.post('/api/guidance', { currentStatus, endGoal })

        toast.promise(
            promise,
            {
                loading: 'Analyzing your career path...',
                success: 'Career guidance ready!',
                error: 'Failed to analyze. Please try again.',
            }
        )

        try {
            const { data } = await promise
            setCourses(data.courses)
        } catch (error) {
            console.error('Error fetching career guidance:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <AnimatedBackground />
            <div className="relative z-10">
                <motion.div
                    className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-24 pb-32 relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.h1
                            className="text-5xl font-extrabold mb-4 tracking-tight"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Career Guidance
                        </motion.h1>
                        <motion.p
                            className="text-xl font-light max-w-2xl"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Discover your path to success with personalized course recommendations tailored to your aspirations.
                        </motion.p>
                    </div>
                </motion.div>

                <div className="container mx-auto px-4 py-16 -mt-24 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Card className="mb-12 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Your Career Journey</CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-300">
                                    Tell us about your current status and future goals
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentStatus" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Current Status
                                        </Label>
                                        <Input
                                            id="currentStatus"
                                            value={currentStatus}
                                            onChange={(e) => setCurrentStatus(e.target.value)}
                                            placeholder="e.g., Junior Developer"
                                            required
                                            className="w-full bg-white dark:bg-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endGoal" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            End Goal
                                        </Label>
                                        <Input
                                            id="endGoal"
                                            value={endGoal}
                                            onChange={(e) => setEndGoal(e.target.value)}
                                            placeholder="e.g., Senior Full Stack Developer"
                                            required
                                            className="w-full bg-white dark:bg-gray-700"
                                        />
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                "Get Career Guidance"
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <AnimatePresence>
                        {courses.length > 0 && (
                            <motion.div key="courses" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Recommended Courses</h2>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {courses.map((course, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Card className="h-full flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
                                                <CardHeader>
                                                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                                                        {course.courseName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-grow">
                                                    <motion.a
                                                        href={course.courseLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                                        whileHover={{ x: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <BookOpen className="mr-2 h-4 w-4" />
                                                        View Course
                                                    </motion.a>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

