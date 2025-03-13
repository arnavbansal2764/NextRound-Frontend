"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { TypeAnimation } from "react-type-animation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Brain, Lightbulb, Sparkles, FileText, ArrowRight, MessageSquare, Zap, Bookmark, Share2 } from 'lucide-react'

interface EducationalContentProps {
    content: string
    title?: string
    subject?: string
    chapter?: string
    onClose?: () => void
}

const EducationalContent: React.FC<EducationalContentProps> = ({
    content,
    title = "NCERT Tutor Response",
    subject = "Science",
    chapter = "Electromagnetic Induction",
    onClose,
}) => {
    const [isAnimationComplete, setIsAnimationComplete] = useState(false)
    const [activeTab, setActiveTab] = useState("content")
    const [bookmarked, setBookmarked] = useState(false)

    // Extract sections from markdown content
    const sections = content.split("---").filter(section => section.trim().length > 0)

    // Extract headings for quick navigation
    const headings = content.match(/### \*\*(.*?)\*\*/g)?.map(h => h.replace(/### \*\*|\*\*/g, "")) || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-4 sm:p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-700/50 p-2 rounded-full">
                            <BookOpen className="h-6 w-6 text-blue-100" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
                            <p className="text-blue-200 text-sm">{subject} • {chapter}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-100 hover:text-white hover:bg-blue-800/50"
                            onClick={() => setBookmarked(!bookmarked)}
                        >
                            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-blue-300" : ""}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-100 hover:text-white hover:bg-blue-800/50"
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="content" className="w-full" onValueChange={setActiveTab}>
                <div className="bg-gray-800 border-b border-gray-700">
                    <TabsList className="bg-transparent h-12 w-full justify-start px-4 gap-2">
                        <TabsTrigger
                            value="content"
                            className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-blue-300 rounded-md px-3 py-1.5"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger
                            value="key-points"
                            className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-blue-300 rounded-md px-3 py-1.5"
                        >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Key Points
                        </TabsTrigger>
                        <TabsTrigger
                            value="interactive"
                            className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-blue-300 rounded-md px-3 py-1.5"
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            Interactive
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Main Content Tab */}
                <TabsContent value="content" className="p-0 m-0">
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                        {!isAnimationComplete ? (
                            <TypeAnimation
                                sequence={[
                                    content,
                                    () => setIsAnimationComplete(true)
                                ]}
                                wrapper="div"
                                cursor={false}
                                speed={90}
                                className="prose prose-invert prose-blue max-w-none"
                                style={{ whiteSpace: 'pre-line' }}
                            />
                        ) : (
                            <div className="prose prose-invert prose-blue max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Key Points Tab */}
                <TabsContent value="key-points" className="p-0 m-0">
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {headings.map((heading, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-gray-800/50 border-gray-700/50 hover:border-blue-600/50 transition-all duration-300">
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                                                <Sparkles className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-blue-300 mb-1">{heading}</h3>
                                                <p className="text-sm text-gray-300">
                                                    {sections.find(s => s.includes(heading))?.split("\n").slice(1, 3).join(" ").replace(/\*\*/g, "")}...
                                                </p>
                                                <Button variant="link" className="text-blue-400 p-0 h-auto mt-1">
                                                    Learn more <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Interactive Tab */}
                <TabsContent value="interactive" className="p-0 m-0">
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700/50">
                                <CardContent className="p-4 sm:p-6">
                                    <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                                        <Brain className="h-5 w-5 mr-2" />
                                        Self-Assessment
                                    </h3>
                                    <p className="text-gray-300 mb-4">Can you think of how a generator works in a power plant?</p>
                                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700/50 mb-4">
                                        <p className="text-gray-400 italic">Click to reveal answer</p>
                                        <div className="mt-2 text-gray-300 hidden group-hover:block">
                                            The turbine (mechanical energy) drives the generator, producing electrical energy.
                                        </div>
                                    </div>
                                    <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
                                        Reveal Answer
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800/50 border-gray-700/50">
                                <CardContent className="p-4 sm:p-6">
                                    <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                                        <Zap className="h-5 w-5 mr-2" />
                                        Practical Activity
                                    </h3>
                                    <p className="text-gray-300 mb-2">Use a small motor to demonstrate how a generator works:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Connect a small bulb to the terminals of a DC motor</li>
                                        <li>Rotate the shaft of the motor manually</li>
                                        <li>Observe the bulb glowing as you rotate the shaft</li>
                                        <li>Try rotating faster and slower to see the difference in brightness</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                                <h3 className="text-lg font-medium text-blue-300 mb-3">Next Steps</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Practice with similar questions
                                    </Button>
                                    <Button variant="outline" className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Dive deeper into electromagnetic induction
                                    </Button>
                                    <Button variant="outline" className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Connect to previous chapters
                                    </Button>
                                    <Button variant="outline" className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start">
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        Clarify concepts
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="bg-gray-900 p-4 border-t border-gray-800 flex justify-between items-center">
                <p className="text-xs text-gray-400">NCERT 10th Grade • Chapter 13</p>
                <Button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                >
                    Continue Learning
                </Button>
            </div>
        </motion.div>
    )
}

export default EducationalContent
