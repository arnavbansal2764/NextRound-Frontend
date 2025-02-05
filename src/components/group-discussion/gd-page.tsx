"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Send,
    Play,
    Users,
    MessageSquare,
    Volume2,
    VolumeX,
} from "lucide-react"
import toast from "react-hot-toast"
import { GroupDiscussionClient, type ResponseMessage } from "@/lib/group_discussion"
import { useSession } from "next-auth/react"
import Typewriter from "react-ts-typewriter"
import VoiceAnimation from "../cultural-fit/voice-animation"
import { getTranscript } from "@/lib/audioConvert"
import AnalyzingResponseAnimation from "../interview/analyzing-response"
import QuestionReader from "./screen-reader"

interface Participant {
    id: string
    name: string
    avatar: string
    voice?: string
}

const DiscussionSummary: React.FC<{ summary: string }> = ({ summary }) => {
    const [prefix, actualSummary] = summary.split("Summary: ")
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded-lg shadow-md"
        >
            <div className="flex items-center mb-2">
                <Users className="mr-2 h-5 w-5" />
                <h3 className="font-bold text-lg">{prefix}</h3>
            </div>
            <p className="italic text-sm">{actualSummary}</p>
        </motion.div>
    )
}

const ParticipantVideo: React.FC<{
    participant: Participant
    isActive: boolean
    videoRef?: React.RefObject<HTMLVideoElement>
    stream?: MediaStream
}> = ({ participant, isActive, videoRef, stream }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md ${isActive ? "ring-2 ring-blue-500" : ""}`}
        >
            {videoRef ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
                <Avatar className="w-full h-full">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                {participant.name}
            </div>
        </motion.div>
    )
}

export default function GroupDiscussion() {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState<ResponseMessage[]>([])
    const [topic, setTopic] = useState("")
    const [isDiscussionStarted, setIsDiscussionStarted] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [isSpeakerOn, setIsSpeakerOn] = useState(true)
    const [progress, setProgress] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const clientRef = useRef<GroupDiscussionClient | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { data: session } = useSession()
    const name = session?.user?.name
    const [stream, setStream] = useState<MediaStream | null>(null)
    const recognitionRef = useRef<MediaRecorder | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [questionRead, setQuestionRead] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const participants: Participant[] = [
        { id: "human", name: name || "You", avatar: "/placeholder.svg?height=200&width=200" },
        { id: "bot1", name: "Bot 1", avatar: "/placeholder.svg?height=200&width=200", voice: "Matthew" },
        { id: "bot2", name: "Bot 2", avatar: "/placeholder.svg?height=200&width=200", voice: "Justin" },
        { id: "bot3", name: "Bot 3", avatar: "/placeholder.svg?height=200&width=200", voice: "Joey" },
    ]

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
    }, [messagesEndRef, messages])

    useEffect(() => {
        const initStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (err) {
                console.error("Error accessing media devices:", err)
            }
        }

        initStream()

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        if (isVideoOn && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current!.srcObject = stream;
                })
                .catch((err) => {
                    console.error("Failed to get video stream", err);
                });
        }
    }, [isVideoOn]);

    const connectToServer = async () => {
        if (!clientRef.current) return

        try {
            await clientRef.current.connect()
            setIsConnected(true)
            toast.success("Connected to server")

            clientRef.current.onMessage((msg: ResponseMessage) => {
                switch (msg.type) {
                    case "GD_START":
                        setIsDiscussionStarted(true)
                        setMessages([])
                        setSummary(null)
                        break
                    case "GD_HUMAN_ADDED":
                    case "GD_BOT_RESPONSES":
                        setMessages((prev) => [...prev, msg])
                        setProgress((prev) => Math.min(prev + 10, 100))
                        break
                    case "GD_END":
                        setSummary(msg.payload)
                        setIsDiscussionStarted(false)
                        break
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
        toast.success("Discussion started")
        setIsDiscussionStarted(true)
    }

    const sendMessage = useCallback(() => {
        if (!clientRef.current || !transcript) return
        clientRef.current.sendHumanMessage(transcript)
        setTranscript("")
    }, [clientRef, transcript])

    const endDiscussion = () => {
        if (!clientRef.current) return
        clientRef.current.endDiscussion()
        toast.success("Ending discussion and generating summary...")
    }

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn)
        if (stream) {
            stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn))
        }
    }

    const toggleMic = () => {
        setIsMicOn(!isMicOn)
        if (stream) {
            stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn))
        }
    }

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn)
        if (audioRef.current) {
            if (isSpeakerOn) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
        }
    }

    const startRecording = () => {
        setIsRecording(true)
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream)
            const audioChunks: Blob[] = []
            const audioContext = new AudioContext()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()

            source.connect(analyser)
            analyser.fftSize = 256
            const dataArray = new Uint8Array(analyser.fftSize)

            let silenceStart: number | null = null
            let isSilenceDetected = false

            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data)
            })

            const checkSilence = () => {
                analyser.getByteTimeDomainData(dataArray)
                const volume = dataArray.reduce((sum, value) => sum + Math.abs(value - 128), 0) / dataArray.length

                if (volume < 5) {
                    // Silence threshold (adjust as needed)
                    if (!silenceStart) {
                        silenceStart = performance.now()
                    } else if (performance.now() - silenceStart > 3000) {
                        // 3 seconds of silence
                        if (!isSilenceDetected) {
                            setIsRecording(false)
                            console.log("Silence detected. Stopping recording...")
                            isSilenceDetected = true
                            mediaRecorder.stop()
                            stream.getTracks().forEach((track) => track.stop())
                            audioContext.close()
                        }
                    }
                } else {
                    silenceStart = null // Reset silence timer
                }

                if (mediaRecorder.state === "recording") {
                    requestAnimationFrame(checkSilence)
                }
            }

            mediaRecorder.addEventListener("stop", async () => {
                const audioBlob = new Blob(audioChunks)
                const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" })
                setIsAnalyzing(true)
                try {
                    const transcriptText = await getTranscript(audioFile)
                    setTranscript(transcriptText)
                } catch (error) {
                    console.error("Error processing audio:", error)
                    toast.error("Error processing audio")
                } finally {
                    setIsAnalyzing(false)
                }
            })

            mediaRecorder.start()
            recognitionRef.current = mediaRecorder
            requestAnimationFrame(checkSilence)
        })
    }

    const stopRecording = () => {
        setIsRecording(false)
        if (recognitionRef.current && recognitionRef.current instanceof MediaRecorder) {
            recognitionRef.current.stop()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 p-4">
            {isAnalyzing && <AnalyzingResponseAnimation />}
            <Card className="w-full max-w-6xl mx-auto">
                <CardHeader className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <CardTitle className="flex items-center justify-between">
                        <span>Group Discussion: {topic || "Not started"}</span>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</span>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <AnimatePresence mode="wait">
                        {!isConnected ? (
                            <motion.div
                                key="connect"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <Button onClick={connectToServer} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    Connect to Server
                                </Button>
                            </motion.div>
                        ) : !isDiscussionStarted && !summary ? (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Enter discussion topic"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <Button
                                    onClick={startDiscussion}
                                    disabled={!topic}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                >
                                    <Play className="mr-2 h-4 w-4" /> Start Discussion
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="discussion"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                            {isVideoOn ? (
                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <Avatar className="h-32 w-32 ring-4 ring-gray-300">
                                                        <AvatarImage src="/placeholder.svg?height=128&width=128&text=You" />
                                                        <AvatarFallback>YOU</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            )}
                                    {participants.slice(1).map((participant, index) => (
                                        <ParticipantVideo
                                            key={participant.id}
                                            participant={participant}
                                            isActive={index === (messages.length - 1) % 3}
                                            stream={stream || undefined}
                                        />
                                    ))}
                                </div>
                                <div className="h-[30vh] overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow">
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className={`flex ${msg.type === "GD_HUMAN_ADDED" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.type === "GD_HUMAN_ADDED" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                            >
                                                <QuestionReader
                                                    question={msg.payload}
                                                    questionRead={questionRead}
                                                    setQuestionRead={setQuestionRead}
                                                />
                                                <Typewriter text={msg.payload} />
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                {transcript && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-6 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg relative overflow-hidden mb-6"
                                    >
                                        <motion.div
                                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        />
                                        <motion.p
                                            className="text-gray-700 leading-relaxed"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <Typewriter text={transcript} />
                                        </motion.p>
                                    </motion.div>
                                )}
                                {summary && <DiscussionSummary summary={summary} />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0 z-10">
                    {isDiscussionStarted && (
                        <div className="flex flex-col w-full space-y-4">
                            <div className="flex w-full space-x-2">
                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? "destructive" : "default"}
                                    className={`${isRecording ? "bg-red-500" : "bg-gradient-to-r from-blue-600 to-purple-600"} text-white flex-grow`}
                                >
                                    {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                                    {isRecording ? "Stop Recording" : "Start Recording"}
                                </Button>
                                {isRecording && <VoiceAnimation />}
                                <Button
                                    onClick={sendMessage}
                                    disabled={!transcript}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <Button
                                    onClick={toggleMic}
                                    variant="outline"
                                    className={`rounded-full ${isMicOn ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </Button>
                                <Button
                                    onClick={toggleVideo}
                                    variant="outline"
                                    className={`rounded-full ${isVideoOn ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                </Button>
                                <Button
                                    onClick={toggleSpeaker}
                                    variant="outline"
                                    className={`rounded-full ${isSpeakerOn ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                    {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                </Button>
                                <Button onClick={endDiscussion} variant="destructive" className="rounded-full">
                                    <PhoneOff className="h-4 w-4 mr-2" /> End Discussion
                                </Button>
                            </div>
                        </div>
                    )}
                    {summary && (
                        <Button
                            onClick={startDiscussion}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                            Start New Discussion
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
