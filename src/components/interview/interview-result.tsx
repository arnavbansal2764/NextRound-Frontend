"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Award, BarChart3, BookOpen } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface InterviewQuestion {
    question: string
    answer: string
    refrenceAnswer: string
    score: number
}

interface InterviewResult {
    status: string
    message: string
    history: InterviewQuestion[]
}

export default function InterviewResults({
    resultData,
    onClose,
    onStartNew,
}: {
    resultData: string
    onClose?: () => void
    onStartNew?: () => void
}) {
    const [parsedData, setParsedData] = useState<InterviewResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"overview" | "questions">("overview")
    const [averageScore, setAverageScore] = useState<number>(0)
    const [totalScore, setTotalScore] = useState<number>(0)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        try {
            const data = JSON.parse(resultData) as InterviewResult
            setParsedData(data)

            // Extract scores from message
            const scoreMatch = data.message.match(/averageScore\s*:\s*(\d+(\.\d+)?)\s*totalScore:\s*(\d+(\.\d+)?)/)
            if (scoreMatch) {
                setAverageScore(Number.parseFloat(scoreMatch[1]))
                setTotalScore(Number.parseFloat(scoreMatch[3]))
            }

            setIsLoaded(true)
        } catch (error) {
            console.error("Failed to parse interview result data:", error)
            setError("Failed to parse interview results. Please try again.")
        }
    }, [resultData])

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-300">
                <h3 className="text-lg font-bold mb-2">Error</h3>
                <p>{error}</p>
            </div>
        )
    }

    if (!parsedData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return "text-green-500"
        if (score >= 0.6) return "text-blue-500"
        if (score >= 0.4) return "text-yellow-500"
        return "text-red-500"
    }

    const getScoreBackground = (score: number) => {
        if (score >= 0.8) return "bg-green-500/20 border-green-500/30"
        if (score >= 0.6) return "bg-blue-500/20 border-blue-500/30"
        if (score >= 0.4) return "bg-yellow-500/20 border-yellow-500/30"
        return "bg-red-500/20 border-red-500/30"
    }

    const getScoreIcon = (score: number) => {
        if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-500" />
        if (score >= 0.4) return <AlertTriangle className="w-5 h-5 text-yellow-500" />
        return <XCircle className="w-5 h-5 text-red-500" />
    }

    const getPerformanceText = (score: number) => {
        if (score >= 0.8) return "Excellent"
        if (score >= 0.6) return "Good"
        if (score >= 0.4) return "Average"
        if (score >= 0.2) return "Below Average"
        return "Poor"
    }

    const getPerformanceFeedback = (score: number) => {
        if (score >= 0.8) {
            return "You demonstrated strong knowledge and provided comprehensive answers. Great job!"
        }
        if (score >= 0.6) {
            return "You showed good understanding of the topics, with some room for improvement in detail and depth."
        }
        if (score >= 0.4) {
            return "Your answers covered the basics, but lacked some important details and depth."
        }
        if (score >= 0.2) {
            return "Your answers were incomplete and missed several key points. More preparation is recommended."
        }
        return "Your answers did not adequately address the questions. Significant improvement is needed."
    }

    const answeredQuestions = parsedData.history.filter((q) => q.answer.trim() !== "").length
    const unansweredQuestions = parsedData.history.length - answeredQuestions

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl max-h-[90vh] flex flex-col"
        >
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-md p-6 border-b border-gray-700/50">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Interview Results
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className={`px-4 py-1 rounded-full text-sm font-medium ${averageScore >= 0.7
                                    ? "bg-green-500/20 text-green-400"
                                    : averageScore >= 0.4
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                }`}
                        >
                            {getPerformanceText(averageScore)}
                        </motion.div>
                        {onClose && (
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50 px-6">
                <div className="flex space-x-4">
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        onClick={() => setActiveTab("overview")}
                        className={`py-4 px-2 relative ${activeTab === "overview" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Overview</span>
                        </div>
                        {activeTab === "overview" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        onClick={() => setActiveTab("questions")}
                        className={`py-4 px-2 relative ${activeTab === "questions" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Questions</span>
                        </div>
                        {activeTab === "questions" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Score Summary */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Score Card */}
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-300">Overall Score</h3>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className={`text-4xl font-bold ${getScoreColor(averageScore)}`}
                                    >
                                        {(averageScore * 10).toFixed(1)}
                                        <span className="text-xl text-gray-400">/10</span>
                                    </motion.div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Performance</span>
                                        <span className={getScoreColor(averageScore)}>{getPerformanceText(averageScore)}</span>
                                    </div>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${averageScore * 100}%` }}
                                        transition={{ delay: 0.6, duration: 1 }}
                                    >
                                        <Progress value={averageScore * 100} className="h-2" />
                                    </motion.div>
                                </div>
                                <div className="text-sm text-gray-400 mt-4">
                                    <p>{getPerformanceFeedback(averageScore)}</p>
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-inner">
                                <h3 className="text-lg font-medium text-gray-300 mb-4">Interview Statistics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Total Questions</span>
                                            <span className="text-white">{parsedData.history.length}</span>
                                        </div>
                                        <Progress value={100} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Answered Questions</span>
                                            <span className="text-green-400">{answeredQuestions}</span>
                                        </div>
                                        <Progress
                                            value={(answeredQuestions / parsedData.history.length) * 100}
                                            className="h-2 bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Unanswered Questions</span>
                                            <span className="text-red-400">{unansweredQuestions}</span>
                                        </div>
                                        <Progress
                                            value={(unansweredQuestions / parsedData.history.length) * 100}
                                            className="h-2 bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Total Score</span>
                                            <span className="text-blue-400">{totalScore.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 shadow-inner"
                        >
                            <p className="text-blue-300">
                                {parsedData.message.replace(/averageScore\s*:\s*\d+(\.\d+)?\s*totalScore:\s*\d+(\.\d+)?/, "")}
                            </p>
                        </motion.div>
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className="space-y-6">
                        {parsedData.history.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className={`rounded-xl p-6 border shadow-inner ${getScoreBackground(item.score)}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-white flex-1">
                                        <span className="text-blue-400 mr-2">Q{index + 1}:</span> {item.question}
                                    </h3>
                                    <div className="flex items-center space-x-2 ml-4">
                                        {getScoreIcon(item.score)}
                                        <span className={`font-bold ${getScoreColor(item.score)}`}>{(item.score * 10).toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Your Answer:</h4>
                                    <div className="bg-black/20 rounded-lg p-3 text-gray-300 text-sm">
                                        {item.answer ? item.answer : <em className="text-gray-500">No answer provided</em>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Reference Answer:</h4>
                                    <div className="bg-black/20 rounded-lg p-3 text-gray-300 text-sm">{item.refrenceAnswer}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with actions */}
            {onStartNew && (
                <div className="p-4 border-t border-gray-700/50 flex justify-end">
                    <motion.button
                        onClick={onStartNew}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all duration-300"
                    >
                        Start New Interview
                    </motion.button>
                </div>
            )}
        </motion.div>
    )
}

