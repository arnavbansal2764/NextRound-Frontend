'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast'
import CulturalFitAnalysis from './cultural-fit-analysis'

interface CulturalFit {
    id: string
    createdAt: string
    result: string
    primaryTraits: any[]
    segmentSecondaryTraits: any[]
}

export default function CulturalFitHistory() {
    const [culturalFits, setCulturalFits] = useState<CulturalFit[]>([])
    const [expandedFit, setExpandedFit] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchCulturalFits() {
            try {
                const response = await fetch('/api/user/profile')
                if (!response.ok) {
                    throw new Error('Failed to fetch cultural fits')
                }
                const userData = await response.json()
                setCulturalFits(userData.culturals)
            } catch (error) {
                console.error('Error fetching cultural fits:', error)
                toast({
                    title: "Error",
                    description: "Failed to load cultural fit history. Please try again later.",
                    variant: "destructive",
                })
            }
        }
        fetchCulturalFits()
    }, [toast])

    if (culturalFits.length === 0) {
        return <div>No cultural fit analyses found.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
        >
            <h2 className="text-2xl font-bold mb-4">Cultural Fit History</h2>
            <div className="space-y-4">
                {culturalFits.map((culturalFit) => (
                    <Card key={culturalFit.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Cultural Fit Analysis on {new Date(culturalFit.createdAt).toLocaleDateString()}</span>
                                <Button
                                    variant="ghost"
                                    onClick={() => setExpandedFit(expandedFit === culturalFit.id ? null : culturalFit.id)}
                                >
                                    {expandedFit === culturalFit.id ? 'Hide Details' : 'Show Details'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <AnimatePresence>
                            {expandedFit === culturalFit.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardContent>
                                        <CulturalFitAnalysis data={{
                                            result: culturalFit.result,
                                            primary_traits: culturalFit.primaryTraits,
                                            segment_secondary_traits: culturalFit.segmentSecondaryTraits
                                        }} />
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

