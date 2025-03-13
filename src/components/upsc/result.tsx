"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
    Award,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
    GraduationCap,
    MessageSquare,
    User,
    Users,
    CheckCircle,
    Star,
    TrendingUp,
    Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Accept any type of summary data
interface ResultProps {
    summaryData: any
    onContinue?: () => void
    onNewInterview?: () => void
}

export function Result({ summaryData, onContinue, onNewInterview }: ResultProps) {
    const [showRawData, setShowRawData] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

    if (!summaryData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 text-center">
                <p className="text-gray-400">No summary data available</p>
            </div>
        )
    }

    // Extract user info with fallbacks
    const userInfo = summaryData.user_info || {}
    const userName = userInfo.name || "Candidate"
    const userEducation = userInfo.education || "Not specified"

    // Extract conversation/questions
    const conversation = summaryData.conversation || []
    const boardMembers = summaryData.board_members || []
    const overallFeedback = summaryData.overall_feedback || "No feedback available"

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                    {/* Debug Raw Data (Collapsible)
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 bg-gray-800/80 backdrop-blur-md rounded-lg overflow-hidden border border-gray-700/50 shadow-lg"
                    >
                        <button
                            onClick={() => setShowRawData(!showRawData)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-lg font-semibold text-gray-300 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-gray-400" />
                                Raw Summary Data (Debug View)
                            </span>
                            {showRawData ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </button>

                        {showRawData && (
                            <div className="p-4 border-t border-gray-700/50">
                                <pre className="text-sm overflow-auto max-h-[400px] p-4 bg-gray-900/70 rounded text-gray-300 font-mono">
                                    {JSON.stringify(summaryData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </motion.div> */}

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-2xl p-6 md:p-8 border border-green-800/50 shadow-lg mb-8 backdrop-blur-md"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative"
                            >
                                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-green-600/50 shadow-lg">
                                    <AvatarImage
                                        src={`/placeholder.svg?height=128&width=128&text=${userName.charAt(0)}`}
                                        alt={userName}
                                    />
                                    <AvatarFallback className="bg-green-800 text-3xl">{userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-1 shadow-lg">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </motion.div>

                            <div className="flex-1 text-center md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{userName}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                        <Badge variant="outline" className="bg-green-900/60 text-green-300 border-green-700">
                                            <GraduationCap className="h-3 w-3 mr-1" />
                                            {userEducation}
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-900/60 text-blue-300 border-blue-700">
                                            Interview #{summaryData.interview_id || "N/A"}
                                        </Badge>
                                        <Badge variant="outline" className="bg-amber-900/60 text-amber-300 border-amber-700">
                                            {new Date().toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </motion.div>


                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-8"
                    >
                        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full bg-gray-800/50 border border-gray-700/50 p-1 rounded-lg">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-green-800/50">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="questions" className="data-[state=active]:bg-green-800/50">
                                    Questions
                                </TabsTrigger>
                                <TabsTrigger value="panel" className="data-[state=active]:bg-green-800/50">
                                    Panel
                                </TabsTrigger>
                                <TabsTrigger value="feedback" className="data-[state=active]:bg-green-800/50">
                                    Feedback
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* Tab content */}
                    <div className="mb-10">
                        <AnimatePresence mode="wait">
                            {activeTab === "overview" && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-6">
                                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-green-400 flex items-center">
                                                        <Award className="h-5 w-5 mr-2" />
                                                        Performance Summary
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">

                                                        {overallFeedback && (
                                                            <div className="pt-4 border-t border-gray-700">
                                                                <h4 className="text-sm font-medium text-gray-300 mb-2">Overall Feedback</h4>
                                                                <p className="text-sm text-gray-300">{overallFeedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-green-400 flex items-center">
                                                        <MessageSquare className="h-5 w-5 mr-2" />
                                                        Interview Progress
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-300">Questions Answered</span>
                                                            <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700">
                                                                {conversation.length || 0}
                                                            </Badge>
                                                        </div>
                                                        <Progress value={100} className="h-2" />

                                                        <div className="pt-4 text-center">
                                                            <p className="text-sm text-gray-400">
                                                                Interview is complete. You've answered all questions.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="space-y-6">
                                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-green-400 flex items-center">
                                                        <User className="h-5 w-5 mr-2" />
                                                        Candidate Profile
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-400 mb-1">Name</h4>
                                                            <p className="text-sm text-gray-200">{userName}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-400 mb-1">Education</h4>
                                                            <p className="text-sm text-gray-200">{userEducation}</p>
                                                        </div>
                                                        {userInfo.hobbies && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-400 mb-1">Hobbies</h4>
                                                                <p className="text-sm text-gray-200">{userInfo.hobbies}</p>
                                                            </div>
                                                        )}
                                                        {userInfo.background && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-400 mb-1">Background</h4>
                                                                <p className="text-sm text-gray-200">{userInfo.background}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-green-400 flex items-center">
                                                        <BookOpen className="h-5 w-5 mr-2" />
                                                        Interview Stats
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-300">Total Questions</span>
                                                            <span className="text-sm font-medium text-white">{conversation.length || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-300">Interview Date</span>
                                                            <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                                                        </div>
                                                        {summaryData.token_usage && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-300">Tokens Used</span>
                                                                <span className="text-sm font-medium text-white">
                                                                    {summaryData.token_usage.total_tokens || 0}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "questions" && (
                                <motion.div
                                    key="questions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="space-y-6">
                                        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-green-400">Question & Answer Analysis</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    {conversation.length > 0 ? (
                                                        conversation.map((item: any, index: number) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 shadow-md"
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-10 w-10 border border-gray-700">
                                                                            <AvatarImage
                                                                                src={`/placeholder.svg?height=40&width=40&text=${typeof item.board_member === "object"
                                                                                    ? item.board_member.name.charAt(0)
                                                                                    : String(item.board_member || "I").charAt(0)
                                                                                    }`}
                                                                                alt={
                                                                                    typeof item.board_member === "object"
                                                                                        ? item.board_member.name
                                                                                        : String(item.board_member || "Interviewer")
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-green-800">
                                                                                {typeof item.board_member === "object"
                                                                                    ? item.board_member.name.charAt(0)
                                                                                    : String(item.board_member || "I").charAt(0)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <p className="font-medium text-green-300">
                                                                                {typeof item.board_member === "object"
                                                                                    ? item.board_member.name
                                                                                    : String(item.board_member || "Interviewer")}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                                                                        Question {item.question_number || index + 1}
                                                                    </Badge>
                                                                </div>

                                                                <div className="mb-4">
                                                                    <h4 className="text-sm font-medium text-gray-400 mb-1">Question:</h4>
                                                                    <p className="text-gray-200">{item.question}</p>
                                                                </div>

                                                                <div className="mb-4">
                                                                    <h4 className="text-sm font-medium text-gray-400 mb-1">Your Answer:</h4>
                                                                    <p className="text-gray-300">{item.answer}</p>
                                                                </div>

                                                                {item.feedback && (
                                                                    <div className="pt-3 border-t border-gray-700/50">
                                                                        <h4 className="text-sm font-medium text-gray-400 mb-1">Feedback:</h4>
                                                                        <p className="text-gray-300">{item.feedback}</p>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-400">
                                                            No questions available in the conversation data.
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "panel" && (
                                <motion.div
                                    key="panel"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="space-y-6">
                                        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-green-400 flex items-center">
                                                    <Users className="h-5 w-5 mr-2" />
                                                    Interview Panel
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {boardMembers.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {boardMembers.map((member: any, index: number) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 shadow-md"
                                                            >
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <Avatar className="h-14 w-14 border-2 border-gray-700">
                                                                        <AvatarImage
                                                                            src={`/placeholder.svg?height=56&width=56&text=${member.name.charAt(0)}`}
                                                                            alt={member.name}
                                                                        />
                                                                        <AvatarFallback className="bg-green-800 text-lg">
                                                                            {member.name.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <h3 className="font-medium text-green-300 text-lg">{member.name}</h3>
                                                                        <p className="text-sm text-gray-400">{member.background}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-400">Expertise:</span>{" "}
                                                                        <span className="text-gray-200">{member.expertise}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-400">Style:</span>{" "}
                                                                        <span className="text-gray-200">{member.style}</span>
                                                                    </div>

                                                                    {member.sample_questions && member.sample_questions.length > 0 && (
                                                                        <div className="pt-3 border-t border-gray-700/50 mt-3">
                                                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Sample Questions:</h4>
                                                                            <ul className="space-y-2">
                                                                                {member.sample_questions.map((question: string, i: number) => (
                                                                                    <li key={i} className="text-gray-300 flex">
                                                                                        <span className="text-green-500 mr-2">•</span> {question}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-400">No panel information available.</div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "feedback" && (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="space-y-6">
                                        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-md shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-green-400">Comprehensive Feedback</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-md">
                                                        <h3 className="text-lg font-medium text-blue-300 mb-4">Overall Assessment</h3>
                                                        <p className="text-gray-300 leading-relaxed">{overallFeedback}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                                        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-md">
                                                            <h3 className="text-lg font-medium text-amber-300 mb-4 flex items-center">
                                                                <TrendingUp className="h-5 w-5 mr-2 text-amber-400" />
                                                                Areas for Improvement
                                                            </h3>
                                                            <p className="text-gray-300 mb-4">
                                                                Based on your performance, here are some areas you might want to focus on:
                                                            </p>
                                                            <ul className="space-y-2 text-gray-300">
                                                                <li className="flex items-start gap-2">
                                                                    <span className="text-amber-500 mr-1">•</span>
                                                                    Continue practicing with mock interviews to build confidence
                                                                </li>
                                                                <li className="flex items-start gap-2">
                                                                    <span className="text-amber-500 mr-1">•</span>
                                                                    Review current affairs and policy developments
                                                                </li>
                                                                <li className="flex items-start gap-2">
                                                                    <span className="text-amber-500 mr-1">•</span>
                                                                    Work on providing more structured and concise answers
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-md">
                                                        <h3 className="text-lg font-medium text-green-300 mb-4 flex items-center">
                                                            <Zap className="h-5 w-5 mr-2 text-green-400" />
                                                            Next Steps
                                                        </h3>
                                                        <p className="text-gray-300 mb-4">To continue improving your UPSC interview performance:</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                                                <h4 className="font-medium text-green-300 mb-2">Short-term</h4>
                                                                <ul className="space-y-1 text-sm text-gray-300">
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-500 mr-1">•</span>
                                                                        Review your answers and identify patterns
                                                                    </li>
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-500 mr-1">•</span>
                                                                        Practice answering similar questions with different approaches
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                                                <h4 className="font-medium text-green-300 mb-2">Long-term</h4>
                                                                <ul className="space-y-1 text-sm text-gray-300">
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-500 mr-1">•</span>
                                                                        Develop a structured study plan for current affairs
                                                                    </li>
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-500 mr-1">•</span>
                                                                        Join a study group for regular mock interviews
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex flex-wrap justify-center gap-4 mt-8 pb-8"
                    >
                        {onContinue && (
                            <Button className="bg-green-700 hover:bg-green-800 shadow-lg shadow-green-900/20" onClick={onContinue}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Continue Interview
                            </Button>
                        )}
                        <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-800/50 shadow-lg">
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                        </Button>
                        {onNewInterview && (
                            <Button
                                variant="outline"
                                className="border-green-600 text-green-400 hover:bg-green-800/50 shadow-lg"
                                onClick={onNewInterview}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Start New Interview
                            </Button>
                        )}
                    </motion.div>
                </div>
            </main>


        </div>
    )
}

