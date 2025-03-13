"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, User, Sparkles, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatMessageProps {
    message: string
    isUser: boolean
    timestamp?: string
    onViewFullExplanation?: () => void
    hasDetailedView?: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    isUser,
    timestamp,
    onViewFullExplanation,
    hasDetailedView = false,
}) => {
    const [expanded, setExpanded] = useState(false)

    // Determine if the message is long enough to need expansion
    const isLongMessage = message.length > 300
    const displayMessage = expanded || !isLongMessage ? message : message.substring(0, 300) + "..."

    // Determine message type
    const isImageMessage = message.startsWith("Image processed:") || message.startsWith("Sending image")
    const isErrorMessage = message.startsWith("Error:")
    const isQuestionAnswer = message.includes("Q:") && message.includes("\n\nA:")

    // Split Q&A format
    let question = ""
    let answer = ""
    if (isQuestionAnswer) {
        const parts = message.split("\n\nA:")
        question = parts[0].replace(/^Q:\s*/, "").trim()
        answer = parts[1].trim()
    }

    // Format the content for better display
    const formatContent = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, "**$1**") // Ensure bold text is properly formatted
            .replace(/---/g, "\n---\n") // Ensure horizontal rules have proper spacing
            .replace(/(\d+\.)/g, "\n$1") // Format numbered lists
            .replace(/- /g, "\n- ") // Format bullet points
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 pb-3 border-b border-gray-700/50 last:border-b-0"
        >
            {isUser ? (
                <div className="flex items-start gap-3">
                    <div className="bg-blue-900/30 rounded-full p-2 mt-1">
                        <User className="h-4 w-4 text-blue-300" />
                    </div>
                    <div className="bg-blue-900/30 p-3 rounded-lg max-w-[85%] border border-blue-700/30">
                        <p className="whitespace-pre-wrap text-gray-200">{message}</p>
                        {timestamp && <p className="text-xs text-gray-400 mt-1">{timestamp}</p>}
                    </div>
                </div>
            ) : isQuestionAnswer ? (
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-900/30 rounded-full p-2 mt-1">
                            <User className="h-4 w-4 text-blue-300" />
                        </div>
                        <div className="bg-blue-900/30 p-3 rounded-lg max-w-[85%] border border-blue-700/30">
                            <p className="whitespace-pre-wrap text-gray-200">{question}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-green-900/30 rounded-full p-2 mt-1">
                            <Sparkles className="h-4 w-4 text-green-300" />
                        </div>
                        <div className="bg-green-900/30 p-3 rounded-lg max-w-[85%] border border-green-700/30">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatContent(expanded || !isLongMessage ? answer : answer.substring(0, 300) + "...")}
                                </ReactMarkdown>
                            </div>

                            {isLongMessage && !expanded && (
                                <Button variant="link" onClick={() => setExpanded(true)} className="text-blue-400 p-0 h-auto mt-2">
                                    Read more
                                </Button>
                            )}

                            {hasDetailedView && (
                                <div className="mt-3 flex justify-end">
                                    <Button size="sm" onClick={onViewFullExplanation} className="bg-blue-600 hover:bg-blue-700">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Full Explanation
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : isImageMessage ? (
                <div className="flex items-start gap-3">
                    <div className="bg-purple-900/30 rounded-full p-2 mt-1">
                        <ImageIcon className="h-4 w-4 text-purple-300" />
                    </div>
                    <div className="bg-purple-900/30 p-3 rounded-lg max-w-[85%] border border-purple-700/30">
                        <p className="font-medium text-purple-300 mb-1">Image Analysis:</p>
                        <p className="whitespace-pre-wrap text-gray-200">{message}</p>
                    </div>
                </div>
            ) : isErrorMessage ? (
                <div className="flex items-start gap-3">
                    <div className="bg-red-900/30 rounded-full p-2 mt-1">
                        <MessageSquare className="h-4 w-4 text-red-300" />
                    </div>
                    <div className="bg-red-900/30 p-3 rounded-lg max-w-[85%] border border-red-700/30">
                        <p className="whitespace-pre-wrap text-red-300">{message}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <div className="bg-green-900/30 rounded-full p-2 mt-1">
                        <Sparkles className="h-4 w-4 text-green-300" />
                    </div>
                    <div className="bg-green-900/30 p-3 rounded-lg max-w-[85%] border border-green-700/30">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatContent(displayMessage)}</ReactMarkdown>
                        </div>

                        {isLongMessage && !expanded && (
                            <Button variant="link" onClick={() => setExpanded(true)} className="text-blue-400 p-0 h-auto mt-2">
                                Read more
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default ChatMessage

