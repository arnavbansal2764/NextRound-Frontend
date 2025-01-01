'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FeedbackItem {
    question: string
    transcript: string
    feedback: string
}


interface FeedbackViewerProps {
    apiResponse: FeedbackItem[]
}

export default function FeedbackComponent({ apiResponse }: FeedbackViewerProps) {
    const [selectedItem, setSelectedItem] = useState<string | null>(null)

    const formatFeedback = (text: string) => {
        return text.split('\n').map((line, index) => {
            const cleanedLine = line.replace(/\*/g, '').trim();

            if (cleanedLine.startsWith('•')) {
                return <li key={index} className="ml-4">{cleanedLine.substring(1).trim()}</li>;
            } else if (cleanedLine.includes(':')) {
                const [title, ...content] = cleanedLine.split(':');
                if (content.length) {
                    return (
                        <div key={index} className="font-semibold mt-2">
                            {title.trim()}:
                            <span className="font-normal ml-1">{content.join(':').trim()}</span>
                        </div>
                    );
                }
            }
            return <p key={index} className="mt-1">{cleanedLine}</p>;
        });
    };



    const toggleItem = (question: string) => {
        setSelectedItem(prevSelected => prevSelected === question ? null : question)
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">View Feedback</h1>

            <div className="grid gap-4">
                {apiResponse.map((item, index) => (
                    <Card
                        key={index}
                        className="w-full overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg"
                        onClick={() => toggleItem(item.question)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-lg">{item.question}</span>
                                <Button variant="ghost" size="icon">
                                    {selectedItem === item.question ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${selectedItem === item.question ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="bg-muted p-4 rounded-lg mb-4 animate-fadeIn">
                                    <h3 className="font-semibold mb-2">Your Response:</h3>
                                    <p className="text-sm">{item.transcript}</p>
                                </div>
                                <div className="prose prose-sm max-w-none animate-fadeIn">
                                    <h3 className="font-semibold mb-2">Feedback:</h3>
                                    {formatFeedback(item.feedback)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}