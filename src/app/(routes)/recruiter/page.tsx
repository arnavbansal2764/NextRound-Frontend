"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import axios from "axios"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Briefcase, Users, Calendar } from 'lucide-react'

export default function DashboardPage() {
    interface JobListing {
        id: string
        title: string
        companyName: string
        createdAt: string
    }

    interface Applicant {
        id: string
        userData: {
            name: string
            email: string
        }
    }

    const [jobListings, setJobListings] = useState<JobListing[]>([])
    const [applicants, setApplicants] = useState<{ [key: string]: Applicant[] }>({})
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchJobListings = async () => {
        try {
            const response = await axios.get('/api/jobs/applicants')
            setJobListings(response.data.jobListings)
        } catch (error) {
            console.error('Error fetching job listings:', error)
            throw error
        }
    }

    const fetchApplicants = async (jobId: string) => {
        try {
            const response = await axios.post('/api/jobs/applicants', { jobId })
            setApplicants((prev) => ({ ...prev, [jobId]: response.data.users }))
        } catch (error) {
            console.error('Error fetching applicants:', error)
        }
    }

    useEffect(() => {
        toast.promise(
            fetchJobListings(),
            {
                loading: "Loading job listings...",
                success: "Job listings loaded successfully!",
                error: "Error fetching job listings!"
            }
        ).finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        jobListings.forEach((job) => {
            fetchApplicants(job.id)
        })
    }, [jobListings])

    const handleJobClick = (jobId: string) => {
        router.push(`/jobs/${jobId}`)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-16">
                <motion.h1
                    className="text-4xl font-bold mb-8 text-center text-gray-800"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Recruiter Dashboard
                </motion.h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} className="bg-white shadow-sm">
                                <CardHeader>
                                    <Skeleton className="h-4 w-2/3" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-1/2 mb-2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {jobListings.map((job) => (
                            <motion.div key={job.id} variants={itemVariants}>
                                <Card
                                    className="cursor-pointer hover:shadow-md transition-shadow duration-300 bg-white border-l-4 border-blue-500"
                                    onClick={() => handleJobClick(job.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between text-gray-800">
                                            <span className="text-xl font-semibold">{job.title}</span>
                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Briefcase className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{job.companyName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mb-4">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium mb-2 flex items-center text-gray-700">
                                                <Users className="h-5 w-5 mr-2 text-gray-500" />
                                                Applicants
                                            </h3>
                                            <ScrollArea className="h-40 rounded-md border border-gray-200 p-3">
                                                {applicants[job.id]?.map((applicant) => (
                                                    <Card key={applicant.id} className="mb-2 last:mb-0 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                                        <CardContent className="p-2">
                                                            <p className="text-sm text-gray-700">{applicant.userData.email}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </ScrollArea>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

