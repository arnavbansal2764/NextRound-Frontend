'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FeedbackComponent from './feedback-component'
import { useToast } from '@/hooks/use-toast'
import { AnalyzeResponse } from '../../../types/interviews/normal'

interface Interview extends AnalyzeResponse {
    id: string
    createdAt: string
    analysis: string
    scores: any[]
    averageScore: number
    totalScore: number
    resumeUrl: string
}

export default function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [expandedInterview, setExpandedInterview] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchInterviews() {
            try {
                const response = await fetch('/api/user/profile')
                if (!response.ok) {
                    throw new Error('Failed to fetch interviews')
                }
                const userData = await response.json()
                setInterviews(userData.interviews)
            } catch (error) {
                console.error('Error fetching interviews:', error)
                toast({
                    title: "Error",
                    description: "Failed to load interview history. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchInterviews()
    }, [toast])

    if (interviews.length === 0) {
        return <div>No interviews found.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
        >
            <h2 className="text-2xl font-bold mb-4">Interview History</h2>
            <div className="space-y-4">
                {interviews.map((interview) => (
                    <Card key={interview.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Interview on {new Date(interview.createdAt).toLocaleDateString()}</span>
                                <Button
                                    variant="ghost"
                                    onClick={() => setExpandedInterview(expandedInterview === interview.id ? null : interview.id)}
                                >
                                    {expandedInterview === interview.id ? 'Hide Details' : 'Show Details'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <AnimatePresence>
                            {expandedInterview === interview.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardContent>
                                        <FeedbackComponent feedback={interview} />
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