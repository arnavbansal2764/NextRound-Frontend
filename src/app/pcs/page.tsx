"use client"
import { useEffect, useRef, useState } from "react"
import { PCSWebSocket, type BilingualResponse } from "@/lib/pcs-ws"
import {
    Mic,
    MicOff,
    MessageSquare,
    Users,
    PhoneOff,
    Globe,
    Play,
    Pause,
    RotateCcw,
    CheckCircle,
    Loader2,
    User,
    X,
    LanguagesIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function PCSInterview() {
    // Setup and configuration states
    const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false)
    const [candidateInfo, setCandidateInfo] = useState<string>("")
    const [selectedLanguage, setSelectedLanguage] = useState<string>("english")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Interview states
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [isConfigured, setIsConfigured] = useState<boolean>(false)
    const [responses, setResponses] = useState<BilingualResponse[]>([])
    const [interviewComplete, setInterviewComplete] = useState<boolean>(false)
    const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
    const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
    const [preferredLanguage, setPreferredLanguage] = useState<string>("english")
    const [showChat, setShowChat] = useState<boolean>(false)
    const [showParticipants, setShowParticipants] = useState<boolean>(false)
    const [animateResponse, setAnimateResponse] = useState(false)
    const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false)

    // Language selection animation states
    const [showLanguageSelector, setShowLanguageSelector] = useState<boolean>(false)
    const [languageOptions, setLanguageOptions] = useState<string[]>([])
    const [languageSelectionProgress, setLanguageSelectionProgress] = useState<number>(0)
    const [languageSelectionComplete, setLanguageSelectionComplete] = useState<boolean>(false)
    const [isLanguageSelecting, setIsLanguageSelecting] = useState<boolean>(false)

    // Refs
    const pcsWsRef = useRef<PCSWebSocket | null>(null)
    const responseEndRef = useRef<HTMLDivElement | null>(null)
    const chatEndRef = useRef<HTMLDivElement | null>(null)
    const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const languageSelectionTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize PCS WebSocket instance
    useEffect(() => {
        pcsWsRef.current = new PCSWebSocket("wss://ws5.nextround.tech/pcs")

        // Set up event listeners
        pcsWsRef.current.addMessageListener((message) => {
            setResponses((prev) => [...prev, message])
            setAnimateResponse(true)
            setTimeout(() => setAnimateResponse(false), 1000)
        })

        pcsWsRef.current.addStatusChangeListener((status) => {
            setConnectionStatus(status)

            if (status === "ready") {
                setIsConfigured(true)
                setIsLoading(false)
                // Auto-start recording when ready
                startRecording()
            } else if (status === "complete") {
                setInterviewComplete(true)
                setIsRecording(false)
                setShowThankYouModal(true)
            } else if (status === "disconnected") {
                setIsConfigured(false)
                setIsRecording(false)
                setIsLoading(false)
            }
        })

        pcsWsRef.current.addErrorListener((error) => {
            // Display errors as responses
            const errorResponse: BilingualResponse = {
                english: `Error: ${error}`,
                hindi: `त्रुटि: ${error}`,
            }
            setResponses((prev) => [...prev, errorResponse])
            setIsLoading(false)
        })

        // Add language prompt listener
        pcsWsRef.current.addLanguagePromptListener((options) => {
            setLanguageOptions(options)
            setShowLanguageSelector(true)
            setIsLanguageSelecting(true)

            // Start the animated language selection process
            animateLanguageSelection()
        })

        return () => {
            // Cleanup
            if (pcsWsRef.current) {
                pcsWsRef.current.disconnect()
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (languageSelectionTimerRef.current) {
                clearTimeout(languageSelectionTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        // Auto-scroll to the bottom when new responses arrive
        if (responseEndRef.current) {
            responseEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [responses])

    // Audio visualizer effect
    useEffect(() => {
        if (!audioVisualizerRef.current || !isRecording || isMicMuted) return

        const canvas = audioVisualizerRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const drawVisualizer = () => {
            const width = canvas.width
            const height = canvas.height

            ctx.clearRect(0, 0, width, height)

            // Draw audio waves (simulated for this demo)
            ctx.beginPath()
            ctx.strokeStyle = "#4f46e5"
            ctx.lineWidth = 2

            const segments = 20
            const segmentWidth = width / segments

            ctx.moveTo(0, height / 2)

            for (let i = 0; i <= segments; i++) {
                const x = i * segmentWidth
                // Generate random heights for the wave effect
                // In a real implementation, this would use actual audio data
                const randomFactor = isRecording && !isMicMuted ? Math.random() * 0.5 + 0.5 : 0.1
                const y = height / 2 + Math.sin(Date.now() * 0.005 + i * 0.5) * height * 0.2 * randomFactor
                ctx.lineTo(x, y)
            }

            ctx.stroke()

            animationFrameRef.current = requestAnimationFrame(drawVisualizer)
        }

        drawVisualizer()

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isRecording, isMicMuted])

    const configureAndStartInterview = async () => {
        if (!candidateInfo.trim()) {
            alert("Please provide candidate information to start the interview")
            return
        }

        setIsLoading(true)
        try {
            if (pcsWsRef.current) {
                await pcsWsRef.current.configure({
                    candidate_info: candidateInfo,
                    language: selectedLanguage as "english" | "hindi",
                })
                // Note: startRecording will be triggered by the "ready" status change
                setIsSetupComplete(true)
            }
        } catch (error) {
            console.error("Error configuring interview:", error)
            setIsLoading(false)
        }
    }

    const startRecording = async () => {
        try {
            if (pcsWsRef.current) {
                await pcsWsRef.current.startRecording()
                setIsRecording(true)
            }
        } catch (error) {
            console.error("Failed to start recording:", error)
        }
    }

    const toggleRecording = () => {
        if (pcsWsRef.current) {
            if (isRecording) {
                pcsWsRef.current.stopRecording()
                setIsRecording(false)
            } else {
                startRecording()
            }
        }
    }

    const toggleMicrophone = () => {
        if (pcsWsRef.current && isRecording) {
            if (isMicMuted) {
                // Unmute - resume sending audio
                pcsWsRef.current.resumeAudio()
                setIsMicMuted(false)
            } else {
                // Mute - pause sending audio without stopping recording
                pcsWsRef.current.pauseAudio()
                setIsMicMuted(true)
            }
        }
    }

    const endInterview = () => {
        // Show the thank you modal first
        setShowThankYouModal(true)
    }

    const finalizeInterview = () => {
        // This function will be called when the user clicks "Close" in the thank you modal
        if (pcsWsRef.current) {
            pcsWsRef.current.endInterview()
        }
        setShowThankYouModal(false)
        // Reset the interview state
        setIsConfigured(false)
        setIsSetupComplete(false)
        setResponses([])
        setInterviewComplete(false)
    }

    const clearResponses = () => {
        setResponses([])
    }

    const handleLanguageSelection = (lang: string) => {
        const normalizedLang = lang.toLowerCase();
        setSelectedLanguage(normalizedLang);
        setPreferredLanguage(normalizedLang);
        
        // If WebSocket is configured, send the language selection
        if (pcsWsRef.current && pcsWsRef.current.configured) {
            try {
                pcsWsRef.current.selectLanguage(normalizedLang);
                // console.log(`Language changed to: ${normalizedLang}`);
            } catch (error) {
                // console.error("Error changing language:", error);
            }
        }
    };

    const toggleLanguage = () => {
        const newLanguage = preferredLanguage === "english" ? "hindi" : "english";
        handleLanguageSelection(newLanguage);
    };

    const animateLanguageSelection = () => {
        // Simulate the language selection animation
        setLanguageSelectionProgress(0)
        setLanguageSelectionComplete(false)

        // Animate progress bar to 100% over 2 seconds
        const startTime = Date.now()
        const duration = 2000 // 2 seconds

        const updateProgress = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min((elapsed / duration) * 100, 100)
            setLanguageSelectionProgress(progress)

            if (progress < 100) {
                requestAnimationFrame(updateProgress)
            } else {
                // When animation completes, show checkmark and send language
                setLanguageSelectionComplete(true)

                // After showing checkmark for a moment, send the language and close modal
                languageSelectionTimerRef.current = setTimeout(() => {
                    if (pcsWsRef.current) {
                        // Make sure we're sending the correct language
                        // console.log("Sending language:", selectedLanguage)
                        pcsWsRef.current.selectLanguage(selectedLanguage)
                    }
                    setShowLanguageSelector(false)
                    setIsLanguageSelecting(false)
                }, 1000)
            }
        }

        requestAnimationFrame(updateProgress)
    }

    const getStatusColor = () => {
        switch (connectionStatus) {
            case "connected":
                return "bg-blue-500"
            case "ready":
                return "bg-green-500"
            case "complete":
                return "bg-purple-500"
            case "disconnected":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    const closeThankYouModal = () => {
        if (pcsWsRef.current) {
            pcsWsRef.current.endInterview()
        }
        setShowThankYouModal(false)
        // Reset the interview state
        setIsConfigured(false)
        setIsSetupComplete(false)
        setResponses([])
        setInterviewComplete(false)
    }

    const toggleChat = () => {
        setShowChat(!showChat)
    }

    const toggleParticipants = () => {
        setShowParticipants(!showParticipants)
    }

    if (!isSetupComplete) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16"
            >
                <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-700/50"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            PCS Interview Preparation
                        </h2>

                        {/* What is PCS Interview section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">What is a PCS Interview?</h3>
                            <p className="text-gray-300 mb-4">
                                The Provincial Civil Service (PCS) interview is a crucial stage in the selection process for
                                administrative positions. It assesses your personality, knowledge, and suitability for civil service
                                roles.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <Users className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <p className="text-center text-sm">Panel of senior officials evaluating your responses</p>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <MessageSquare className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <p className="text-center text-sm">Questions on current affairs, governance, and your background</p>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <CheckCircle className="h-5 w-5 text-pink-400" />
                                    </div>
                                    <p className="text-center text-sm">Assessment of communication skills and presence of mind</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* What to expect section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">What to Expect</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-blue-400 font-bold">1</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-blue-300">Introduction Questions:</span> About your education,
                                        background, and motivation for civil service
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-purple-400 font-bold">2</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-purple-300">Domain Knowledge:</span> Questions related to your
                                        educational background and specialization
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-pink-400 font-bold">3</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-pink-300">Current Affairs:</span> Questions on recent events,
                                        government policies, and social issues
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-emerald-400 font-bold">4</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-emerald-300">Situational Questions:</span> Hypothetical scenarios
                                        to test your decision-making abilities
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Language Selection */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Interview Language</h3>
                            <p className="text-gray-300 mb-4 text-center">Select your preferred language for the interview:</p>
                            <div className="flex justify-center space-x-4 mb-2">
                                <button
                                    onClick={() => handleLanguageSelection("english")}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        selectedLanguage === "english"
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                    }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => handleLanguageSelection("hindi")}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        selectedLanguage === "hindi"
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                    }`}
                                >
                                    हिंदी (Hindi)
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 text-center">
                                You can change the language during the interview as well.
                            </p>
                        </motion.div>

                        {/* Candidate Information section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Your Information</h3>
                            <p className="text-gray-300 mb-4">
                                Provide details about yourself to help tailor the PCS interview questions to your profile. Include
                                information about:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-sm text-gray-300">• Your educational background and degrees</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-sm text-gray-300">• Work experience and achievements</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-sm text-gray-300">• Home district and state knowledge</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-sm text-gray-300">• Areas of interest and specialization</p>
                                </div>
                            </div>
                            <textarea
                                value={candidateInfo}
                                onChange={(e) => setCandidateInfo(e.target.value)}
                                className="w-full h-40 p-4 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white resize-none"
                                placeholder="Enter your background information here (education, career, district, etc.)"
                            ></textarea>
                        </motion.div>

                        {/* Tips section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-blue-500/10 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-blue-500/20 mb-6"
                        >
                            <h3 className="text-lg font-bold mb-2 text-blue-300 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Pro Tips
                            </h3>
                            <ul className="text-sm text-gray-300 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span> Speak clearly and confidently, maintaining good eye
                                    contact
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span> Take a moment to organize your thoughts before answering
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span> Be honest and authentic in your responses
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span> Support your answers with relevant examples when
                                    possible
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex justify-center"
                        >
                            <motion.button
                                onClick={configureAndStartInterview}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Preparing Interview...
                                    </div>
                                ) : (
                                    "Start PCS Interview"
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </main>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden pt-16 md:pt-24 pb-[160px] md:pb-[200px]"
        >
            {/* Main content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Main interview area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 flex flex-col relative h-full"
                >
                    {/* Participant grid */}
                    <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 overflow-y-auto pb-[40px] md:pb-[40px]">
                        {/* Interviewer */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-700/50 shadow-xl min-h-[180px]"
                        >
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
                                PCS Interviewer
                            </div>
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center text-2xl md:text-4xl">
                                PCS
                            </div>
                        </motion.div>

                        {/* Candidate */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-700/50 shadow-xl min-h-[180px]"
                        >
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
                                You
                            </div>
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 md:w-16 md:h-16" />
                            </div>
                            {isMicMuted && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-red-500 rounded-full p-2 shadow-lg shadow-red-500/30 z-10"
                                >
                                    <MicOff className="w-4 h-4" />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Audio visualizer */}
                    {isRecording && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-2">
                            <canvas ref={audioVisualizerRef} width="600" height="60" className="w-full max-w-md mx-auto" />
                        </motion.div>
                    )}

                    {/* Latest response - fixed at bottom above controls */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-800/50 backdrop-blur-md p-2 md:p-4 border-t border-gray-700/50 fixed left-0 right-0 bottom-[72px] md:bottom-[80px] z-10"
                    >
                        <motion.div
                            animate={
                                animateResponse
                                    ? {
                                        scale: [1, 1.02, 1],
                                        borderColor: ["rgba(59, 130, 246, 0.5)", "rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.5)"],
                                    }
                                    : {}
                            }
                            transition={{ duration: 0.5 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-3 md:p-4 max-h-24 md:max-h-32 overflow-y-auto border border-gray-700/50 shadow-lg"
                        >
                            {responses.length > 0 ? (
                                <p className="text-gray-200 text-sm md:text-base">
                                    {responses[responses.length - 1][preferredLanguage as keyof BilingualResponse]}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic text-sm md:text-base">Waiting for the interview to begin...</p>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Controls - fixed at bottom */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-black/30 backdrop-blur-md py-3 md:py-4 px-4 md:px-6 flex justify-center items-center space-x-2 md:space-x-4 border-t border-gray-700/50 fixed bottom-0 left-0 right-0 z-10"
                    >
                        <motion.button
                            onClick={toggleMicrophone}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${isMicMuted
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={!isRecording || interviewComplete}
                        >
                            {isMicMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                        </motion.button>

                        <motion.button
                            onClick={toggleRecording}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${isRecording
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                            disabled={interviewComplete}
                        >
                            {isRecording ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
                        </motion.button>

                        <motion.button
                            onClick={toggleLanguage}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 md:p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-lg shadow-gray-700/30"
                        >
                            <LanguagesIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>

                        <motion.button
                            onClick={toggleChat}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${showChat
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                        >
                            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>

                        <motion.button
                            onClick={toggleParticipants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${showParticipants
                                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                                    : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                                }`}
                        >
                            <Users className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>

                        <motion.button
                            onClick={clearResponses}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 md:p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-lg shadow-gray-700/30"
                        >
                            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>

                        <motion.button
                            onClick={endInterview}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
                            disabled={interviewComplete}
                        >
                            <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Side panel */}
                <AnimatePresence>
                    {(showChat || showParticipants) && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full md:w-80 bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 flex flex-col shadow-xl absolute md:relative inset-0 z-20 md:z-0 pb-[160px]"
                        >
                            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                                <h2 className="font-medium text-blue-300">{showChat ? "Interview Transcript" : "Participants"}</h2>
                                <motion.button
                                    onClick={showChat ? toggleChat : toggleParticipants}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
                                {showChat && (
                                    <div className="space-y-4">
                                        {responses.map((response, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="rounded-xl p-3 bg-blue-500/20 border border-blue-500/30"
                                            >
                                                <p className="text-sm font-medium mb-1 text-blue-300">
                                                    {index % 2 === 0 ? "Interviewer" : "You"}
                                                </p>
                                                <p className="text-gray-200 text-sm">
                                                    {response[preferredLanguage as keyof BilingualResponse]}
                                                </p>

                                                {/* Show the other language in smaller text */}
                                                {preferredLanguage === "english" && response.hindi && (
                                                    <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700/50">
                                                        <span className="font-medium">हिंदी:</span> {response.hindi}
                                                    </p>
                                                )}
                                                {preferredLanguage === "hindi" && response.english && (
                                                    <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700/50">
                                                        <span className="font-medium">English:</span> {response.english}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                )}

                                {showParticipants && (
                                    <div className="space-y-6">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="flex items-center space-x-4"
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/30">
                                                PCS
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-300">PCS Interviewer</p>
                                                <p className="text-xs text-gray-400">Host • Active</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center space-x-4"
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-purple-500/30">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-purple-300">You</p>
                                                <p className="text-xs text-gray-400">{isMicMuted ? "Microphone muted" : "Active"}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Status indicator */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
                <div
                    className={`px-4 py-2 rounded-full ${getStatusColor()} text-white text-sm font-medium flex items-center gap-2 shadow-lg`}
                >
                    {connectionStatus === "ready" && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                    )}
                    {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </div>
            </div>

            {/* Language selection modal */}
            <AnimatePresence>
                {showLanguageSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-gray-700/50 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="h-8 w-8 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-center mb-2 text-white">Language Selection</h2>
                                <p className="text-gray-300">
                                    {languageOptions.length > 0 &&
                                        `Would you like to conduct this interview in ${languageOptions.join(" or ")}?`}
                                </p>
                            </div>

                            <div className="flex justify-center space-x-4 mb-6">
                                {languageOptions.map((lang, index) => (
                                    <motion.div
                                        key={index}
                                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedLanguage.toLowerCase() === lang.toLowerCase()
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                : "bg-gray-700/50 text-gray-300"
                                            }`}
                                    >
                                        {lang}
                                        {selectedLanguage.toLowerCase() === lang.toLowerCase() && languageSelectionComplete && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mt-2">
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${languageSelectionProgress}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>

                            <p className="text-center text-sm text-gray-400 mt-4">
                                {languageSelectionComplete
                                    ? "Language selected! Continuing with interview..."
                                    : "Selecting language..."}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Thank you modal */}
            <AnimatePresence>
                {showThankYouModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full border border-gray-700/50 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-center mb-4 text-white">Interview Complete</h2>
                            </div>
                            <p className="text-gray-300 text-center mb-6">
                                Thank you for participating in the PCS interview. Your responses have been recorded.
                            </p>
                            <div className="flex flex-col space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30"
                                    onClick={closeThankYouModal}
                                >
                                    Start New Interview
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-lg bg-gray-700 text-white font-medium"
                                    onClick={finalizeInterview}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

