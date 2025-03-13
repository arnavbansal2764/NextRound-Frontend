"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BookOpen,
    Brain,
    Lightbulb,
    Sparkles,
    FileText,
    Zap,
    Bookmark,
    Copy,
    Check,
    CheckCircle,
    XCircle,
} from "lucide-react"

// Add this right after the imports
const TypewriterMarkdown: React.FC<{
    content: string
    speed?: number
    onComplete?: () => void
}> = ({ content, speed = 5, onComplete }) => {
    const [displayedContent, setDisplayedContent] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < content.length) {
            const timer = setTimeout(() => {
                setDisplayedContent(content.substring(0, currentIndex + 1))
                setCurrentIndex(currentIndex + 1)
            }, speed)

            return () => clearTimeout(timer)
        } else if (onComplete) {
            onComplete()
        }
    }, [content, currentIndex, speed, onComplete])

    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
}

interface TutorResponseDisplayProps {
    content: string
    title?: string
    subject?: string
    chapter?: string
    onClose?: () => void
}

const TutorResponseDisplay: React.FC<TutorResponseDisplayProps> = ({
    content,
    title = "NCERT Tutor Response",
    subject = "Science",
    chapter = "NCERT Textbook",
    onClose,
}) => {
    const [isAnimationComplete, setIsAnimationComplete] = useState(false)
    const [hasShownAnimation, setHasShownAnimation] = useState(false)
    const [activeTab, setActiveTab] = useState("content")
    const [bookmarked, setBookmarked] = useState(false)
    const [copied, setCopied] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Format the content for better display
    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, "**$1**") // Ensure bold text is properly formatted
        .replace(/---/g, "\n---\n") // Ensure horizontal rules have proper spacing
        .replace(/(\d+\.)/g, "\n$1") // Format numbered lists
        .replace(/- /g, "\n- ") // Format bullet points

    // Extract sections and headings for navigation
    const sections = formattedContent.split("---").filter((section) => section.trim().length > 0)

    // Extract headings and clean them up
    const headings =
        formattedContent.match(/### \*\*(.*?)\*\*|### (.*?)(?=\n|$)/g)?.map((h) => {
            // Remove markdown syntax
            return h.replace(/### \*\*|\*\*|### /g, "").trim()
        }) || []

    // Extract key points more intelligently
    const extractKeyPoints = () => {
        const allPoints:any = []
        const seenPoints = new Set()

        // Try to find bullet points
        const bulletPoints = formattedContent.match(/- (.*?)(?=\n|$)/g)
        if (bulletPoints && bulletPoints.length > 0) {
            bulletPoints.forEach((point) => {
                const cleanPoint = point.replace(/- /, "").replace(/\*\*/g, "").trim()
                if (!seenPoints.has(cleanPoint.toLowerCase()) && cleanPoint.length > 5) {
                    seenPoints.add(cleanPoint.toLowerCase())
                    allPoints.push({
                        text: cleanPoint,
                        type: "bullet",
                    })
                }
            })
        }

        // Try to find numbered points
        const numberedPoints = formattedContent.match(/\d+\. (.*?)(?=\n|$)/g)
        if (numberedPoints && numberedPoints.length > 0) {
            numberedPoints.forEach((point) => {
                const cleanPoint = point
                    .replace(/\d+\. /, "")
                    .replace(/\*\*/g, "")
                    .trim()
                if (!seenPoints.has(cleanPoint.toLowerCase()) && cleanPoint.length > 5) {
                    seenPoints.add(cleanPoint.toLowerCase())
                    allPoints.push({
                        text: cleanPoint,
                        type: "numbered",
                    })
                }
            })
        }

        // If we have enough points, return them
        if (allPoints.length >= 4) {
            return allPoints.slice(0, 6)
        }

        // Extract key terms from headings
        headings.forEach((heading) => {
            if (!seenPoints.has(heading.toLowerCase()) && heading.length > 3) {
                seenPoints.add(heading.toLowerCase())
                allPoints.push({
                    text: heading,
                    type: "heading",
                    description: getSectionContent(heading, 80),
                })
            }
        })

        // If still not enough, extract bold text as key points
        if (allPoints.length < 6) {
            const boldTexts = formattedContent.match(/\*\*(.*?)\*\*/g)
            if (boldTexts && boldTexts.length > 0) {
                boldTexts.forEach((text) => {
                    const cleanText = text.replace(/\*\*/g, "").trim()
                    if (!seenPoints.has(cleanText.toLowerCase()) && cleanText.length > 3 && cleanText.length < 40) {
                        seenPoints.add(cleanText.toLowerCase())
                        allPoints.push({
                            text: cleanText,
                            type: "bold",
                        })
                    }
                })
            }
        }

        // Limit to 6 key points
        return allPoints.slice(0, 6)
    }

    const keyPoints = extractKeyPoints()

    // Get section content by heading
    const getSectionContent = (heading: string, maxLength = 150) => {
        for (const section of sections) {
            if (section.includes(heading) || section.includes(`**${heading}**`)) {
                // Extract a summary without markdown
                const cleanSection = section
                    .replace(/### \*\*.*?\*\*|### .*?(?=\n|$)/g, "") // Remove headings
                    .replace(/\*\*/g, "") // Remove bold markers
                    .replace(/\n+/g, " ") // Replace multiple newlines with space
                    .trim()

                return cleanSection.length > maxLength ? cleanSection.substring(0, maxLength) + "..." : cleanSection
            }
        }
        return "..."
    }

    // Extract a question for the self-assessment
    const extractQuestion = () => {
        // Look for explicit self-assessment questions
        const selfAssessmentSection = sections.find(
            (section) =>
                section.toLowerCase().includes("self-assessment") ||
                section.toLowerCase().includes("practice") ||
                section.toLowerCase().includes("quiz"),
        )

        if (selfAssessmentSection) {
            // Look for question marks in the self-assessment section
            const questionMatch = selfAssessmentSection.match(/([^.?!]+\?)/g)
            if (questionMatch && questionMatch.length > 0) {
                return questionMatch[0].trim()
            }
        }

        // Look for any question in the content
        const questionMatch = formattedContent.match(/([^.?!]+\?)/g)
        if (questionMatch && questionMatch.length > 0) {
            return questionMatch[0].trim()
        }

        // Default question based on content
        if (formattedContent.toLowerCase().includes("generator")) {
            return "What is the main principle behind the working of a generator?"
        } else if (formattedContent.toLowerCase().includes("electromagnetic")) {
            return "Which phenomenon is responsible for electromagnetic induction?"
        } else if (formattedContent.toLowerCase().includes("faraday")) {
            return "What is Faraday's Law of Electromagnetic Induction?"
        }

        return "What is the main concept discussed in this content?"
    }

    // Generate answers for the self-assessment
    const generateAnswers = () => {
        const question = extractQuestion()
        let correctAnswer = ""

        // Try to find the correct answer in the content
        if (question.includes("generator") && formattedContent.includes("electromagnetic induction")) {
            correctAnswer = "Electromagnetic induction"
        } else if (question.includes("electromagnetic") && formattedContent.includes("changing magnetic field")) {
            correctAnswer = "Changing magnetic field"
        } else if (formattedContent.includes("Faraday")) {
            correctAnswer = "Faraday's Law"
        } else {
            // Default for generator content
            correctAnswer = "Electromagnetic induction"
        }

        // Generate distractors based on content
        const distractors = [
            "Conservation of energy",
            "Coulomb's law",
            "Ohm's law",
            "Newton's third law",
            "Thermal expansion",
            "Photoelectric effect",
        ].filter((d) => d.toLowerCase() !== correctAnswer.toLowerCase())

        // Shuffle and take 3 distractors
        const shuffledDistractors = distractors.sort(() => Math.random() - 0.5).slice(0, 3)

        // Combine correct answer with distractors and shuffle
        const allAnswers = [correctAnswer, ...shuffledDistractors]
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5)

        return {
            question,
            answers: shuffledAnswers,
            correctAnswer,
        }
    }

    const assessmentData = generateAnswers()

    const handleAnswerClick = (answer: string) => {
        setSelectedAnswer(answer)
        setShowAnswerFeedback(true)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Check if this is the first time showing the animation
    useEffect(() => {
        // Reset animation state when content changes
        setIsAnimationComplete(false)

        // If we've already shown an animation before, we still want to show
        // a new animation for new content, so we don't check hasShownAnimation here
    }, [content]) // Add content as a dependency to restart animation when content changes

    // Add this before the return statement
    console.log("Assessment data:", assessmentData)

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
                            <p className="text-blue-200 text-sm">
                                {subject} • {chapter}
                            </p>
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
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
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
                        <div className="prose prose-invert prose-blue max-w-none">
                            {!isAnimationComplete ? (
                                <div ref={contentRef}>
                                    {/* We'll implement a custom typewriter effect that works with markdown */}
                                    <TypewriterMarkdown
                                        content={formattedContent}
                                        speed={5}
                                        onComplete={() => setIsAnimationComplete(true)}
                                    />
                                </div>
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formattedContent}</ReactMarkdown>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Key Points Tab */}
                <TabsContent value="key-points" className="p-0 m-0">
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {keyPoints.length > 0 ? (
                                keyPoints.map((point:any, index:any) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="bg-gray-800/50 border-gray-700/50 hover:border-blue-600/50 transition-all duration-300">
                                            <CardContent className="p-4 flex items-start gap-3">
                                                <div className="bg-blue-900/30 p-2 rounded-full mt-1">
                                                    {point.type === "heading" ? (
                                                        <BookOpen className="h-4 w-4 text-blue-400" />
                                                    ) : point.type === "bullet" || point.type === "numbered" ? (
                                                        <Lightbulb className="h-4 w-4 text-blue-400" />
                                                    ) : (
                                                        <Sparkles className="h-4 w-4 text-blue-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-blue-300 mb-1">{point.text}</h3>
                                                    {point.description ? (
                                                        <p className="text-sm text-gray-300">{point.description}</p>
                                                    ) : point.type === "heading" ? (
                                                        <p className="text-sm text-gray-300">{getSectionContent(point.text, 80)}</p>
                                                    ) : null}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 text-gray-400">No key points found in this content</div>
                            )}
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
                                    <p className="text-gray-300 mb-4">Test your understanding of this concept:</p>
                                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700/50 mb-4">
                                        <p className="text-gray-300 font-medium mb-3">
                                            {assessmentData.question || "What is the main principle behind the working of a generator?"}
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {assessmentData.answers.map((answer, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    className={`w-full justify-start text-left border-gray-700 hover:bg-blue-900/20 hover:text-blue-300 ${selectedAnswer === answer
                                                            ? answer === assessmentData.correctAnswer
                                                                ? "bg-green-900/30 border-green-600"
                                                                : "bg-red-900/30 border-red-600"
                                                            : ""
                                                        }`}
                                                    onClick={() => handleAnswerClick(answer)}
                                                    disabled={showAnswerFeedback}
                                                >
                                                    {selectedAnswer === answer &&
                                                        (answer === assessmentData.correctAnswer ? (
                                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                                        ))}
                                                    {answer}
                                                </Button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {showAnswerFeedback && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`mt-4 p-3 rounded-md ${selectedAnswer === assessmentData.correctAnswer
                                                            ? "bg-green-900/30 border border-green-700"
                                                            : "bg-red-900/30 border border-red-700"
                                                        }`}
                                                >
                                                    {selectedAnswer === assessmentData.correctAnswer ? (
                                                        <p className="text-green-300 flex items-center">
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Correct! {assessmentData.correctAnswer} is the right answer.
                                                        </p>
                                                    ) : (
                                                        <p className="text-red-300 flex items-center">
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Not quite. The correct answer is {assessmentData.correctAnswer}.
                                                        </p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {showAnswerFeedback && (
                                        <Button
                                            onClick={() => {
                                                setSelectedAnswer(null)
                                                setShowAnswerFeedback(false)
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Try Another Question
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800/50 border-gray-700/50">
                                <CardContent className="p-4 sm:p-6">
                                    <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                                        <Zap className="h-5 w-5 mr-2" />
                                        Related Topics
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {headings.slice(0, 4).map((heading, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start"
                                            >
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                {heading}
                                            </Button>
                                        ))}

                                        {/* Fallback buttons if not enough headings */}
                                        {headings.length < 4 && (
                                            <>
                                                {!headings.some((h) => h.toLowerCase().includes("electromagnetic")) && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start"
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Electromagnetic Induction
                                                    </Button>
                                                )}
                                                {!headings.some((h) => h.toLowerCase().includes("current")) && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start"
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        AC vs DC Current
                                                    </Button>
                                                )}
                                                {!headings.some((h) => h.toLowerCase().includes("magnetic")) && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start"
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Magnetic Fields
                                                    </Button>
                                                )}
                                                {!headings.some((h) => h.toLowerCase().includes("motor")) && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-blue-700/50 hover:bg-blue-900/30 text-blue-300 justify-start"
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Electric Motors
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="bg-gray-900 p-4 border-t border-gray-800 flex justify-between items-center">
                <p className="text-xs text-gray-400">NCERT 10th Grade • {chapter}</p>
                <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
                    Continue Learning
                </Button>
            </div>
        </motion.div>
    )
}

export default TutorResponseDisplay

