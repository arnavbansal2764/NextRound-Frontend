"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star, CheckCircle, XCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Progress } from "@/components/ui/progress"
import type { AnalyzeResponse } from "../../../types/interviews/normal"
import { Score } from "../../../types/interviews/normal"


export default function FeedbackComponent({ feedback }: { feedback: AnalyzeResponse }) {
    const [expandedSections, setExpandedSections] = useState({
        overall: true,
        strengths: false,
        improvements: false,
        scores: false,
    })

    const toggleSection = (section: "overall" | "strengths" | "improvements" | "scores") => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    if (!feedback) return null

    const strengthsMatch = feedback.analysis.match(/\*\*Strengths:\*\*([\s\S]*?)(?=\n\n\*\*)/)
    const strengths = strengthsMatch ? strengthsMatch[1].split("\n").filter((s) => s.trim().length > 0) : []

    const improvementsMatch = feedback.analysis.match(/\*\*Areas for Improvement:\*\*([\s\S]*?)(?=\n\n\*\*)/)
    const improvements = improvementsMatch ? improvementsMatch[1].split("\n").filter((s) => s.trim().length > 0) : []

    return (
        <motion.div className="max-w-4xl mx-auto p-4 space-y-6" initial="hidden" animate="visible" variants={fadeInUp}>
            <motion.h1
                className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
                variants={fadeInUp}
            >
                Interview Feedback
            </motion.h1>

            <Card className="w-full overflow-hidden shadow-lg">
                <CardHeader>
                    <CardTitle
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("overall")}
                    >
                        <span>Overall Analysis</span>
                        <Button variant="ghost" size="icon">
                            {expandedSections.overall ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {expandedSections.overall && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    {feedback.analysis ? (
                                        <ReactMarkdown>{feedback.analysis.split("**Strengths:**")[0]}</ReactMarkdown>
                                    ) : (
                                        <p className="text-center text-gray-500">No analysis available.</p>
                                    )}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {typeof feedback.averageScore === "number" && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Average Score:</span>
                                                <span className="text-lg font-bold">{feedback.averageScore.toFixed(2)}/10</span>
                                            </div>
                                            <Progress value={feedback.averageScore * 10} className="h-2" />
                                        </>
                                    )}
                                    {typeof feedback.totalScore === "number" && (
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">Total Score:</span>
                                            <span className="text-lg font-bold">{feedback.totalScore.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            <Card className="w-full overflow-hidden shadow-lg">
                <CardHeader>
                    <CardTitle
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("strengths")}
                    >
                        <span>Strengths</span>
                        <Button variant="ghost" size="icon">
                            {expandedSections.strengths ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {expandedSections.strengths && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent>
                                <ul className="space-y-2">
                                    {strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                            <span>{strength.replace(/^\d+\.\s*/, "")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            <Card className="w-full overflow-hidden shadow-lg">
                <CardHeader>
                    <CardTitle
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("improvements")}
                    >
                        <span>Areas for Improvement</span>
                        <Button variant="ghost" size="icon">
                            {expandedSections.improvements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {expandedSections.improvements && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent>
                                <ul className="space-y-2">
                                    {improvements.map((improvement, index) => (
                                        <li key={index} className="flex items-start">
                                            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-1" />
                                            <span>{improvement.replace(/^\d+\.\s*/, "")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
            <Card className="w-full overflow-hidden shadow-lg">
                <CardHeader>
                    <CardTitle
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("scores")}
                    >
                        <span>Detailed Scores</span>
                        <Button variant="ghost" size="icon">
                            {expandedSections.scores ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {expandedSections.scores && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {feedback.scores?.map((score: Score, index: number) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'
                                                }`}
                                        >
                                            <span className="font-medium flex items-center">
                                                <i className="fas fa-question-circle mr-2"></i>
                                                {score.question}
                                            </span>
                                            <span className="font-medium flex items-center">
                                                <i className="fas fa-reply mr-2"></i>
                                                {score.answer}
                                            </span>
                                            <span className="font-medium flex items-center">
                                                <i className="fas fa-check-circle mr-2"></i>
                                                {score.refrenceAnswer}
                                            </span>
                                            <span className="text-lg font-semibold flex items-center">
                                                <i className="fas fa-star mr-2"></i>
                                                {score.score}/10
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

        </motion.div>
    )
}

