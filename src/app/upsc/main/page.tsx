"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import {
    UPSCInterviewWebSocket,
    type UPSCInterviewConfig,
    type UPSCInterviewResponse,
    type UPSCInterviewSummary,
} from "@/lib/upsc/upsc-prac-ws"
import {
    Mic,
    MessageSquare,
    Users,
    PhoneOff,
    X,
    Info,
    CheckCircle,
    FileText,
    Sparkles,
    Video,
    VideoOff,
    Play,
    Pause,
    Send,
    User,
    RefreshCw,
    HelpCircle,
    Keyboard,
    FileQuestion,
    AlertCircle,
    ChevronLeft,
    Volume2,
    VolumeX,
    Download,
    RotateCw,
    Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface BoardMember {
    name: string
    background: string
    expertise: string
    style: string
    sample_questions: string[]
    avatar?: string
}

// Add a tooltip component near the top of the file, after the BoardMember interface
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
    return (
        <div className="group relative">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50 shadow-lg border border-gray-700">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    )
}

// Add a helper component for onboarding tips
function OnboardingTip({ children, visible = true }: { children: React.ReactNode; visible?: boolean }) {
    if (!visible) return null

    return (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-sm text-blue-200 mb-4 flex items-start gap-2">
            <HelpCircle className="h-5 w-5 shrink-0 mt-0.5 text-blue-400" />
            <div>{children}</div>
        </div>
    )
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-xl w-[95vw] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 shadow-xl m-auto"
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

export default function UPSCInterviewSimulatorOld() {
    const [isRecording, setIsRecording] = useState<boolean>(true)
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
    const [numQuestions, setNumQuestions] = useState<number>(10)
    const [interviewComplete, setInterviewComplete] = useState<boolean>(false)
    const [summary, setSummary] = useState<UPSCInterviewSummary | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
    const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
    const [textAnswer, setTextAnswer] = useState<string>("")
    const [isUsingText, setIsUsingText] = useState<boolean>(false)
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false)
    const [summaryError, setSummaryError] = useState<string | null>(null)

    // New state variables for language support
    const [language, setLanguage] = useState<string>("english")
    const [languageOptions, setLanguageOptions] = useState<string[]>([])
    const [showLanguagePrompt, setShowLanguagePrompt] = useState<boolean>(false)

    // New UI state variables
    const [showChat, setShowChat] = useState<boolean>(false)
    const [showParticipants, setShowParticipants] = useState<boolean>(false)
    const [activePanelist, setActivePanelist] = useState<string | null>(null)
    const [animateResponse, setAnimateResponse] = useState(false)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [selectedPanelist, setSelectedPanelist] = useState<BoardMember | null>(null)

    // Add a new state to track if we're in the end interview flow
    const [isEndingInterview, setIsEndingInterview] = useState<boolean>(false)

    // Add a new state for the raw summary data
    const [rawSummaryData, setRawSummaryData] = useState<any>(null)

    const interviewWsRef = useRef<UPSCInterviewWebSocket | null>(null)
    const questionEndRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const router = useRouter()
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

    // Handle webcam
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
        interviewWsRef.current = new UPSCInterviewWebSocket("wss://ws3.nextround.tech/upsc-main/")

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
            } else if (status === "complete") {
                setInterviewComplete(true)
                setIsRecording(false)
            } else if (status === "disconnected") {
                setIsConfigured(false)
                setIsRecording(false)
            }
        })

        interviewWsRef.current.addErrorListener((error) => {
            console.error("UPSC Interview Error:", error)
        })

        // Update the summary listener to handle different return types
        interviewWsRef.current.addSummaryListener((summaryData) => {
            // Enhanced debug logging
          // console("Received summary data:", summaryData)
          // console("Summary data type:", typeof summaryData)

            // Store raw data for reference regardless of format
            setRawSummaryData(summaryData)

            try {
                let transformedSummary: UPSCInterviewSummary | null = null

                // Case 1: Direct UPSCInterviewSummary format
                if (summaryData && summaryData.scores && summaryData.overall_feedback && Array.isArray(summaryData.questions)) {
                  // console("Format detected: Direct UPSCInterviewSummary")
                    transformedSummary = summaryData as UPSCInterviewSummary
                }

                if (transformedSummary) {
                    setSummary(transformedSummary)

                    // Success notification if we're in the ending flow
                    if (isEndingInterview) {
                        toast.success("Interview summary generated")
                    }
                } else {
                    console.error("Could not transform summary data to expected format:", summaryData)
                    if (isEndingInterview) {
                        toast.error("Summary format not recognized. Displaying raw data.")
                    }
                }
            } catch (error) {
                console.error("Error processing summary data:", error)
                if (isEndingInterview) {
                    toast.error("Error processing summary. Please try again.")
                    setIsEndingInterview(false)
                }
            }

            setIsSummaryLoading(false)
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

        // Add language prompt listener
        interviewWsRef.current.addLanguagePromptListener((options) => {
          // console("Language options received:", options)
            setLanguageOptions(options)
            setShowLanguagePrompt(true)
            // Move to step 3 when language options are received
            setSetupStep(3)
        })

        return () => {
            // Cleanup
            if (interviewWsRef.current) {
                interviewWsRef.current.disconnect()
            }
        }
    }, [])

    // Update the selected language when the interview WebSocket instance updates it
    useEffect(() => {
        if (interviewWsRef.current) {
            const currentLanguage = interviewWsRef.current.getSelectedLanguage()
            if (currentLanguage) {
                setLanguage(currentLanguage)
            }
        }
    }, [connectionStatus]) // Check whenever connection status changes

    // Auto-scroll to the bottom when new questions arrive
    useEffect(() => {
        if (questionEndRef.current) {
            questionEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [questions])

    const configureAndStartInterview = async () => {
        // Validate user info
        if (!userInfo.name.trim() || !userInfo.education.trim()) {
            toast.error("Please provide at least your name and education to start the interview")
            return
        }

        try {
            const config: UPSCInterviewConfig = {
                user_info: userInfo,
                num_questions: numQuestions,
                language: language as "english" | "hindi", // Add language to config
            }

            toast.promise(
                (async () => {
                    if (interviewWsRef.current) {
                        await interviewWsRef.current.configure(config)
                        startRecording()
                    }
                })(),
                { loading: "Starting Interview...", success: "Interview Started", error: "Failed to start interview" },
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

    // Update the toggleRecording function to use better icons and feedback
    const toggleRecording = () => {
        if (interviewWsRef.current) {
            if (isRecording) {
                interviewWsRef.current.stopRecording()
                setIsRecording(false)
                toast.success("Interview paused. Click Play to resume.")
            } else {
                startRecording()
                toast.success("Interview resumed. You can now answer questions.")
            }
        }
    }

    // Update the toggleMicrophone function to provide better feedback
    const toggleMicrophone = () => {
        if (interviewWsRef.current && isRecording) {
            if (isMicMuted) {
                // Unmute - resume sending audio
                interviewWsRef.current.resumeAudio()
                setIsMicMuted(false)
                toast.success("Microphone unmuted. You can now speak.")
            } else {
                // Mute - pause sending audio
                interviewWsRef.current.pauseAudio()
                setIsMicMuted(true)
                toast.success("Microphone muted. Board members won't hear you.")
            }
        } else if (!isRecording) {
            toast.error("Please start the interview first before toggling the microphone.")
        }
    }

    const submitTextAnswer = () => {
        if (interviewWsRef.current && textAnswer.trim()) {
            interviewWsRef.current.submitTextAnswer(textAnswer)
            toast.success("Answer submitted!")
            setTextAnswer("")
        }
    }

    // Update the requestSummary function
    const requestSummary = () => {
        if (!interviewWsRef.current) return

        setIsSummaryLoading(true)
        setSummaryError(null)

        // Set a timeout to detect if summary doesn't arrive in a reasonable time
        const timeoutId = setTimeout(() => {
            if (isSummaryLoading) {
                setSummaryError("Summary request timed out. Please try again.")
                setIsSummaryLoading(false)
                if (isEndingInterview) {
                    setIsEndingInterview(false)
                }
            }
        }, 15000) // 15 seconds timeout

        toast.promise(
            (async () => {
                if (interviewWsRef.current) {
                    interviewWsRef.current.requestSummary()
                    return true // Return a resolved promise
                }
                throw new Error("Interview not initialized")
            })(),
            {
                loading: "Generating interview analysis...",
                success: "Analysis ready",
                error: "Failed to generate analysis",
            },
        )

        // Clear the timeout when the component unmounts
        return () => clearTimeout(timeoutId)
    }

    // Update the endInterview function to start the ending flow
    const endInterview = () => {
        setIsEndingInterview(true)
        // Ensure we stop recording if it's still active
        if (isRecording && interviewWsRef.current) {
            interviewWsRef.current.stopRecording()
            setIsRecording(false)
        }
        // Request the summary
        requestSummary()
    }

    // Add a function to actually end the interview
    const finalizeInterview = () => {
        if (interviewWsRef.current) {
            interviewWsRef.current.endInterview();
            toast.success("Interview ended successfully");

            // Reset all state variables to their initial values
            setIsRecording(false);
            setIsConfigured(false);
            setQuestions([]);
            setCurrentQuestion(null);
            setInterviewComplete(true);

            // Reset user info to empty values
            setUserInfo({
                name: "",
                education: "",
                hobbies: "",
                achievements: "",
                background: "",
                optional_info: "",
            });

            setNumQuestions(10);
            setSummary(null);
            setConnectionStatus("disconnected");
            setBoardMembers([]);
            setIsMicMuted(false);
            setTextAnswer("");
            setIsUsingText(false);
            setIsSummaryLoading(false);
            setSummaryError(null);

            // Reset language settings
            setLanguage("english");
            setLanguageOptions([]);
            setShowLanguagePrompt(false);

            // Reset UI states
            setShowChat(false);
            setShowParticipants(false);
            setActivePanelist(null);
            setAnimateResponse(false);
            setWebcamEnabled(false);
            setModalOpen(false);
            setSelectedPanelist(null);

            // Reset flow control variables
            setIsEndingInterview(false);
            setRawSummaryData(null);

            // Reset setup step
            setSetupStep(1);

            // Navigate back to home/setup page
            router.push('/upsc/main');
        }
    };

    // Handle language selection
    const handleLanguageSelect = (selectedLanguage: string) => {
        if (interviewWsRef.current) {
            toast.promise(
                (async () => {
                    try {
                        // First select the language
                        await interviewWsRef.current!.selectLanguage(selectedLanguage)
                        setLanguage(selectedLanguage)

                        // Explicitly set showLanguagePrompt to false to prevent the loop
                        setShowLanguagePrompt(false)

                        // Configure the interview with the selected language
                        const config: UPSCInterviewConfig = {
                            user_info: userInfo,
                            num_questions: numQuestions,
                            language: selectedLanguage as "english" | "hindi",
                        }



                        // Now start recording after configuration is complete
                        await startRecording()
                        return true
                    } catch (error) {
                        console.error("Error starting interview:", error)
                        throw error
                    }
                })(),
                {
                    loading: "Starting interview...",
                    success: "Interview started!",
                    error: "Failed to start interview",
                },
            )
        }
    }

    // UI helper functions
    const toggleChat = () => {
        setShowChat(!showChat)
        setShowParticipants(false)
    }

    const toggleParticipants = () => {
        setShowParticipants(!showParticipants)
        setShowChat(false)
    }

    const toggleWebcam = () => {
        setWebcamEnabled(!webcamEnabled)
    }

    // Function to open modal with panelist details
    const openPanelistModal = (panelist: BoardMember) => {
        setSelectedPanelist(panelist)
        setModalOpen(true)
    }

    // Function to close modal
    const closeModal = () => {
        setModalOpen(false)
    }

    // Get status message based on current state and language
    const getStatusMessage = () => {
        if (interviewComplete) {
            return language === "hindi"
                ? "इंटरव्यू पूरा हुआ! भाग लेने के लिए धन्यवाद।"
                : "Interview complete! Thank you for participating."
        }

        if (isRecording) {
            if (isMicMuted) {
                return language === "hindi"
                    ? "माइक्रोफोन म्यूट है। जारी रखने के लिए 'माइक अनम्यूट करें' पर क्लिक करें।"
                    : "Microphone muted. Click 'Unmute Mic' to continue."
            }
            return language === "hindi"
                ? "रिकॉर्डिंग चल रही है... प्रश्नों का उत्तर दें और अगले सवालों के लिए प्रतीक्षा करें।"
                : "Recording in progress... Answer the questions from the UPSC board members."
        }

        return language === "hindi"
            ? "इंटरव्यू जारी रखने के लिए 'इंटरव्यू फिर शुरू करें' पर क्लिक करें।"
            : "Click 'Resume Interview' to continue."
    }

    // Setup flow state
    const [setupStep, setSetupStep] = useState<number>(1)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)

    const handleNextStep = () => {
        if (setupStep < 3) {
            setSetupStep(setupStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (setupStep > 1) {
            setSetupStep(setupStep - 1)
        }
    }

    const handleSubmitUserInfo = async () => {
        // Validate user info
        if (!userInfo.name.trim() || !userInfo.education.trim()) {
            toast.error("Please provide at least your name and education to start the interview")
            return
        }

        setIsConnecting(true)
        setConnectionError(null)

        try {
            // Only send user info without language at this point
            const config: UPSCInterviewConfig = {
                user_info: userInfo,
                num_questions: numQuestions,
            }

            if (interviewWsRef.current) {
                await interviewWsRef.current.configure(config)
                // Don't start recording yet - wait for language selection
                setIsConnecting(false)
                // The WebSocket will trigger the language prompt listener
                // which will set showLanguagePrompt to true
            }
        } catch (error) {
            console.error("Error configuring UPSC interview:", error)
            setConnectionError("Failed to connect to the interview server. Please try again.")
            setIsConnecting(false)
        }
    }

    // Add a function to handle connection errors and refresh
    const handleConnectionRefresh = () => {
        if (connectionStatus === "disconnected" || connectionStatus === "error") {
            toast.promise(
                (async () => {
                    // Clean up existing connection
                    if (interviewWsRef.current) {
                        interviewWsRef.current.disconnect()
                    }

                    // Reinitialize WebSocket
                    interviewWsRef.current = new UPSCInterviewWebSocket("wss://ws3.nextround.tech/upsc-main/")

                    // Wait a moment for connection to establish
                    await new Promise((resolve) => setTimeout(resolve, 1000))

                    // Reconfigure if we had already configured before
                    if (userInfo.name) {
                        const config: UPSCInterviewConfig = {
                            user_info: userInfo,
                            num_questions: numQuestions,
                            language: language as "english" | "hindi",
                        }

                        await interviewWsRef.current.configure(config)
                    }

                    return true
                })(),
                {
                    loading: "Reconnecting to interview server...",
                    success: "Connection restored successfully!",
                    error: "Failed to reconnect. Please try again.",
                },
            )
        } else {
            toast.error("Connection is already active.")
        }
    }

    // Update the toggleInputMethod function to provide better feedback
    const toggleInputMethod = () => {
        setIsUsingText(!isUsingText)
        toast.success(
            isUsingText
                ? "Switched to voice input mode. Speak clearly to answer questions."
                : "Switched to text input mode. Type your answers in the text box.",
        )
    }

    // Configuration Screen with multi-step flow
    if (!isConfigured) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto"
            >
                <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-full">
                    {/* Progress indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center w-full max-w-full md:max-w-3xl overflow-x-auto py-2">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div className="relative flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === setupStep
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : step < setupStep
                                                        ? "border-green-500 bg-green-900 text-white"
                                                        : "border-gray-600 bg-gray-800 text-gray-400"
                                                    }`}
                                            >
                                                {step < setupStep ? <CheckCircle className="w-5 h-5" /> : <span>{step}</span>}
                                            </div>
                                            <span
                                                className={`mt-2 text-sm ${step === setupStep
                                                    ? "text-green-400 font-medium"
                                                    : step < setupStep
                                                        ? "text-green-500"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {step === 1 ? "Introduction" : step === 2 ? "Your Details" : "Language"}
                                            </span>
                                        </div>
                                        {step < 3 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${step < setupStep ? "bg-green-500" : "bg-gray-600"}`}></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Introduction */}
                    <AnimatePresence mode="wait">
                        {setupStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-4xl mx-auto"
                            >
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center mb-12"
                                >
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                                        Welcome to the UPSC Interview Simulator
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
                                        Practice your UPSC interview skills with our AI-powered simulation that replicates the real
                                        interview experience
                                    </p>
                                </motion.div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                                    <FeatureCard
                                        icon={<Mic className="h-6 w-6 text-green-400" />}
                                        title="Voice Recognition"
                                        description="Speak naturally as you would in a real interview. Our system understands and processes your responses in real-time."
                                    />
                                    <FeatureCard
                                        icon={<Users className="h-6 w-6 text-green-400" />}
                                        title="Expert Panel"
                                        description="Interact with AI panelists who simulate UPSC board members with diverse backgrounds and expertise."
                                    />
                                    <FeatureCard
                                        icon={<FileText className="h-6 w-6 text-green-400" />}
                                        title="Detailed Feedback"
                                        description="Receive comprehensive analysis of your performance with scores and personalized improvement suggestions."
                                    />
                                    <FeatureCard
                                        icon={<Sparkles className="h-6 w-6 text-green-400" />}
                                        title="Realistic Scenarios"
                                        description="Questions adapted to your background and current affairs, just like in a real UPSC interview."
                                    />
                                </div>

                                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 mb-8">
                                    <h3 className="text-xl text-green-400 font-medium mb-4">Tips for Success</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <motion.button
                                        onClick={handleNextStep}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-600/20 transition-all duration-300"
                                    >
                                        Next: Your Details
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: User Information */}
                        {setupStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-4xl mx-auto"
                            >
                                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-green-400">Candidate Information</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Enter your details to customize the interview experience
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Full Name*:
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="name"
                                                    value={userInfo.name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                                    className="bg-gray-900/70 border-gray-700 text-white"
                                                    placeholder="Your full name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="education" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Educational Background*:
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="education"
                                                    value={userInfo.education}
                                                    onChange={(e) => setUserInfo({ ...userInfo, education: e.target.value })}
                                                    className="bg-gray-900/70 border-gray-700 text-white"
                                                    placeholder="Your highest degree and institution"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="hobbies" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Hobbies & Interests:
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="hobbies"
                                                    value={userInfo.hobbies}
                                                    onChange={(e) => setUserInfo({ ...userInfo, hobbies: e.target.value })}
                                                    className="bg-gray-900/70 border-gray-700 text-white"
                                                    placeholder="Your hobbies and interests"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="achievements" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Achievements:
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="achievements"
                                                    value={userInfo.achievements}
                                                    onChange={(e) => setUserInfo({ ...userInfo, achievements: e.target.value })}
                                                    className="bg-gray-900/70 border-gray-700 text-white"
                                                    placeholder="Notable achievements"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="background" className="block text-sm font-medium text-gray-300 mb-1">
                                                Professional Background:
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
                                            <label htmlFor="optional-info" className="block text-sm font-medium text-gray-300 mb-1">
                                                Optional Information (Service Preferences, State, etc.):
                                            </label>
                                            <Textarea
                                                id="optional-info"
                                                value={userInfo.optional_info}
                                                onChange={(e) => setUserInfo({ ...userInfo, optional_info: e.target.value })}
                                                className="bg-gray-900/70 border-gray-700 text-white min-h-[100px]"
                                                placeholder="Any additional information you'd like to provide"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="num-questions" className="block text-sm font-medium text-gray-300 mb-1">
                                                Number of Questions:
                                            </label>
                                            <Input
                                                type="number"
                                                id="num-questions"
                                                value={numQuestions}
                                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                                min="5"
                                                max="15"
                                                className="bg-gray-900/70 border-gray-700 text-white"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Recommended: 10 questions for a complete interview experience
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t border-gray-700/50 p-6 flex justify-between">
                                        <Button
                                            onClick={handlePrevStep}
                                            variant="outline"
                                            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleSubmitUserInfo}
                                            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600"
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Connecting...
                                                </>
                                            ) : (
                                                "Connect to Interview"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>

                                {connectionError && (
                                    <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                                        <p>{connectionError}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Language Selection */}
                        {setupStep === 3 && showLanguagePrompt && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-2xl mx-auto"
                            >
                                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-800 to-emerald-900 p-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Select Interview Language</h2>
                                        <p className="text-green-300">
                                            Choose the language you're most comfortable with for your interview
                                        </p>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {languageOptions.map((option, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.2 }}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleLanguageSelect(option.toLowerCase())}
                                                    className="bg-gray-900/70 border border-gray-700 hover:border-green-500 rounded-xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
                                                        {option.toLowerCase() === "english" ? (
                                                            <span className="text-2xl">🇬🇧</span>
                                                        ) : (
                                                            <span className="text-2xl">🇮🇳</span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-medium text-green-400 mb-2">{option}</h3>
                                                    <p className="text-sm text-gray-300">
                                                        {option.toLowerCase() === "english"
                                                            ? "Conduct your interview in English"
                                                            : "अपना इंटरव्यू हिंदी में करें"}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                                        <p className="text-sm text-gray-400 text-center">You can change the language later if needed</p>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="bg-gray-900 py-4 text-center text-sm text-gray-400 border-t border-gray-800">
                    © 2025 NextRound - UPSC Interview Simulator
                </footer>
            </motion.div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16">

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
                                        {isMicMuted ? "Muted" : isRecording ? "Speaking" : "Ready"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={`
                ${connectionStatus === "ready"
                                                ? "bg-green-900/60 text-green-300 border-green-700"
                                                : connectionStatus === "processing"
                                                    ? "bg-amber-900/60 text-amber-300 border-amber-700"
                                                    : "bg-gray-900/60 text-gray-300 border-gray-700"
                                            }
              `}
                                    >
                                        {connectionStatus === "ready" ? "Live" : connectionStatus}
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
                                    className={`bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col relative border ${activePanelist === member.name
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
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Waiting for the interview to begin...</p>
                                )}
                            </motion.div>
                            {!currentQuestion && (
                                <OnboardingTip visible={!currentQuestion && isConfigured && !interviewComplete}>
                                    <div className="space-y-2">
                                        <p className="font-medium">Welcome to your UPSC Interview Simulation!</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>
                                                Click the <span className="text-green-400 font-medium">Play</span> button to start the interview
                                            </li>
                                            <li>Answer questions clearly and confidently when asked</li>
                                            <li>
                                                Use the <span className="text-green-400 font-medium">Mute</span> button if you need a moment
                                            </li>
                                            <li>Switch to text input if you prefer typing your answers</li>
                                        </ul>
                                    </div>
                                </OnboardingTip>
                            )}

                            {isUsingText && (
                                <div className="mt-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-400">Type your answer below and click Send</p>
                                        <p className="text-xs text-gray-400">{textAnswer.length} characters</p>
                                    </div>
                                    <div className="flex gap-2">
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
                                            className="bg-green-700 hover:bg-green-800 self-stretch"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
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
                        {connectionStatus === "disconnected" && (
                            <Tooltip content="Reconnect to server">
                                <motion.button
                                    onClick={handleConnectionRefresh}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 md:p-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/30"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </motion.button>
                            </Tooltip>
                        )}

                        <Tooltip content={isMicMuted ? "Unmute microphone" : "Mute microphone"}>
                            <motion.button
                                onClick={toggleMicrophone}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isMicMuted
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                                    : "bg-green-600 hover:bg-green-700 shadow-green-600/30"
                                    }`}
                                disabled={!isRecording || interviewComplete}
                            >
                                {isMicMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </motion.button>
                        </Tooltip>

                        <Tooltip content={webcamEnabled ? "Turn off camera" : "Turn on camera"}>
                            <motion.button
                                onClick={toggleWebcam}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${webcamEnabled
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                    }`}
                                disabled={interviewComplete}
                            >
                                {webcamEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </motion.button>
                        </Tooltip>

                        <Tooltip content={isRecording ? "Pause interview" : "Resume interview"}>
                            <motion.button
                                onClick={toggleRecording}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isRecording
                                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                                    : "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                                    }`}
                                disabled={interviewComplete}
                            >
                                {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </motion.button>
                        </Tooltip>

                        <Tooltip content={isUsingText ? "Switch to voice input" : "Switch to text input"}>
                            <motion.button
                                onClick={toggleInputMethod}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${isUsingText
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                    }`}
                                disabled={interviewComplete}
                            >
                                {isUsingText ? <Mic className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
                            </motion.button>
                        </Tooltip>

                        <Tooltip content="View transcript">
                            <motion.button
                                onClick={toggleChat}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${showChat
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                    }`}
                            >
                                <FileQuestion className="w-5 h-5" />
                            </motion.button>
                        </Tooltip>

                        <Tooltip content="View panel members">
                            <motion.button
                                onClick={toggleParticipants}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg ${showParticipants
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                            </motion.button>
                        </Tooltip>

                        <Tooltip content="End interview & get summary">
                            <motion.button
                                onClick={endInterview}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 md:p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
                                disabled={interviewComplete || isSummaryLoading}
                            >
                                <PhoneOff className="w-5 h-5" />
                            </motion.button>
                        </Tooltip>
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

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="rounded-xl p-3 bg-gray-900/50 border border-gray-700/50"
                                                >
                                                    <p className="text-sm font-medium mb-1 text-green-300">Panel:</p>
                                                    <p className="text-gray-200 text-sm">{question}</p>

                                                </motion.div>
                                            )
                                        })}
                                        <div ref={questionEndRef} />
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

            <PanelistModal isOpen={modalOpen} onClose={closeModal} panelist={selectedPanelist} />
            {(summary || rawSummaryData) && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 rounded-xl w-[95%] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 shadow-xl my-2 md:my-[5vh] mx-auto"
                    >
                        <div className="bg-gradient-to-r from-emerald-900 to-green-800 p-3 md:p-5">
                            <h2 className="text-xl md:text-2xl font-bold text-white">UPSC Interview Summary</h2>
                            <p className="text-sm md:text-base text-green-300">Performance Analysis & Feedback</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 md:space-y-5">
                            {/* User Information Section */}
                            {rawSummaryData && rawSummaryData.user_info && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-gray-800/70 rounded-xl p-5 border border-gray-700"
                                >
                                    <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">
                                        Candidate Profile
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-16 w-16 border-2 border-green-700">
                                                <AvatarImage
                                                    src={`/placeholder.svg?height=128&width=128&text=${rawSummaryData.user_info.name.charAt(0)}`}
                                                    alt={rawSummaryData.user_info.name}
                                                />
                                                <AvatarFallback className="bg-green-800 text-white">
                                                    {rawSummaryData.user_info.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="text-xl font-medium text-green-300">{rawSummaryData.user_info.name}</h4>
                                                <p className="text-gray-400">{rawSummaryData.user_info.education}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {rawSummaryData.user_info.hobbies && (
                                                <p className="text-gray-300">
                                                    <span className="text-green-400 font-medium">Hobbies:</span>{" "}
                                                    {rawSummaryData.user_info.hobbies}
                                                </p>
                                            )}
                                            {rawSummaryData.user_info.achievements && (
                                                <p className="text-gray-300">
                                                    <span className="text-green-400 font-medium">Achievements:</span>{" "}
                                                    {rawSummaryData.user_info.achievements}
                                                </p>
                                            )}
                                            {rawSummaryData.user_info.background && (
                                                <p className="text-gray-300">
                                                    <span className="text-green-400 font-medium">Background:</span>{" "}
                                                    {rawSummaryData.user_info.background}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Interview Statistics */}
                            {rawSummaryData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4"
                                >
                                    <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                        <p className="text-xs md:text-sm text-gray-400 mb-1">Questions</p>
                                        <p className="text-lg md:text-xl font-bold text-green-400">
                                            {rawSummaryData.total_questions} / {rawSummaryData.total_questions}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                        <p className="text-xs md:text-sm text-gray-400 mb-1">Board Members</p>
                                        <p className="text-lg md:text-xl font-bold text-green-400">
                                            {rawSummaryData.board_members?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                        <p className="text-xs md:text-sm text-gray-400 mb-1">Status</p>
                                        <p className="text-lg md:text-xl font-bold text-green-400">Complete</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Board Members Section */}
                            {rawSummaryData && rawSummaryData.board_members && rawSummaryData.board_members.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-800/70 rounded-xl p-5 border border-gray-700"
                                >
                                    <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">
                                        Interview Panel
                                    </h3>
                                    <div className="space-y-4">
                                        {rawSummaryData.board_members.map((member: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + index * 0.1 }}
                                                className="bg-gray-900/70 p-4 rounded-lg border border-gray-700"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-12 w-12 border-2 border-gray-700">
                                                        <AvatarImage
                                                            src={`/placeholder.svg?height=128&width=128&text=${member.name.charAt(0)}`}
                                                            alt={member.name}
                                                        />
                                                        <AvatarFallback className="bg-green-800 text-white">{member.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-2 flex-1">
                                                        <h4 className="font-medium text-green-300">{member.name}</h4>
                                                        <p className="text-sm text-gray-300">{member.background}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700">
                                                                {member.expertise}
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
                                                                {member.style}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Conversation Section */}
                            {rawSummaryData && rawSummaryData.conversation && rawSummaryData.conversation.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gray-800/70 rounded-xl p-5 border border-gray-700"
                                >
                                    <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">
                                        Interview Transcript
                                    </h3>
                                    <div className="space-y-4">
                                        {rawSummaryData.conversation.map((item: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 + index * 0.2 }}
                                                className="bg-gray-900/70 p-4 rounded-lg border border-gray-700"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-green-900/50 rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-1">
                                                        <span className="text-sm font-medium text-green-300">{index + 1}</span>
                                                    </div>
                                                    <div className="space-y-3 w-full">
                                                        <div>
                                                            <p className="font-medium text-green-300">
                                                                {typeof item.board_member === "object"
                                                                    ? item.board_member.name
                                                                    : item.board_member || "Board Member"}
                                                                :
                                                            </p>
                                                            <p className="text-gray-200 mt-1">{item.question}</p>
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-700/50">
                                                            <p className="font-medium text-blue-300">Your Answer:</p>
                                                            <p className="text-gray-300 mt-1">{item.answer || "No answer recorded"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {/* Original Summary Display (fallback) */}
                            {summary && !rawSummaryData && (
                                <>
                                    {summary.scores && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                            <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                                <p className="text-xs md:text-sm text-gray-400 mb-1">Communication</p>
                                                <p className="text-xl md:text-3xl font-bold text-green-400">
                                                    {summary.scores.communication}/10
                                                </p>
                                            </div>
                                            <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                                <p className="text-xs md:text-sm text-gray-400 mb-1">Knowledge</p>
                                                <p className="text-xl md:text-3xl font-bold text-green-400">{summary.scores.knowledge}/10</p>
                                            </div>
                                            <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                                <p className="text-xs md:text-sm text-gray-400 mb-1">Presence</p>
                                                <p className="text-xl md:text-3xl font-bold text-green-400">{summary.scores.presence}/10</p>
                                            </div>
                                            <div className="bg-gray-800/70 p-3 md:p-4 rounded-xl border border-gray-700 text-center">
                                                <p className="text-xs md:text-sm text-gray-400 mb-1">Overall</p>
                                                <p className="text-xl md:text-3xl font-bold text-green-400">{summary.scores.overall}/10</p>
                                            </div>
                                        </div>
                                    )}

                                    {summary.overall_feedback && (
                                        <div className="bg-gray-800/70 rounded-xl p-5 border border-gray-700">
                                            <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">
                                                Overall Feedback
                                            </h3>
                                            <p className="text-gray-200 whitespace-pre-wrap">{summary.overall_feedback}</p>
                                        </div>
                                    )}

                                    {summary.questions && Array.isArray(summary.questions) && summary.questions.length > 0 && (
                                        <div className="bg-gray-800/70 rounded-xl p-5 border border-gray-700">
                                            <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-3">
                                                Question & Answer Review
                                            </h3>
                                            <div className="space-y-4">
                                                {summary.questions.map((item, index) => (
                                                    <div key={index} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-green-900/50 rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-1">
                                                                <span className="text-sm font-medium text-green-300">{index + 1}</span>
                                                            </div>
                                                            <div className="space-y-3 w-full">
                                                                <div>
                                                                    <p className="font-medium text-green-300">{item.board_member || "Board Member"}:</p>
                                                                    <p className="text-gray-200 mt-1">{item.question || "No question recorded"}</p>
                                                                </div>
                                                                <div className="pt-2 border-t border-gray-700/50">
                                                                    <p className="font-medium text-blue-300">Your Answer:</p>
                                                                    <p className="text-gray-300 mt-1">{item.answer || "No answer recorded"}</p>
                                                                </div>
                                                                {item.feedback && (
                                                                    <div className="pt-2 border-t border-gray-700/50">
                                                                        <p className="font-medium text-amber-300">Feedback:</p>
                                                                        <p className="text-gray-300 mt-1">{item.feedback}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Update the summary modal buttons based on whether we're in the ending flow */}
                        <div className="p-5 border-t border-gray-800 flex flex-col sm:flex-row gap-3">
                            {isEndingInterview ? (
                                <Button
                                    className="flex-1 bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-white py-5 text-lg"
                                    onClick={finalizeInterview}
                                >
                                    <Download className="mr-2 h-5 w-5" /> Save & End Interview
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-white py-5 text-lg"
                                        onClick={() => {
                                            setSummary(null)
                                            setRawSummaryData(null)
                                        }}
                                    >
                                        <ChevronLeft className="mr-2 h-5 w-5" /> Return to Interview
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-5 text-lg"
                                        onClick={() => {
                                            setSummary(null)
                                            setRawSummaryData(null)
                                            setIsConfigured(false)
                                            setQuestions([])
                                            setCurrentQuestion(null)
                                            setInterviewComplete(false)
                                        }}
                                    >
                                        <RotateCw className="mr-2 h-5 w-5" /> Start New Interview
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
            {isSummaryLoading && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-auto border border-gray-700 shadow-xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                                <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-400 h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-medium text-green-400 mb-2">Generating Interview Summary</h3>
                            <p className="text-gray-300 mb-4">Please wait while we analyze your performance...</p>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full animate-pulse" style={{ width: "60%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-4 border border-gray-700">
                <div className="flex items-center gap-3">
                    {connectionStatus === "disconnected" ? (
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    ) : isRecording ? (
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse shrink-0" />
                    ) : (
                        <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                    )}
                    <p className="text-sm text-gray-300">
                        {connectionStatus === "disconnected" ? "Disconnected from server" : getStatusMessage()}
                    </p>
                </div>
            </div>
        </div>
    )
}