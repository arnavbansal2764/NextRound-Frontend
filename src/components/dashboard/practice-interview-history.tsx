"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import { Star, ChevronDown, ChevronUp } from "lucide-react"

interface PracticeInterview {
    id: string
    createdAt: string
    level: string
    totalQuestions: number
    analysis: string
    scores: Array<{ score: number }>
    averageScore: number
    totalScore: number
}

export default function PracticeInterviewHistory() {
    const [practiceInterviews, setPracticeInterviews] = useState<PracticeInterview[]>([])
    const [expandedInterview, setExpandedInterview] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchPracticeInterviews() {
            try {
                const response = await fetch("/api/user/profile")
                if (!response.ok) {
                    throw new Error("Failed to fetch practice interviews")
                }
                const userData = await response.json()
                setPracticeInterviews(userData.practiceInterviews)
            } catch (error) {
                console.error("Error fetching practice interviews:", error)
                toast({
                    title: "Error",
                    description: "Failed to load practice interview history. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchPracticeInterviews()
    }, [toast])

    if (practiceInterviews.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
            >
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    Practice Interview History
                </h2>
                <p className="text-lg text-gray-600">
                    No practice interviews found. Start your first practice interview to see your history!
                </p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-7xl mx-auto"
        >
            <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Practice Interview History
            </h2>
            <div className="space-y-6">
                {practiceInterviews.map((interview) => (
                    <Card key={interview.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-800">
                                    Practice Interview on{" "}
                                    {new Date(interview.createdAt).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    - {interview.level}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setExpandedInterview(expandedInterview === interview.id ? null : interview.id)}
                                    className="transition-colors duration-200 hover:bg-purple-100"
                                >
                                    {expandedInterview === interview.id ? (
                                        <>
                                            Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            Show Details <ChevronDown className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </CardTitle>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">
                                    Average Score:{" "}
                                    <span className="font-semibold text-indigo-600">{interview.averageScore.toFixed(2)}/10</span>
                                </span>
                                <span className="text-sm text-gray-600">
                                    Total Score: <span className="font-semibold text-green-600">{interview.totalScore.toFixed(2)}</span>
                                </span>
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {expandedInterview === interview.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-500">Level</p>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">{interview.level}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-500">Total Questions</p>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">{interview.totalQuestions}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold mb-2 text-gray-800">Analysis:</h4>
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown>{interview.analysis}</ReactMarkdown>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold mb-2 text-gray-800">Question Scores:</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {interview.scores.map((score, index) => (
                                                        <div key={index} className="bg-white p-4 rounded-lg shadow">
                                                            <p className="text-sm font-medium text-gray-500">Question {index + 1}</p>
                                                            <div className="mt-1 flex items-center">
                                                                <span className="text-lg font-semibold text-gray-900 mr-2">
                                                                    {score.score.toFixed(2)}
                                                                </span>
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-5 w-5 ${i < Math.round(score.score / 2)
                                                                                    ? "text-yellow-400 fill-current"
                                                                                    : "text-gray-300"
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </div>
        </motion.div>
    )
}

