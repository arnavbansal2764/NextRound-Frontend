"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from 'framer-motion';

interface Emotion {
    name: string;
    value: number;
}

interface CulturalFitAnalysisProps {
    emotions: Emotion[][];
}

function generateDistinctColors(count: number): string[] {
    const hueStep = 360 / count;
    const saturationLevels = [100, 75, 50];
    const lightnessLevels = [50, 60, 70];

    return Array.from({ length: count }, (_, i) => {
        const hue = i * hueStep;
        const saturationIndex = Math.floor(i / (count / saturationLevels.length));
        const lightnessIndex = i % lightnessLevels.length;
        const saturation = saturationLevels[saturationIndex];
        const lightness = lightnessLevels[lightnessIndex];
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
}

export function CulturalFitAnalysis({ emotions }: CulturalFitAnalysisProps) {
    const aggregatedEmotions = emotions.flat().reduce((acc, emotion) => {
        if (!acc[emotion.name]) {
            acc[emotion.name] = 0;
        }
        acc[emotion.name] += emotion.value;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(aggregatedEmotions)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const COLORS = generateDistinctColors(pieData.length);

    const emotionColors = pieData.reduce((acc, emotion, index) => {
        acc[emotion.name] = COLORS[index];
        return acc;
    }, {} as Record<string, string>);

    const CustomizedLegend = ({ payload }: { payload: any[] }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs sm:text-sm md:text-base">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                    <div
                        className="w-3 h-3 mr-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate">{entry.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mt-6"
        >
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center">
                        Cultural Fit Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-center justify-center">
                        <ChartContainer
                            config={pieData.reduce((acc, emotion, index) => {
                                acc[emotion.name] = {
                                    label: emotion.name,
                                    color: emotionColors[emotion.name],
                                };
                                return acc;
                            }, {} as Record<string, { label: string; color: string }>)}
                            className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] w-full md:w-2/3"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius="80%"
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={emotionColors[entry.name]}
                                                className="transition-all duration-300 ease-in-out hover:opacity-80"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="w-full md:w-1/3 mt-4 md:mt-0 md:ml-4">
                            <CustomizedLegend payload={pieData.map(item => ({ value: item.name, color: emotionColors[item.name] }))} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

