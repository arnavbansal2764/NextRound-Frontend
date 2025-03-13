"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
    UPSCInterviewWebSocket,
    type UPSCInterviewConfig,
    type UPSCInterviewResponse,
    type UPSCInterviewSummary,
} from "@/lib/upsc/upsc-prac-ws"
import {
    Mic,
    MicOff,
    MessageSquare,
    Users,
    PhoneOff,
    User,
    UserCheck,
    Send,
    X,
    Info,
    CheckCircle,
    FileText,
    Sparkles,
    Video,
    VideoOff,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Result } from "@/components/upsc/result"
import { cn } from "@/lib/utils"
import QuestionReader from "@/components/interview/screen-reader"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface BoardMember {
    name: string
    background: string
    expertise: string
    style: string
    sample_questions: string[]
    avatar?: string
}

// Global modal component
function PanelistModal({
    isOpen,
    onClose,
    panelist,
}: {
    isOpen: boolean
    onClose: () => void
    panelist: BoardMember | null
}) {
    if (!isOpen || !panelist) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 shadow-xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900 to-green-800 p-5 relative">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-green-600/50 shadow-lg">
                            <AvatarImage src={panelist.avatar} alt={panelist.name} />
                            <AvatarFallback className="bg-green-800 text-white text-xl">{panelist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{panelist.name}</h2>
                            <p className="text-green-300">{panelist.background}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4 text-gray-300" />
                    </Button>
                </div>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="bg-gray-800/70 rounded-xl p-5 border border-gray-700">
                        <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">Expertise</h3>
                        <p className="text-gray-200">{panelist.expertise}</p>
                    </div>

                    <div className="bg-gray-800/70 rounded-xl p-5 border border-gray-700">
                        <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">Interview Style</h3>
                        <p className="text-gray-200">{panelist.style}</p>
                    </div>

                    {panelist.sample_questions && panelist.sample_questions.length > 0 && (
                        <div className="bg-gray-800/70 rounded-xl p-5 border border-gray-700">
                            <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">Sample Questions</h3>
                            <div className="space-y-3">
                                {panelist.sample_questions.map((q, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                        <div className="bg-green-900/50 rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-sm font-medium text-green-300">{i + 1}</span>
                                        </div>
                                        <p className="text-gray-300">{q}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-800">
                    <Button
                        className="w-full bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-white py-5 text-lg"
                        onClick={onClose}
                    >
                        Return to Interview
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

function InfoButton({ member, onClick }: { member: BoardMember; onClick: (member: BoardMember) => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-green-900/30 hover:bg-green-800/50 border border-green-700/30 transition-all duration-300"
            onClick={() => onClick(member)}
        >
            <Info className="h-4 w-4 text-green-300" />
        </Button>
    )
}

// Feature card component for setup page
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card className="bg-gray-800/50 border-gray-700/50 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20">
            <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-3">{icon}</div>
                <CardTitle className="text-green-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-300 text-sm">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function UPSCInterviewSimulator() {
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [isConfigured, setIsConfigured] = useState<boolean>(false)
    const [questions, setQuestions] = useState<UPSCInterviewResponse[]>([])
    const [currentQuestion, setCurrentQuestion] = useState<UPSCInterviewResponse | null>(null)
    const [userInfo, setUserInfo] = useState<UPSCInterviewConfig["user_info"]>({
        name: "",
        education: "",
        hobbies: "",
        achievements: "",
        background: "",
        optional_info: "",
    })
    const [interviewComplete, setInterviewComplete] = useState<boolean>(false)
    const [summary, setSummary] = useState<UPSCInterviewSummary | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
    const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
    const [textAnswer, setTextAnswer] = useState<string>("")
    const [isUsingText, setIsUsingText] = useState<boolean>(false)
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false)
    const [summaryError, setSummaryError] = useState<string | null>(null)
    const [showChat, setShowChat] = useState<boolean>(false)
    const [showParticipants, setShowParticipants] = useState<boolean>(false)
    const [activePanelist, setActivePanelist] = useState<string | null>(null)
    const [animateResponse, setAnimateResponse] = useState(false)
    const [progress, setProgress] = useState(0)
    const [audioStatus, setAudioStatus] = useState<string>("idle") // idle, listening, processing, paused
    const [speechDetected, setSpeechDetected] = useState<boolean>(false)
    const [silencePercentage, setSilencePercentage] = useState<number>(0)
    const [transcribedText, setTranscribedText] = useState<string>("")
    const [interviewState, setInterviewState] = useState<string>("waiting") // waiting, speaking, processing, answered
    const [showSummaryView, setShowSummaryView] = useState<boolean>(false)
    const [useSimpleResult, setUseSimpleResult] = useState<boolean>(true)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false)

    // Modal state
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [selectedPanelist, setSelectedPanelist] = useState<BoardMember | null>(null)
    const [questionRead, setQuestionRead] = useState(false)
    const interviewWsRef = useRef<UPSCInterviewWebSocket | null>(null)
    const questionEndRef = useRef<HTMLDivElement | null>(null)
    const chatEndRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    // Create a custom WebSocket to handle audio analysis and transcription
    const [customWs, setCustomWs] = useState<WebSocket | null>(null)

    // Function to open modal with panelist details
    const openPanelistModal = (panelist: BoardMember) => {
        setSelectedPanelist(panelist)
        setModalOpen(true)
    }

    // Function to close modal
    const closeModal = () => {
        setModalOpen(false)
    }

    // Check for mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => {
            window.removeEventListener("resize", checkMobile)
        }
    }, [])

    useEffect(() => {
        if (webcamEnabled && videoRef.current) {
            const startWebcam = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                } catch (err) {
                    console.error("Error accessing webcam:", err)
                    setWebcamEnabled(false)
                }
            }

            startWebcam()

            return () => {
                // Clean up video stream when component unmounts or webcam is disabled
                const stream = videoRef.current?.srcObject as MediaStream
                if (stream) {
                    stream.getTracks().forEach((track) => track.stop())
                }
            }
        } else if (!webcamEnabled && videoRef.current) {
            // Stop the webcam when disabled
            const stream = videoRef.current.srcObject as MediaStream
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
                videoRef.current.srcObject = null
            }
        }
    }, [webcamEnabled])

    // Initialize UPSC interview WebSocket instance
    useEffect(() => {
        const wsUrl = "wss://ws3.nextround.tech/upsc-main/"
        interviewWsRef.current = new UPSCInterviewWebSocket(wsUrl)
        const ws = new WebSocket(wsUrl)
        setCustomWs(ws)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Handle audio analysis data
                if (data.type === "audio_analysis") {
                    if (data.payload) {
                        setSilencePercentage(data.payload.silent_percentage || 0)
                        setSpeechDetected(data.payload.has_speech || false)

                        if (data.payload.has_speech) {
                            setInterviewState("speaking")
                        } else if (interviewState === "speaking" && !data.payload.has_speech) {
                            setInterviewState("processing")
                        }
                    }
                }
                if (data.type === "transcription") {
                    setTranscribedText(data.payload || "")
                }
            } catch (error) {
                // Not JSON or other error, ignore
            }
        }

        // Set up event listeners
        interviewWsRef.current.addQuestionListener((question) => {
            setQuestions((prev) => [...prev, question])
            setCurrentQuestion(question)
            setActivePanelist(question.board_member || null)
            setAnimateResponse(true)
            setTimeout(() => setAnimateResponse(false), 1000)

            if (question.is_final) {
                setInterviewComplete(true)
                setIsRecording(false)
            }
        })

        interviewWsRef.current.addStatusChangeListener((status) => {
            setConnectionStatus(status)

            if (status === "ready") {
                setIsConfigured(true)
                setInterviewState("waiting")
            } else if (status === "complete") {
                setInterviewComplete(true)
                setIsRecording(false)
                setInterviewState("waiting")
            } else if (status === "disconnected") {
                setIsConfigured(false)
                setIsRecording(false)
                setInterviewState("waiting")
            } else if (status === "listening") {
                setAudioStatus("listening")
            } else if (status === "processing") {
                setAudioStatus("processing")
                setInterviewState("processing")
            }
        })

        interviewWsRef.current.addErrorListener((error) => {
            console.error("UPSC Interview Error:", error)
        })

        // Update the addSummaryListener callback to properly store the raw summary data
        interviewWsRef.current.addSummaryListener((summaryData) => {
            console.log("Received summary data:", summaryData)

            // Store the original summary data without transformation
            setSummary(summaryData)
            setIsSummaryLoading(false)
            setInterviewComplete(true)
            setShowSummaryView(true)

            // For debugging, let's log what we're storing
            console.log("Setting summary state to:", summaryData)
        })

        interviewWsRef.current.addSetupInfoListener((setupInfo) => {
            if (setupInfo && setupInfo.board_members) {
                try {
                    // Transform board members into consistent objects
                    const formattedMembers: BoardMember[] = setupInfo.board_members.map((member: any, index: number) => {
                        // If the member is a string, create a board member object with default values
                        if (typeof member === "string") {
                            return {
                                name: member,
                                background: "UPSC Board Member",
                                expertise: "Civil Services",
                                style: "Professional",
                                sample_questions: [],
                                avatar: `/placeholder.svg?height=128&width=128&text=${member.charAt(0)}`,
                            }
                        }
                        // If the member is an object, extract the necessary properties
                        else if (member && typeof member === "object") {
                            return {
                                name: String(member.name || `Panelist ${index + 1}`),
                                background: String(member.background || "UPSC Board Member"),
                                expertise: String(member.expertise || "Civil Services"),
                                style: String(member.style || "Professional"),
                                sample_questions: Array.isArray(member.sample_questions) ? member.sample_questions : [],
                                avatar: `/placeholder.svg?height=128&width=128&text=${String(member.name || `P${index}`).charAt(0)}`,
                            }
                        }
                        // Fallback in case of unexpected types
                        return {
                            name: `Panelist ${index + 1}`,
                            background: "UPSC Board Member",
                            expertise: "Civil Services",
                            style: "Professional",
                            sample_questions: [],
                            avatar: `/placeholder.svg?height=128&width=128&text=P`,
                        }
                    })

                    setBoardMembers(formattedMembers)
                } catch (error) {
                    console.error("Error processing board members:", error)
                    // Fallback to empty array
                    setBoardMembers([])
                }
            }
        })

        return () => {
            // Cleanup
            if (interviewWsRef.current) {
                interviewWsRef.current.disconnect()
            }
            if (customWs) {
                customWs.close()
            }
        }
    }, [interviewState, userInfo])

    const configureAndStartInterview = async () => {
        // Validate user info
        if (!userInfo.name.trim() || !userInfo.education.trim()) {
            toast.error("Please provide at least your name and education to start the interview")
            return
        }

        try {
            const config: UPSCInterviewConfig = {
                user_info: userInfo
            }
            toast.promise(
                (async () => {
                    if (interviewWsRef.current) {
                        await interviewWsRef.current.configure(config)
                        startRecording()
                    }
                })(),
                { loading: 'Starting Interview...', success: 'Interview Started', error: 'Failed to start interview' }
            )
        } catch (error) {
            console.error("Error configuring UPSC interview:", error)
        }
    }

    const startRecording = async () => {
        try {
            if (interviewWsRef.current) {
                await interviewWsRef.current.startRecording()
                setIsRecording(true)
            }
        } catch (error) {
            console.error("Failed to start recording:", error)
        }
    }

    const toggleRecording = () => {
        if (interviewWsRef.current) {
            if (isRecording) {
                interviewWsRef.current.stopRecording()
                setIsRecording(false)
            } else {
                startRecording()
            }
        }
    }

    const toggleMicrophone = () => {
        if (interviewWsRef.current && isRecording) {
            if (isMicMuted) {
                // Unmute - resume sending audio
                interviewWsRef.current.resumeAudio()
                setIsMicMuted(false)
            } else {
                // Mute - pause sending audio
                interviewWsRef.current.pauseAudio()
                setIsMicMuted(true)
            }
        }
    }

    const toggleInputMethod = () => {
        setIsUsingText(!isUsingText)
    }

    const submitTextAnswer = () => {
        if (interviewWsRef.current && textAnswer.trim()) {
            interviewWsRef.current.submitTextAnswer(textAnswer)
            toast.success("Answer submitted!")
            setTextAnswer("")
        }
    }

    const requestSummary = () => {
        toast.promise((async () => {
            if (interviewWsRef.current) {
                setIsSummaryLoading(true)
                setSummaryError(null)

                // Set a timeout to detect if summary doesn't arrive in a reasonable time
                const timeoutId = setTimeout(() => {
                    if (isSummaryLoading) {
                        setSummaryError("Summary request timed out. Please try again.")
                        setIsSummaryLoading(false)
                    }
                }, 10000) // 10 seconds timeout

                interviewWsRef.current.requestSummary()

                // Return a cleanup function to clear the timeout if component unmounts
                return () => clearTimeout(timeoutId)
            }
        })(), { loading: 'Requesting Summary...', success: 'Summary Requested', error: 'Failed to request summary' })
    }

    const endInterview = () => {
        if (interviewWsRef.current) {
            setIsSummaryLoading(true)
            setSummaryError(null)

            // First request the summary
            interviewWsRef.current.requestSummary()

            // Set a timeout to detect if summary doesn't arrive in a reasonable time
            const timeoutId = setTimeout(() => {
                if (isSummaryLoading) {
                    setSummaryError("Summary request timed out. Please try again.")
                    setIsSummaryLoading(false)
                }
            }, 15000) // 15 seconds timeout

            // Only end the interview after a short delay to ensure the summary request is processed
            setTimeout(() => {
                interviewWsRef.current?.endInterview()
            }, 1000)
        }
    }

    const toggleChat = () => {
        setShowChat(!showChat)
        setShowParticipants(false)
    }

    const toggleParticipants = () => {
        setShowParticipants(!showParticipants)
        setShowChat(false)
    }

    const handleContinueInterview = () => {
        setShowSummaryView(false)
        if (interviewWsRef.current && !isRecording) {
            startRecording()
        }
    }

    const handleStartNewInterview = () => {
        setShowSummaryView(false)
        setInterviewComplete(false)
        setSummary(null)
        setQuestions([])
        setCurrentQuestion(null)
        setIsConfigured(false)
    }

    const toggleWebcam = () => {
        setWebcamEnabled(!webcamEnabled)
    }

    // Summary view
    if (showSummaryView && summary) {
        console.log("Rendering summary view with data:", summary)
        return (
            <Result summaryData={summary} onContinue={handleContinueInterview} onNewInterview={handleStartNewInterview} />
        )
    }

    if (!isConfigured) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16"
            >
                <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                            UPSC Interview Simulator
                        </h1>
                        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                            Practice your UPSC interview skills with our AI-powered simulation that replicates the real interview experience
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl h-full">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-green-400">Personal Information</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Enter your details to customize the interview experience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-300">
                                                Full Name <span className="text-red-400">*</span>
                                            </label>
                                            <Input
                                                id="name"
                                                value={userInfo.name}
                                                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                                className="bg-gray-900/70 border-gray-700 text-white"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="education" className="text-sm font-medium text-gray-300">
                                                Educational Background <span className="text-red-400">*</span>
                                            </label>
                                            <Input
                                                id="education"
                                                value={userInfo.education}
                                                onChange={(e) => setUserInfo({ ...userInfo, education: e.target.value })}
                                                className="bg-gray-900/70 border-gray-700 text-white"
                                                placeholder="Your highest degree"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="hobbies" className="text-sm font-medium text-gray-300">
                                                Hobbies & Interests
                                            </label>
                                            <Input
                                                id="hobbies"
                                                value={userInfo.hobbies}
                                                onChange={(e) => setUserInfo({ ...userInfo, hobbies: e.target.value })}
                                                className="bg-gray-900/70 border-gray-700 text-white"
                                                placeholder="Reading, sports, music, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="achievements" className="text-sm font-medium text-gray-300">
                                                Achievements
                                            </label>
                                            <Input
                                                id="achievements"
                                                value={userInfo.achievements}
                                                onChange={(e) => setUserInfo({ ...userInfo, achievements: e.target.value })}
                                                className="bg-gray-900/70 border-gray-700 text-white"
                                                placeholder="Awards, recognitions, etc."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="background" className="text-sm font-medium text-gray-300">
                                            Professional Background
                                        </label>
                                        <Textarea
                                            id="background"
                                            value={userInfo.background}
                                            onChange={(e) => setUserInfo({ ...userInfo, background: e.target.value })}
                                            className="bg-gray-900/70 border-gray-700 text-white min-h-[100px]"
                                            placeholder="Brief description of your work experience"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="optional-info" className="text-sm font-medium text-gray-300">
                                            Optional Information
                                        </label>
                                        <Textarea
                                            id="optional-info"
                                            value={userInfo.optional_info}
                                            onChange={(e) => setUserInfo({ ...userInfo, optional_info: e.target.value })}
                                            className="bg-gray-900/70 border-gray-700 text-white min-h-[100px]"
                                            placeholder="Service preferences, state cadre, areas of interest, etc."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-6"
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-green-400">Interview System</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        How our UPSC interview simulator works
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                                        <div className="bg-green-900/30 rounded-full p-2">
                                            <Mic className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-300">Voice Recognition</h3>
                                            <p className="text-sm text-gray-400">Speak naturally as you would in a real interview</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                                        <div className="bg-green-900/30 rounded-full p-2">
                                            <Users className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-300">Expert Panel</h3>
                                            <p className="text-sm text-gray-400">Interact with AI panelists who simulate UPSC board members</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                                        <div className="bg-green-900/30 rounded-full p-2">
                                            <FileText className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-300">Detailed Feedback</h3>
                                            <p className="text-sm text-gray-400">Receive comprehensive analysis of your performance</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                                        <div className="bg-green-900/30 rounded-full p-2">
                                            <Sparkles className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-300">Realistic Scenarios</h3>
                                            <p className="text-sm text-gray-400">Questions adapted to your background and current affairs</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <motion.button
                                        onClick={configureAndStartInterview}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-600/20 transition-all duration-300"
                                    >
                                        Start UPSC Interview
                                    </motion.button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl text-green-400">Tips for Success</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-300">Speak clearly and confidently</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-300">Structure your answers logically</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-300">Stay calm under pressure</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-300">Be honest and authentic</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </main>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden pt-16"
        >
            {/* Global modal for panelist details */}
            <PanelistModal isOpen={modalOpen} onClose={closeModal} panelist={selectedPanelist} />
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                <div className="flex-1 flex flex-col relative h-full">
                    {/* Board members grid */}
                    <div
                        className={cn(
                            "flex-1 p-2 md:p-4 grid gap-3 md:gap-4 overflow-y-auto pb-[160px] md:pb-[120px]",
                            isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3",
                        )}
                    >
                        {/* User's video feed */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col border border-green-600 shadow-lg shadow-green-500/20 col-span-1 md:col-span-2 lg:col-span-1 row-span-2 min-h-[240px]"
                        >
                            <div className="p-3 md:p-4 flex items-center justify-between gap-3 border-b border-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-green-700">
                                        <AvatarImage
                                            src={`/placeholder.svg?height=128&width=128&text=${userInfo.name.charAt(0)}`}
                                            alt="You"
                                        />
                                        <AvatarFallback className="bg-green-800 text-white">{userInfo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h3 className="font-medium text-green-300">{userInfo.name || "You"}</h3>
                                        <p className="text-xs text-gray-400">{userInfo.education || "Candidate"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-900/60 text-green-300 border-green-700">
                                        {audioStatus === "listening" ? "Speaking" : audioStatus === "processing" ? "Processing" : "Ready"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={`
                    ${connectionStatus === "recording"
                                                ? "bg-green-900/60 text-green-300 border-green-700"
                                                : connectionStatus === "processing"
                                                    ? "bg-amber-900/60 text-amber-300 border-amber-700"
                                                    : "bg-gray-900/60 text-gray-300 border-gray-700"
                                            }
                  `}
                                    >
                                        {connectionStatus === "recording" ? "Live" : connectionStatus}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-gray-900/70 flex items-center justify-center">
                                {webcamEnabled ? (
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <User className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                                        <p className="text-gray-400 text-sm">Camera is turned off</p>
                                        <Button
                                            onClick={toggleWebcam}
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 bg-gray-800 hover:bg-gray-700 border-gray-600"
                                        >
                                            Turn on camera
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {boardMembers.length > 0 ? (
                            boardMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className={`bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col relative border ${activePanelist === member.name.toString()
                                        ? "border-green-500 shadow-lg shadow-green-500/20"
                                        : "border-gray-700/50"
                                        } min-h-[180px]`}
                                >
                                    <div className="p-4 md:p-5 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-gray-700">
                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                    <AvatarFallback className="bg-green-800 text-white">{member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium text-lg text-green-300">{member.name}</h3>
                                                    <p className="text-sm text-gray-400">{member.background}</p>
                                                </div>
                                            </div>

                                            <InfoButton member={member} onClick={openPanelistModal} />
                                        </div>

                                        <div className="mt-2 flex-1 flex flex-col justify-between">
                                            <p className="text-gray-300 text-sm line-clamp-3">{member.expertise}</p>

                                            {activePanelist === member.name && (
                                                <div className="mt-3 bg-green-900/30 text-green-300 text-xs px-3 py-1.5 rounded-md border border-green-800/50 flex items-center">
                                                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                                    Currently Speaking
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {activePanelist === member.name && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full flex items-center justify-center h-40">
                                <p className="text-gray-400">Loading board members...</p>
                            </div>
                        )}
                        <div ref={questionEndRef} />
                    </div>

                    {/* Current question - fixed at bottom above controls */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-800/90 backdrop-blur-md p-3 md:p-4 border-t border-gray-700/50 fixed left-0 right-0 bottom-[64px] md:bottom-[72px] z-10"
                    >
                        <div className="w-full max-w-4xl mx-auto">
                            <motion.div
                                animate={
                                    animateResponse
                                        ? {
                                            scale: [1, 1.02, 1],
                                            borderColor: ["rgba(34, 197, 94, 0.5)", "rgba(34, 197, 94, 0.8)", "rgba(34, 197, 94, 0.5)"],
                                        }
                                        : {}
                                }
                                transition={{ duration: 0.5 }}
                                className="bg-gray-900/70 backdrop-blur-md rounded-xl p-3 md:p-4 border border-gray-700/50 shadow-lg"
                            >
                                {currentQuestion ? (
                                    <div className="space-y-2">
                                        <p className="text-gray-200 text-base md:text-lg">{currentQuestion.question}</p>
                                        <QuestionReader question={currentQuestion.question || ""} questionRead={questionRead} setQuestionRead={setQuestionRead} />
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Waiting for the interview to begin...</p>
                                )}
                            </motion.div>

                            {isUsingText && (
                                <div className="mt-3 flex gap-2">
                                    <Textarea
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="flex-1 bg-gray-800 border-gray-700 text-white h-20 md:h-24"
                                        disabled={interviewComplete}
                                    />
                                    <Button
                                        onClick={submitTextAnswer}
                                        disabled={!textAnswer.trim() || interviewComplete}
                                        className="bg-green-700 hover:bg-green-800"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Controls - fixed at bottom */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-black/40 backdrop-blur-md py-3 md:py-4 px-4 md:px-6 flex justify-center items-center gap-3 md:gap-4 border-t border-gray-700/50 fixed bottom-0 left-0 right-0 z-10"
                    >
                        <motion.button
                            onClick={toggleMicrophone}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isMicMuted
                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={!isRecording || interviewComplete}
                            title={isMicMuted ? "Unmute" : "Mute"}
                        >
                            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </motion.button>

                        <motion.button
                            onClick={toggleWebcam}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${webcamEnabled
                                ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={interviewComplete}
                            title={webcamEnabled ? "Turn Off Camera" : "Turn On Camera"}
                        >
                            {webcamEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </motion.button>

                        <motion.button
                            onClick={toggleRecording}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isRecording
                                ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={interviewComplete}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            {isRecording ? <User className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </motion.button>

                        <motion.button
                            onClick={toggleInputMethod}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isUsingText
                                ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={interviewComplete}
                            title="Toggle Text Input"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            onClick={toggleChat}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${showChat
                                ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            title="Show Transcript"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            onClick={toggleParticipants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${showParticipants
                                ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            title="Show Participants"
                        >
                            <Users className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            onClick={endInterview}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 md:p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
                            disabled={interviewComplete || isSummaryLoading}
                            title="End Interview"
                        >
                            <PhoneOff className="w-5 h-5" />
                        </motion.button>

                        {interviewComplete && !summary && (
                            <motion.button
                                onClick={requestSummary}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 md:p-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/30"
                                disabled={isSummaryLoading}
                                title="Request Summary"
                            >
                                <Info className="h-5 w-5" />
                            </motion.button>
                        )}
                    </motion.div>
                </div>

                {/* Side panel */}
                <AnimatePresence>
                    {(showChat || showParticipants) && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full md:max-w-md lg:max-w-sm bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 flex flex-col shadow-xl absolute md:relative inset-0 z-20 md:z-0 pb-[160px] md:pb-[120px]"
                        >
                            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center sticky top-0 bg-gray-800/70 backdrop-blur-md z-10">
                                <h2 className="font-medium text-green-300">{showChat ? "Interview Transcript" : "Board Members"}</h2>
                                <motion.button
                                    onClick={showChat ? toggleChat : toggleParticipants}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 pb-4">
                                {showChat && (
                                    <div className="space-y-3">
                                        {questions.map((q, index) => {
                                            const question = q.question ? String(q.question) : ""
                                            const feedback = q.feedback ? String(q.feedback) : ""

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="rounded-xl p-3 bg-gray-900/50 border border-gray-700/50"
                                                >
                                                    <p className="text-sm font-medium mb-1 text-green-300">Panel :</p>
                                                    <p className="text-gray-200 text-sm">{question}</p>
                                                    {feedback && (
                                                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                                                            <p className="text-xs font-medium text-gray-400">Feedback:</p>
                                                            <p className="text-xs text-gray-300">{feedback}</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>
                                )}

                                {showParticipants && (
                                    <div className="space-y-3">
                                        {boardMembers.map((member, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 + index * 0.1 }}
                                                className={`flex items-center space-x-3 p-3 rounded-lg ${activePanelist === member.name
                                                    ? "bg-green-900/30 border border-green-700/50"
                                                    : "bg-gray-900/50 border border-gray-700/50"
                                                    }`}
                                            >
                                                <Avatar className="h-10 w-10 border border-gray-700">
                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                    <AvatarFallback className="bg-green-800 text-white">{member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-green-300">{member.name}</p>
                                                    <p className="text-xs text-gray-400">{member.background}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {isSummaryLoading && !summary && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-green-700/50 max-w-md w-full mx-4">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                            <p className="text-lg font-medium text-green-300">Generating Interview Summary...</p>
                            <p className="text-sm text-gray-400 text-center">
                                We're analyzing your performance and preparing detailed feedback.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {summaryError && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-red-700/50 max-w-md w-full mx-4">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-red-500/20 text-red-500">
                                <X className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium text-red-300">Error</p>
                            <p className="text-sm text-gray-400 text-center">{summaryError}</p>
                            <Button onClick={() => setSummaryError(null)} className="bg-gray-700 hover:bg-gray-600">
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

