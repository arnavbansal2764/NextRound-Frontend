"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Sparkles, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import ResumeContent from "@/components/resume-enhancer/resumeContent"
import UploadModal from "@/components/resume-enhancer/uploadModal"
import axios from "axios"
import AnalyzingResumeAnimation from "@/components/resume-enhancer/analyzing"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ResumeEnhancerPage() {
    interface ResumeData {
        content: string;
    }

    const [resumeData, setResumeData] = useState<ResumeData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [resume, setResume] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showLoading, setShowLoading] = useState(false)
    const [showMarkdown, setShowMarkdown] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()
    const uploadResume = async (file: File) => {
        try {
            const fileName = `${Date.now()}-${file.name}`
            const fileType = file.type

            const res = await axios.post("/api/s3/upload", { fileName, fileType })
            const { uploadUrl } = await res.data

            if (!uploadUrl) {
                throw new Error("Failed to get upload URL")
            }

            const upload = await axios.put(uploadUrl, file)
            if (upload.status !== 200) {
                throw new Error("Failed to upload resume")
            }

            const resumeUrl = uploadUrl.split("?")[0]
            setResume(resumeUrl)
            setIsModalOpen(false)
        } catch (error) {
            console.error("Upload failed:", error)
            setError("Failed to upload resume. Please try again.")
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const jobDescription = formData.get("jobDescription") as string

        // Validation checks
        if (!resume) {
            setError("Please upload a resume.")
            setIsLoading(false)
            return
        }

        if (!jobDescription) {
            setError("Please provide a job description.")
            setIsLoading(false)
            return
        }

        try {
            setShowLoading(true);
            const response = await fetch("/api/enhancer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ resumeUrl: resume, jobDescription }),
            })

            if (!response.ok) {
                throw new Error("Failed to fetch enhanced resume")
            }

            const data = await response.json()
            setResumeData(data)
            setShowMarkdown(true)
        } catch (error) {
            console.error("Error:", error)
            setError("An error occurred while enhancing the resume")
        } finally {
            setIsLoading(false)
            setShowLoading(false)
        }
    }
    const handleStartEnhance = () => {
        if (!session?.user?.id) {
            router.push("/auth");
        } else {
            setIsModalOpen(true)
        }
    }
    return (
        <div className="relative min-h-screen pt-20 pb-20 overflow-hidden">
            {showLoading && (<AnalyzingResumeAnimation/>)}
            {/* Background gradient and pattern */}
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
                            Resume Enhancer
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Upload your resume and get AI-powered suggestions to improve it and match your target job description.
                        </p>
                    </motion.div>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <Button
                                onClick={() => handleStartEnhance()}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                                size="lg"
                            >
                                <FileText className="mr-2" size={18} />
                                {resume ? "Change Resume" : "Upload Resume"}
                            </Button>
                            {resume && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Resume uploaded successfully</p>}
                        </div>
                        <div className="mb-6">
                            <label
                                htmlFor="jobDescription"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Job Description
                            </label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Paste the job description here..."
                            ></textarea>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading || !resume}
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
                                    <Upload className="mr-2" size={18} />
                                    Enhance Resume
                                </>
                            )}
                        </Button>
                        {/* {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>} */}
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
                                    title: "AI-Powered Analysis",
                                    description: "Get detailed feedback on your resume content",
                                },
                                {
                                    icon: <Users className="h-6 w-6 text-blue-500" />,
                                    title: "Job Description Matching",
                                    description: "Tailor your resume to specific job requirements",
                                },
                                {
                                    icon: <Target className="h-6 w-6 text-green-500" />,
                                    title: "Personalized Suggestions",
                                    description: "Receive tailored recommendations to improve your resume",
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
                    

                    <AnimatePresence>{resumeData && <ResumeContent content={resumeData.content} />}</AnimatePresence>
                </div>
            </div>

            <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={uploadResume} />
        </div>
    )
}
