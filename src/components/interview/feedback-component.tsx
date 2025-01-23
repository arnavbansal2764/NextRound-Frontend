'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
interface FeedbackComponentProps {
    feedback: any
}

export default function FeedbackComponent({ feedback }: FeedbackComponentProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">Interview Feedback</h1>
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <span>Overall Analysis</span>
                        <Button variant="ghost" size="icon">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isExpanded && (
                        <>
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{feedback.analysis}</ReactMarkdown>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{feedback.averageScore}</ReactMarkdown>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{feedback.totalScore}</ReactMarkdown>
                        </div>
                        {/* <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{feedback.scores.map((score:any)=>(
                                <div>
                                    <h2>{score.answer}</h2>
                                    <p>{score.question}</p>
                                    <p>{score.refrenceAnswer}</p>
                                    <p>{score.score}</p>
                                </div>
                            ))}</ReactMarkdown>
                        </div> */}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

