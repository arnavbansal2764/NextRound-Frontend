"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'
interface PracticeInterview {
    id: string
    createdAt: string
    level: string
    totalQuestions: number
    analysis: string
    scores: any[]
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
        return <div>No practice interviews found.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
        >
            <h2 className="text-2xl font-bold mb-4">Practice Interview History</h2>
            <div className="space-y-4">
                {practiceInterviews.map((interview) => (
                    <Card key={interview.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>
                                    Practice Interview on {new Date(interview.createdAt).toLocaleDateString()}- {interview.level}
                                </span>
                                <Button
                                    variant="ghost"
                                    onClick={() => setExpandedInterview(expandedInterview === interview.id ? null : interview.id)}
                                >
                                    {expandedInterview === interview.id ? "Hide Details" : "Show Details"}
                                </Button>
                            </CardTitle>
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
                                        <div className="space-y-4">
                                            <p>
                                                <strong>Level:</strong> {interview.level}
                                            </p>
                                            <p>
                                                <strong>Total Questions:</strong> {interview.totalQuestions}
                                            </p>
                                            <p>
                                                <strong>Average Score:</strong> {interview.averageScore.toFixed(2)}
                                            </p>
                                            <p>
                                                <strong>Total Score:</strong> {interview.totalScore.toFixed(2)}
                                            </p>
                                            <div>
                                                <h4 className="font-semibold mb-2">Analysis:</h4>
                                                <ReactMarkdown>{interview.analysis}</ReactMarkdown>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Scores:</h4>
                                                {interview.scores.map((score, index) => (
                                                    <div key={index} className="mb-2">
                                                        <p>
                                                            <strong>Question {index + 1}:</strong> {score.score.toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
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

