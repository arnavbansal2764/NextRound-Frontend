import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'

interface Score {
    question: string
    answer: string
    code: string
    refrenceAnswer: string
    score: number
}

interface FeedbackProps {
    analysis: string
    scores: Score[]
    averageScore: number
    totalScore: number
}

const InterviewFeedback: React.FC<FeedbackProps> = ({ analysis, scores, averageScore, totalScore }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Interview Feedback</CardTitle>
                    <CardDescription>Your performance analysis and scores</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Overall Scores</h3>
                        <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-lg">
                                Average Score: {averageScore.toFixed(2)}
                            </Badge>
                            <Badge variant="secondary" className="text-lg">
                                Total Score: {totalScore.toFixed(2)}
                            </Badge>
                        </div>
                    </div>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="prose prose-sm dark:prose-invert">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Detailed Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        {scores.map((score, index) => (
                            <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                                <h4 className="font-semibold mb-2">{score.question}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                        <pre className="bg-muted p-2 rounded-md text-sm">{score.answer || 'No answer provided'}</pre>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Your Code:</p>
                                        <pre className="bg-muted p-2 rounded-md text-sm">{score.code || 'No code provided'}</pre>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Reference Answer:</p>
                                    <pre className="bg-muted p-2 rounded-md text-sm whitespace-pre-wrap">{score.refrenceAnswer}</pre>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Badge variant="outline" className="text-lg">
                                        Score: {score.score.toFixed(2)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default InterviewFeedback
