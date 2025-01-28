"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Clipboard, Sparkles, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ResponseContent from "@/components/cold-approach/responseContent"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AnalyzingDetails from "@/components/cold-approach/analyze"

export default function ColdApproach() {
    interface ResponseData {
        content: string;
    }

    const [responseData, setResponseData] = useState<ResponseData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [platform, setPlatform] = useState("email")
    const [showLoading, setShowLoading] = useState(false)
    const [showMarkdown, setShowMarkdown] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const handleSubmit = async (event:any) => {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.target)
        const user_info = formData.get("user_info")
        const job_description = formData.get("job_description")
        const approach_platform = platform

        try {
            setShowLoading(true);
            const response = await fetch("/api/cold-approach", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_info, job_description, approach_platform }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate cold approach content")
            }

            const data = await response.json()
            setResponseData(data)
            setShowMarkdown(true)
        } catch (error) {
            console.error("Error:", error)
            setError("An error occurred while generating the cold approach content")
        } finally {
            setIsLoading(false)
            setShowLoading(false)
        }
    }
    const handleStartApproach = (event:any) => {
        if (!session?.user?.id) {
            router.push("/auth");
        } else {
            handleSubmit(event);
        }
    }
    return (
        <div className="relative min-h-screen pt-20 pb-20 overflow-hidden">
            {/* Background gradient and pattern */}
            {showLoading && (<AnalyzingDetails/>)}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
                            Cold Approach Assistant
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Generate personalized cold approach messages for your job applications.
                        </p>
                    </motion.div>

                    <motion.form
                        onSubmit={handleStartApproach}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <label htmlFor="user_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Information
                            </label>
                            <textarea
                                id="user_info"
                                name="user_info"
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your background, skills, and experience..."
                            ></textarea>
                        </div>
                        <div className="mb-6">
                            <label
                                htmlFor="job_description"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Job Description
                            </label>
                            <textarea
                                id="job_description"
                                name="job_description"
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Paste the job description here..."
                            ></textarea>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Approach Platform
                            </label>
                            <Select onValueChange={setPlatform} defaultValue={platform}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                            size="lg"
                        >
                            {isLoading ? (
                                <motion.div
                                    className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                ></motion.div>
                            ) : (
                                <>
                                    <Send className="mr-2" size={18} />
                                    Generate Cold Approach
                                </>
                            )}
                        </Button>
                        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                    </motion.form>

                    {/* Feature highlights */}
                    {!showMarkdown && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                        >
                            {[
                                {
                                    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
                                    title: "AI-Powered Personalization",
                                    description: "Get tailored cold approach messages based on your background and the job description",
                                },
                                {
                                    icon: <Users className="h-6 w-6 text-blue-500" />,
                                    title: "Multi-Platform Support",
                                    description: "Generate messages for both email and LinkedIn outreach",
                                },
                                {
                                    icon: <Target className="h-6 w-6 text-green-500" />,
                                    title: "Targeted Approach",
                                    description: "Craft messages that highlight your relevant skills and experience",
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
                                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                    

                    <AnimatePresence>
                        {responseData && <ResponseContent content={responseData.content} platform={platform} />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

