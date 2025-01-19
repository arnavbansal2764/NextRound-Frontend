'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js'
import { useToast } from '@/hooks/use-toast'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

interface Interview {
    id: string
    createdAt: string
    analysisResult: string
}

export default function DataAnalysis() {
    const [interviews, setInterviews] = useState<Interview[]>([])
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
                    description: "Failed to load interview data. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchInterviews()
    }, [toast])

    const chartData: ChartData<'line'> = useMemo(() => {
        const sortedInterviews = [...interviews].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        const dates = sortedInterviews.map(interview =>
            new Date(interview.createdAt).toLocaleDateString()
        )

        const scores = sortedInterviews.map(interview => {
            // This is a mock score calculation. Replace with your actual logic.
            // For example, you could parse the analysisResult and extract a numerical score.
            return parseFloat(interview.analysisResult.match(/Score: (\d+)/)?.[1] || "0")
        })

        return {
            labels: dates,
            datasets: [
                {
                    label: 'Interview Performance',
                    data: scores,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1
                }
            ]
        }
    }, [interviews])

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Interview Performance Over Time'
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Score: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Interview Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Performance Score'
                },
                min: 0,
                max: 100
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    {interviews.length > 0 ? (
                        <Line options={options} data={chartData} />
                    ) : (
                        <p>No interview data available.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

