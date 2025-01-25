"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FeedbackComponent from "./feedback-component"
import { useToast } from "@/hooks/use-toast"
import type { AnalyzeResponse } from "../../../types/interviews/normal"

interface Interview extends AnalyzeResponse {
    id: string
    createdAt: string
    resumeUrl: string
}

export default function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [expandedInterview, setExpandedInterview] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchInterviews() {
            try {
                const response = await fetch("/api/user/profile")
                if (!response.ok) {
                    throw new Error("Failed to fetch interviews")
                }
                const userData = await response.json()
                setInterviews(userData.interviews)
            } catch (error) {
                console.error("Error fetching interviews:", error)
                toast({
                    title: "Error",
                    description: "Failed to load interview history. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchInterviews()
    }, [toast])

    if (interviews.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
            >
                <h2 className="text-2xl font-bold mb-4">Interview History</h2>
                <p className="text-gray-600">No interviews found. Start your first interview to see your history!</p>
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
                Interview History
            </h2>
            <div className="space-y-6">
                {interviews.map((interview) => (
                    <Card key={interview.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-800">
                                    Interview on{" "}
                                    {new Date(interview.createdAt).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setExpandedInterview(expandedInterview === interview.id ? null : interview.id)}
                                    className="transition-colors duration-200 hover:bg-purple-100"
                                >
                                    {expandedInterview === interview.id ? "Hide Details" : "Show Details"}
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
                                        <FeedbackComponent feedback={interview} />
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

