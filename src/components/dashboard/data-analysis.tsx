"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions,
} from "chart.js"
import { useToast } from "@/hooks/use-toast"
import type { AnalyzeResponse } from "../../../types/interviews/normal"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Interview extends AnalyzeResponse {
    id: string
    createdAt: string
}

interface CulturalFit {
    id: string
    createdAt: string
    scores: {
        totalScore: number
        averageScore: number
    }
}

interface PracticeInterview {
    id: string
    createdAt: string
    totalScore: number
    averageScore: number
}

export default function DataAnalysis() {
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [culturalFits, setCulturalFits] = useState<CulturalFit[]>([])
    const [practiceInterviews, setPracticeInterviews] = useState<PracticeInterview[]>([])
    const { toast } = useToast()

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/user/profile")
                if (!response.ok) {
                    throw new Error("Failed to fetch user data")
                }
                const userData = await response.json()
                setInterviews(userData.interviews)
                setCulturalFits(userData.culturals)
                setPracticeInterviews(userData.practiceInterviews)
            } catch (error) {
                console.error("Error fetching user data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load user data. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchData()
    }, [toast])

    const chartData: ChartData<"line"> = useMemo(() => {
        const allData = [
            ...interviews.map((interview) => ({
                date: new Date(interview.createdAt),
                score: interview.averageScore,
                type: "Interview",
            })),
            ...culturalFits.map((cf) => ({
                date: new Date(cf.createdAt),
                score: cf.scores.averageScore,
                type: "Cultural Fit",
            })),
            ...practiceInterviews.map((pi) => ({
                date: new Date(pi.createdAt),
                score: pi.averageScore,
                type: "Practice Interview",
            })),
        ].sort((a, b) => a.date.getTime() - b.date.getTime())

        const dates = allData.map((item) => item.date.toLocaleDateString())
        const uniqueDates = Array.from(new Set(dates))

        return {
            labels: uniqueDates,
            datasets: [
                {
                    label: "Interview Performance",
                    data: allData.filter((item) => item.type === "Interview").map((item) => item.score),
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    tension: 0.1,
                },
                {
                    label: "Cultural Fit",
                    data: allData.filter((item) => item.type === "Cultural Fit").map((item) => item.score),
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    tension: 0.1,
                },
                {
                    label: "Practice Interview",
                    data: allData.filter((item) => item.type === "Practice Interview").map((item) => item.score),
                    borderColor: "rgb(54, 162, 235)",
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    tension: 0.1,
                },
            ],
        }
    }, [interviews, culturalFits, practiceInterviews])

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Performance Over Time",
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Score",
                },
                min: 0,
                max: 10,
            },
        },
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full max-w-4xl mx-auto"
        >
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        Performance Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {interviews.length > 0 || culturalFits.length > 0 || practiceInterviews.length > 0 ? (
                        <Line options={options} data={chartData} />
                    ) : (
                        <p className="text-center text-gray-600 py-8">
                            No data available. Complete some interviews to see your performance analysis!
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

