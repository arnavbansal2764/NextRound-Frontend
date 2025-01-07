'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FeedbackComponentProps {
    feedback: string
}

export default function FeedbackComponent({ feedback }: FeedbackComponentProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const formatFeedback = (text: string) => {
        return text.split('\n').map((line, index) => {
            const cleanedLine = line.trim()

            if (cleanedLine.startsWith('•')) {
                return <li key={index} className="ml-4">{cleanedLine.substring(1).trim()}</li>
            } else if (cleanedLine.includes(':')) {
                const [title, ...content] = cleanedLine.split(':')
                if (content.length) {
                    return (
                        <div key={index} className="font-semibold mt-2">
                            {title.trim()}:
                            <span className="font-normal ml-1">{content.join(':').trim()}</span>
                        </div>
                    )
                }
            }
            return <p key={index} className="mt-1">{cleanedLine}</p>
        })
    }

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
                        <div className="prose prose-sm max-w-none">
                            {formatFeedback(feedback)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

