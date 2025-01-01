'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, BriefcaseIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Application {
    id: string
    jobTitle: string
    companyName: string
    appliedDate: string
}

export function ApplicationList({ applications }: { applications: Application[] }) {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Your Job Applications</h2>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {applications.map((application, index) => (
                    <motion.div
                        key={application.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center mb-2">
                                    <BriefcaseIcon className="mr-2" />
                                    <span>{application.companyName}</span>
                                </div>
                                <div className="flex items-center">
                                    <CalendarIcon className="mr-2" />
                                    <span>{format(new Date(application.appliedDate), 'dd/MM/yyyy, hh:mm:ss a')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}