"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Play, User, FileText } from "lucide-react"
import toast from "react-hot-toast"
import { GroupDiscussionClient, ResponseMessage } from "@/lib/group_discussion"
import { useSession } from "next-auth/react"

type MessageType = "human" | "bot1" | "bot2" | "bot3" | "summary"

interface Message {
    type: MessageType
    content: string
}

const DiscussionSummary: React.FC<{ summary: string }> = ({ summary }) => {
    const [prefix, actualSummary] = summary.split("Summary: ")
    return (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded">
            <div className="flex items-center mb-2">
                <FileText className="mr-2" />
                <h3 className="font-bold">{prefix}</h3>
            </div>
            <p className="italic">{actualSummary}</p>
        </div>
    )
}

export default function GroupDiscussion() {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [topic, setTopic] = useState("")
    const [isDiscussionStarted, setIsDiscussionStarted] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const clientRef = useRef<GroupDiscussionClient | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const {data:session} = useSession()
    const name = session?.user?.name;
    useEffect(() => {
        clientRef.current = new GroupDiscussionClient()
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect()
            }
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messagesEndRef])

    const connectToServer = async () => {
        if (!clientRef.current) return

        try {
            await clientRef.current.connect()
            setIsConnected(true)
            toast.success("Connected to server")

            clientRef.current.onMessage((msg: ResponseMessage) => {
                if (msg.type === "GD_HUMAN_ADDED") {
                    setMessages((prev) => [...prev, { type: "human", content: msg.payload }])
                } else if (msg.type === "GD_BOT_RESPONSES") {
                    const botResponses = Array.isArray(msg.payload) ? msg.payload : [msg.payload]
                    botResponses.forEach((response) => {
                        const [botType, content] = response.split(": ")
                        setMessages((prev) => [
                            ...prev,
                            {
                                type: botType.toLowerCase() as MessageType,
                                content: content.trim(),
                            },
                        ])
                    })
                } else if (msg.type === "GD_END") {
                    setSummary(msg.payload)
                    setIsDiscussionStarted(false)
                }
            })
        } catch (error) {
            console.error("Failed to connect:", error)
            toast.error("Failed to connect to server")
        }
    }

    const startDiscussion = () => {
        if (!clientRef.current || !topic) return

        clientRef.current.startDiscussion(topic)
        setIsDiscussionStarted(true)
        setSummary(null)
        setMessages([])
        toast.success("Discussion started")
    }

    const sendMessage = () => {
        if (!clientRef.current || !inputMessage) return

        clientRef.current.sendHumanMessage(inputMessage)
        setInputMessage("")
    }

    const endDiscussion = () => {
        if (!clientRef.current) return

        clientRef.current.endDiscussion()
        toast.success("Ending discussion and generating summary...")
    }

    const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
        const isHuman = message.type === "human"
        const botColors = {
            bot1: "bg-blue-100 text-blue-800",
            bot2: "bg-green-100 text-green-800",
            bot3: "bg-purple-100 text-purple-800",
        }
        const botColor = botColors[message.type as keyof typeof botColors] || "bg-gray-100 text-gray-800"

        return (
            <div className={`flex ${isHuman ? "justify-end" : "justify-start"} mb-4`}>
                <div className={`flex items-start ${isHuman ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="w-10 h-10">
                        {isHuman ? (
                            <User className="w-6 h-6 text-gray-400" />
                        ) : (
                            <AvatarFallback>{message.type.toUpperCase()}</AvatarFallback>
                        )}
                    </Avatar>
                    <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${isHuman ? "bg-blue-500 text-white ml-2" : `${botColor} mr-2`}`}
                    >
                        <p>{message.content}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Group Discussion</CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {!isConnected ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                            <Button onClick={connectToServer}>Connect to Server</Button>
                        </motion.div>
                    ) : !isDiscussionStarted && !summary ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter discussion topic" />
                            <Button onClick={startDiscussion} disabled={!topic}>
                                <Play className="mr-2 h-4 w-4" /> Start Discussion
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="h-[60vh] overflow-y-auto space-y-4 p-4">
                                {messages.map((msg, index) => (
                                    <MessageBubble key={index} message={msg} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            {summary && <DiscussionSummary summary={summary} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
            <CardFooter>
                {isDiscussionStarted && (
                    <div className="flex w-full space-x-2">
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button onClick={sendMessage}>
                            <Send className="h-4 w-4" />
                        </Button>
                        <Button onClick={endDiscussion} variant="destructive">
                            End Discussion
                        </Button>
                    </div>
                )}
                {summary && (
                    <Button onClick={startDiscussion} className="w-full mt-4">
                        Start New Discussion
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

