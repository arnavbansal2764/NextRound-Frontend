"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Star, AlertTriangle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Progress } from "@/components/ui/progress"
import type { AnalyzeResponse } from "../../../types/interviews/normal"
import type { Score } from "../../../types/interviews/normal"

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

    const staggerAnimation = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    }

    if (!feedback) return null

    const strengthsMatch = feedback.analysis.match(/\*\*Strengths:\*\*([\s\S]*?)(?=\n\n\*\*)/)
    const strengths = strengthsMatch ? strengthsMatch[1].split("\n").filter((s) => s.trim().length > 0) : []

    const improvementsMatch = feedback.analysis.match(/\*\*Areas for Improvement:\*\*([\s\S]*?)(?=\n\n\*\*)/)
    const improvements = improvementsMatch ? improvementsMatch[1].split("\n").filter((s) => s.trim().length > 0) : []

    return (
        <motion.div
            className="max-w-4xl mx-auto p-4 space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
        >

            <motion.div variants={staggerAnimation} custom={0}>
                <Card className="w-full overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
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
                                            <ReactMarkdown className="text-gray-700 leading-relaxed">
                                                {feedback.analysis.split("**Strengths:**")[0]}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="text-center text-gray-500">No analysis available.</p>
                                        )}
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        {typeof feedback.averageScore === "number" && (
                                            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-gray-700">Average Score:</span>
                                                    <span className="text-2xl font-bold text-indigo-600">
                                                        {feedback.averageScore.toFixed(2)}/10
                                                    </span>
                                                </div>
                                                <Progress value={feedback.averageScore * 10} className="h-3 bg-purple-200" />
                                            </div>
                                        )}
                                        {typeof feedback.totalScore === "number" && (
                                            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-700">Total Score:</span>
                                                    <span className="text-2xl font-bold text-green-600">{feedback.totalScore.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            <motion.div variants={staggerAnimation} custom={1}>
                <Card className="w-full overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
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
                                    <ul className="space-y-4">
                                        {strengths.map((strength, index) => (
                                            <motion.li
                                                key={index}
                                                className="flex items-start bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg shadow-sm"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                                <span className="text-gray-700"><ReactMarkdown>{strength.replace(/^\d+\.\s*/, "")}</ReactMarkdown></span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            <motion.div variants={staggerAnimation} custom={2}>
                <Card className="w-full overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
                    <CardHeader>
                        <CardTitle
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection("improvements")}
                        >
                            <span>Areas for Improvement</span>
                            <Button variant="ghost" size="icon">
                                {expandedSections.improvements ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
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
                                    <ul className="space-y-4">
                                        {improvements.map((improvement, index) => (
                                            <motion.li
                                                key={index}
                                                className="flex items-start bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg shadow-sm"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
                                                <span className="text-gray-700"><ReactMarkdown>{improvement.replace(/^\d+\.\s*/, "")}</ReactMarkdown></span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            <motion.div variants={staggerAnimation} custom={3}>
                <Card className="w-full overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
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
                                transition={{ duration: 0.3 }}
                            >
                                <CardContent>
                                    <div className="space-y-6">
                                        {feedback.scores?.map((score: Score, index: number) => (
                                            <motion.div
                                                key={index}
                                                className="bg-white p-6 rounded-lg shadow-md"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <h3 className="text-lg font-semibold mb-4 text-gray-800">{score.question}</h3>
                                                <div className="space-y-3">
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Your Answer:</span> {score.answer}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Reference Answer:</span> {score.refrenceAnswer}
                                                    </p>
                                                    <div className="flex items-center mt-2">
                                                        <span className="font-medium mr-2">Score:</span>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-5 w-5 ${i < Math.round(score.score / 2) ? "text-yellow-400 fill-current" : "text-gray-300"
                                                                        }`}
                                                                />
                                                            ))}
                                                            <span className="ml-2 font-semibold">{score.score.toFixed(1)}/10</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </motion.div>
    )
}

