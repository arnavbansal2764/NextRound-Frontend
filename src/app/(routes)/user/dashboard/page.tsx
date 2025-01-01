'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'

export default function DashboardPage() {
    const { applications, isLoading, error } = useApplications();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen">
            <motion.h1
                className="text-4xl font-bold mb-8 text-center"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                Your Job Applications
            </motion.h1>

            {isLoading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index}>
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
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load applications. Please try again later.
                    </AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {applications.map((application) => (
                        <motion.div key={application.id} variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{application.joblisting.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {application.joblisting.organization}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Applied on: {new Date(application.joblisting.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}

