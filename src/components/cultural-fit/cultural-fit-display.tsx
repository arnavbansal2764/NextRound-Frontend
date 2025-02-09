"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Lightbulb, Heart, Target, Sparkles, ChevronDown, ChevronUp, Star } from "lucide-react"
import type { Emotion, Segment, SegmentSecondaryTrait, Trait } from "@/lib/redis/types"
import { Button } from "@/components/ui/button"

import ReactMarkdown from 'react-markdown'
interface CulturalScore {
  question: string
  refrenceAnswer: string
  score: number
}

interface CulturalFitAnalysisProps {
  result: string
  primary_traits: Segment[]
  segment_secondary_traits: SegmentSecondaryTrait[]
  scores: {
    totalScore: number
    averageScore: number
    scores: CulturalScore[]
  }
}

const COLORS = ["#4299E1", "#48BB78", "#ED8936", "#9F7AEA", "#F56565"]

const CulturalFitAnalysis: React.FC<{ data: CulturalFitAnalysisProps }> = ({ data }) => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
  const [showFullText, setShowFullText] = useState(false)
  const [expandedTraits, setExpandedTraits] = useState<{ [key: string]: boolean }>({})

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }))
  }

  const toggleTrait = (traitKey: string) => {
    setExpandedTraits((prev) => ({ ...prev, [traitKey]: !prev[traitKey] }))
  }

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "creative thinking":
        return <Lightbulb className="w-4 h-4" />
      case "emotional resilience":
        return <Heart className="w-4 h-4" />
      case "problem solving":
        return <Target className="w-4 h-4" />
      case "drive and motivation":
        return <Sparkles className="w-4 h-4" />
      case "empathy":
        return <Heart className="w-4 h-4" />
      case "leadership potential":
        return <Star className="w-4 h-4" />
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

  const renderTraits = (traits: Trait[], segmentKey: string) => {
    return traits.map((trait, index) => (
      <motion.div
        key={`${segmentKey}-${index}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="mb-4"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleTrait(`${segmentKey}-${index}`)}
        >
          <Badge
            variant="outline"
            className="mr-2 bg-gradient-to-r from-green-100 to-teal-100 text-gray-800 hover:from-green-200 hover:to-teal-200 transition-all duration-300"
          >
            {getIcon(trait.trait)}
            <span className="ml-1">
              {trait.trait}: {(trait.score * 100).toFixed(1)}%
            </span>
          </Badge>
          {expandedTraits[`${segmentKey}-${index}`] ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <AnimatePresence>
          {expandedTraits[`${segmentKey}-${index}`] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-sm text-gray-600"
            >
              {trait.trait}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))
  }

  const cleanText = (text: string) => {
    const sections = text.split("\n\n")
    const visibleSections = showFullText ? sections : sections.slice(0, 2)

    return (
      <>
        {visibleSections.map((section, index) => {
          const [title, ...content] = section.split("\n")
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-4"
              onClick={() => setShowFullText(true)}
            >
              <h3 className="text-lg font-semibold mb-2">{title.replace(/\*\*/g, "")}</h3>
              {content.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-2 leading-relaxed">
                  {paragraph.trim()}
                </p>
              ))}
            </motion.div>
          )
        })}
        {!showFullText && sections.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            <Button  variant="link" className="mt-2">
              Read more
            </Button>
          </motion.div>
        )}
      </>
    )
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
          <p className="text-gray-600">{(payload[0].value * 100).toFixed(1)}%</p>
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
            <div className="prose prose-gray max-w-none"><ReactMarkdown>{data.result}</ReactMarkdown></div>
          </ScrollArea>
        </CardContent>
      </Card>

      {data.primary_traits?.length > 0 && (
        <Card className="bg-white shadow-lg border-0 hover:bg-slate-100" >
          <CardHeader>
            <div className="flex justify-between items-center" onClick={() => toggleCategory("emotionalIntelligence")}>
              <div onClick={() => toggleCategory("emotionalIntelligence")}>
                <CardTitle className="text-xl font-semibold text-gray-800">Emotional Intelligence Analysis</CardTitle>
                <CardDescription className="text-gray-600">
                  Real-time breakdown of emotional patterns and responses
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="p-0" onClick={() => toggleCategory("emotionalIntelligence")}>
                {expandedCategories["emotionalIntelligence"] ? (
                  <ChevronUp className="h-6 w-6"  />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {expandedCategories["emotionalIntelligence"] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.primary_traits
                      .filter((pt) => pt.segment === "final")
                      .map((pt, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.2 }}
                          className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                        >
                          <div className="font-medium text-lg flex items-center gap-2 text-gray-800">
                            <Brain className="w-5 h-5 text-blue-500" />
                            Overall Analysis
                          </div>
                          <div className="flex flex-wrap">{renderEmotions(pt.emotions)}</div>
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
                  <Button
                    onClick={() => toggleCategory("segmentAnalysis")}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    {expandedCategories["segmentAnalysis"] ? "Hide" : "Show"} Segment Analysis
                    {expandedCategories["segmentAnalysis"] ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                  <AnimatePresence>
                    {expandedCategories["segmentAnalysis"] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        {data.primary_traits
                          .filter((pt) => pt.segment !== "final")
                          .map((pt, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.2 }}
                              className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
                            >
                              <div className="font-medium text-lg flex items-center gap-2 text-gray-800">
                                <Brain className="w-5 h-5 text-blue-500" />
                                Segment {pt.segment}
                              </div>
                              <div className="flex flex-wrap">{renderEmotions(pt.emotions)}</div>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {data.segment_secondary_traits?.length > 0 && (
        <Card className="bg-white shadow-lg border-0 hover:bg-slate-100" onClick={() => toggleCategory("behavioralTraits")}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Behavioral Traits Analysis</CardTitle>
                <CardDescription className="text-gray-600">
                  AI-Enhanced assessment of professional characteristics
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="p-0">
                {expandedCategories["behavioralTraits"] ? (
                  <ChevronUp className="h-6 w-6" />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {expandedCategories["behavioralTraits"] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                        <div className="flex flex-col">{renderTraits(st.traits, `segment-${st.segment}`)}</div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      <Card className="bg-white shadow-lg border-0 hover:bg-slate-100" onClick={() => toggleCategory("culturalFitScores")}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Cultural Fit Scores</CardTitle>
              <CardDescription className="text-gray-600">
                Detailed breakdown of cultural alignment scores
              </CardDescription>
            </div>
            <Button  variant="ghost" size="sm" className="p-0">
              {expandedCategories["culturalFitScores"] ? (
                <ChevronUp className="h-6 w-6" />
              ) : (
                <ChevronDown className="h-6 w-6" />
              )}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedCategories["culturalFitScores"] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-800">Total Score</p>
                      <p className="text-3xl font-bold text-purple-600">{data.scores.totalScore.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">Average Score</p>
                      <p className="text-3xl font-bold text-indigo-600">{data.scores.averageScore.toFixed(2)}</p>
                    </div>
                  </motion.div>
                  <div className="space-y-4">
                    {data.scores.scores.map((score, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-800">{score.question}</p>
                          <Badge variant="secondary" className="text-sm">
                            Score: {score.score.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{score.refrenceAnswer}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default CulturalFitAnalysis

