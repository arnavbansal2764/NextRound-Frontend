"use client"

import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface InterviewProgressProps {
    currentQuestion: number
    totalQuestions: number
    interviewState: string
}

export function InterviewProgress({ currentQuestion, totalQuestions, interviewState }: InterviewProgressProps) {
    const progress = Math.min(100, (currentQuestion / totalQuestions) * 100)

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    Question {currentQuestion} of {totalQuestions}
                </span>
                <span className="text-xs font-medium text-green-400">{Math.round(progress)}%</span>
            </div>

            <div className="relative">
                <Progress value={progress} className="h-2" />

                {/* Current state indicator */}
                {interviewState === "speaking" && (
                    <motion.div
                        className="absolute top-0 h-2 bg-green-500/50 rounded-full"
                        style={{ width: "100%" }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                )}

                {interviewState === "processing" && (
                    <motion.div
                        className="absolute top-0 h-2 bg-amber-500/50 rounded-full"
                        style={{ width: "100%" }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                    />
                )}
            </div>

            <div className="flex justify-between text-[10px] text-white">
                <span>Introduction</span>
                <span>Core Questions</span>
                <span>Conclusion</span>
            </div>
        </div>
    )
}

