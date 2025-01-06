"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Lightbulb, Heart, Target, Sparkles } from 'lucide-react'
import { Emotion, Segment, SegmentSecondaryTrait, Trait } from '@/lib/redis/types'

interface CulturalFitAnalysisProps {
  result: string
  primary_traits: Segment[]
  segment_secondary_traits: SegmentSecondaryTrait[]
}

const COLORS = [
  '#4299E1', // blue-500
  '#48BB78', // green-500
  '#ED8936', // orange-500
  '#9F7AEA', // purple-500
  '#F56565', // red-500
]

const CulturalFitAnalysis: React.FC<{ data: CulturalFitAnalysisProps }> = ({ data }) => {
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'creative thinking':
        return <Lightbulb className="w-4 h-4" />
      case 'emotional resilience':
        return <Heart className="w-4 h-4" />
      case 'problem solving':
        return <Target className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const renderEmotions = (emotions: Emotion[]) => {
    return emotions.map((emotion, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Badge
          variant="secondary"
          className="mr-2 mb-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 hover:from-blue-200 hover:to-purple-200 transition-all duration-300"
        >
          {getIcon(emotion.emotion_name)}
          <span className="ml-1">
            {emotion.emotion_name}: {(emotion.emotion_score * 100).toFixed(1)}%
          </span>
        </Badge>
      </motion.div>
    ))
  }

  const renderTraits = (traits: Trait[]) => {
    return traits.map((trait, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Badge
          variant="outline"
          className="mr-2 mb-2 bg-gradient-to-r from-green-100 to-teal-100 text-gray-800 hover:from-green-200 hover:to-teal-200 transition-all duration-300"
        >
          {getIcon(trait.trait)}
          <span className="ml-1">
            {trait.trait}: {(trait.score * 100).toFixed(1)}%
          </span>
        </Badge>
      </motion.div>
    ))
  }

  const cleanText = (text: string) => {
    return text.replace(/\*/g, '').split('\n\n').map((paragraph, index) => (
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="mb-4 leading-relaxed"
      >
        {paragraph.trim()}
      </motion.p>
    ))
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-2 border border-gray-200 rounded-md shadow-md"
        >
          <p className="font-medium flex items-center gap-2">
            {getIcon(payload[0].name)}
            {payload[0].name}
          </p>
          <p className="text-gray-600">
            {(payload[0].value * 100).toFixed(1)}%
          </p>
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cultural Fit Analysis
          </CardTitle>
          <CardDescription className="text-gray-600">
            AI-Powered Evaluation of Cultural Alignment and Behavioral Traits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="prose prose-gray max-w-none">
              {cleanText(data.result)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {data.primary_traits?.length > 0 && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Emotional Intelligence Analysis
            </CardTitle>
            <CardDescription className="text-gray-600">
              Real-time breakdown of emotional patterns and responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.primary_traits.map((pt, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                >
                  <div className="font-medium text-lg flex items-center gap-2 text-gray-800">
                    <Brain className="w-5 h-5 text-blue-500" />
                    {pt.segment === 'final' ? 'Overall Analysis' : `Segment ${pt.segment}`}
                  </div>
                  <div className="flex flex-wrap">
                    {renderEmotions(pt.emotions)}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pt.emotions}
                        dataKey="emotion_score"
                        nameKey="emotion_name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {pt.emotions.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="transition-all duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.segment_secondary_traits?.length > 0 && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Behavioral Traits Analysis
            </CardTitle>
            <CardDescription className="text-gray-600">
              AI-Enhanced assessment of professional characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.segment_secondary_traits.map((st, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 border border-green-100"
                >
                  <div className="font-medium text-lg flex items-center gap-2 text-gray-800">
                    <Target className="w-5 h-5 text-green-500" />
                    Segment {st.segment}
                  </div>
                  <div className="flex flex-wrap">
                    {renderTraits(st.traits)}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={st.traits}>
                      <XAxis dataKey="trait" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#48BB78">
                        {st.traits.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="transition-all duration-300"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default CulturalFitAnalysis

