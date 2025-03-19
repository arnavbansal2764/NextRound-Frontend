"use client"
import { useEffect, useRef, useState } from "react"
import { HCSWebSocket, type BilingualResponse } from "@/lib/hcs-ws"
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
    Building,
    GraduationCap,
    Scale,
    X,
    LanguagesIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function HCSInterviewAssistant() {
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
    const hcsWsRef = useRef<HCSWebSocket | null>(null)
    const responseEndRef = useRef<HTMLDivElement | null>(null)
    const chatEndRef = useRef<HTMLDivElement | null>(null)
    const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const languageSelectionTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize HCS WebSocket instance
    useEffect(() => {
        hcsWsRef.current = new HCSWebSocket("wss://ws5.nextround.tech/hcs")

        // Set up event listeners
        hcsWsRef.current.addMessageListener((message) => {
            setResponses((prev) => [...prev, message])
            setAnimateResponse(true)
            setTimeout(() => setAnimateResponse(false), 1000)
        })

        hcsWsRef.current.addStatusChangeListener((status) => {
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

        hcsWsRef.current.addErrorListener((error) => {
            // Display errors as responses
            const errorResponse: BilingualResponse = {
                english: `Error: ${error}`,
                hindi: `त्रुटि: ${error}`,
            }
            setResponses((prev) => [...prev, errorResponse])
            setIsLoading(false)
        })

        // Add language prompt listener
        hcsWsRef.current.addLanguagePromptListener((options) => {
            setLanguageOptions(options)
            setShowLanguageSelector(true)
            setIsLanguageSelecting(true)

            // Start the animated language selection process
            animateLanguageSelection()
        })

        return () => {
            // Cleanup
            if (hcsWsRef.current) {
                hcsWsRef.current.disconnect()
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
            ctx.strokeStyle = "#16a34a" // Green color for HCS theme
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
            if (hcsWsRef.current) {
                await hcsWsRef.current.configure({
                    candidate_info: candidateInfo,
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
            if (hcsWsRef.current) {
                await hcsWsRef.current.startRecording()
                setIsRecording(true)
            }
        } catch (error) {
            console.error("Failed to start recording:", error)
        }
    }

    const toggleRecording = () => {
        if (hcsWsRef.current) {
            if (isRecording) {
                hcsWsRef.current.stopRecording()
                setIsRecording(false)
            } else {
                startRecording()
            }
        }
    }

    const toggleMicrophone = () => {
        if (hcsWsRef.current && isRecording) {
            if (isMicMuted) {
                // Unmute - resume sending audio
                hcsWsRef.current.resumeAudio()
                setIsMicMuted(false)
            } else {
                // Mute - pause sending audio without stopping recording
                hcsWsRef.current.pauseAudio()
                setIsMicMuted(true)
            }
        }
    }

    const endInterview = () => {
        // console.log("Showing thank you modal before ending interview")
        setShowThankYouModal(true)
        setInterviewComplete(true)
        setIsRecording(false)
    }

    const finalizeInterview = () => {
        // console.log("Finalizing interview and ending WebSocket connection")
        if (hcsWsRef.current) {
            hcsWsRef.current.endInterview()
        }
    }

    const closeThankYouModal = () => {
        finalizeInterview()
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

    const toggleLanguage = () => {
        const newLanguage = preferredLanguage === "english" ? "hindi" : "english"
        setPreferredLanguage(newLanguage)

        // Send language selection to server if WebSocket is configured
        if (hcsWsRef.current && hcsWsRef.current.configured) {
            hcsWsRef.current.selectLanguage(newLanguage)
        }
    }

    const animateLanguageSelection = () => {
        // Ensure we're using the correct language from options
        if (languageOptions.length > 0) {
            // Check if the currently selected language is in the options
            const normalizedSelected = selectedLanguage.toLowerCase()
            const normalizedOptions = languageOptions.map((opt) => opt.toLowerCase())

            if (!normalizedOptions.includes(normalizedSelected)) {
                // If not, default to the first option
                setSelectedLanguage(languageOptions[0].toLowerCase())
                // console.log(`Selected language not in options, defaulting to: ${languageOptions[0]}`)
            } else {
                // console.log(`Using selected language: ${selectedLanguage}`)
            }
        }

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
                    if (hcsWsRef.current) {
                        // console.log(`Sending language selection: ${selectedLanguage}`)
                        hcsWsRef.current.selectLanguage(selectedLanguage)
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

    const toggleChat = () => {
        setShowChat(!showChat)
        setShowParticipants(false)
    }

    const toggleParticipants = () => {
        setShowParticipants(!showParticipants)
        setShowChat(false)
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
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                            HCS Interview Preparation
                        </h2>

                        {/* What is HCS Interview section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center text-green-300">What is an HCS Interview?</h3>
                            <p className="text-gray-300 mb-4">
                                The Haryana Civil Service (HCS) interview is a critical stage in the selection process for
                                administrative positions in Haryana. It evaluates your personality, knowledge, and suitability for civil
                                service roles.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <Building className="h-5 w-5 text-green-400" />
                                    </div>
                                    <p className="text-center text-sm">Panel of senior officials from Haryana administration</p>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <GraduationCap className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <p className="text-center text-sm">Questions on Haryana's history, culture, and governance</p>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <Scale className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <p className="text-center text-sm">Assessment of administrative aptitude and ethical judgment</p>
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
                            <h3 className="text-xl font-bold mb-4 text-center text-green-300">What to Expect</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-green-400 font-bold">1</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-green-300">Personal Background:</span> Questions about your
                                        education, family, and motivation for civil service
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-emerald-400 font-bold">2</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-emerald-300">Haryana Knowledge:</span> Questions about state
                                        history, geography, economy, and current issues
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-teal-400 font-bold">3</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-teal-300">Administrative Scenarios:</span> Hypothetical situations
                                        to test your decision-making abilities
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-cyan-400 font-bold">4</span>
                                    </div>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-cyan-300">Current Affairs:</span> Questions on national and
                                        international events relevant to Haryana
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
                            <h3 className="text-xl font-bold mb-4 text-center text-green-300">Interview Language</h3>
                            <p className="text-gray-300 mb-4 text-center">Select your preferred language for the interview:</p>
                            <div className="flex justify-center space-x-4 mb-2">
                                <button
                                    onClick={() => setSelectedLanguage("english")}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedLanguage === "english"
                                            ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                        }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedLanguage("hindi") 
                                        setPreferredLanguage("hindi")
                                    }}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedLanguage === "hindi"
                                            ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
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
                            <h3 className="text-xl font-bold mb-4 text-center text-green-300">Your Information</h3>
                            <p className="text-gray-300 mb-4">
                                Provide details about yourself to help tailor the HCS interview questions to your profile. Include
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
                                    <p className="text-sm text-gray-300">• Your district in Haryana and local knowledge</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                    <p className="text-sm text-gray-300">• Areas of interest in administration</p>
                                </div>
                            </div>
                            <textarea
                                value={candidateInfo}
                                onChange={(e) => setCandidateInfo(e.target.value)}
                                className="w-full h-40 p-4 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white resize-none"
                                placeholder="Enter your background information here (education, career, district, etc.)"
                            ></textarea>
                        </motion.div>

                        {/* Tips section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="bg-green-500/10 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-green-500/20 mb-6"
                        >
                            <h3 className="text-lg font-bold mb-2 text-green-300 flex items-center">
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
                                    <span className="text-green-400 mr-2">•</span> Demonstrate knowledge of Haryana's unique challenges
                                    and opportunities
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span> Be prepared to answer questions in both English and
                                    Hindi
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span> Show awareness of recent government initiatives in
                                    Haryana
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span> Maintain a balanced perspective on controversial issues
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
                                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Preparing Interview...
                                    </div>
                                ) : (
                                    "Start HCS Interview"
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
                                HCS Interviewer
                            </div>
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-2xl md:text-4xl shadow-lg shadow-green-500/30">
                                HCS
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
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
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
                                        borderColor: ["rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0.8)", "rgba(16, 185, 129, 0.5)"],
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
                                    ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
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
                                    ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
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
                                    ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
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
                                <h2 className="font-medium text-green-300">{showChat ? "Interview Transcript" : "Participants"}</h2>
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
                                                className={`rounded-xl p-3 ${index % 2 === 0
                                                        ? "bg-green-500/20 border border-green-500/30"
                                                        : "bg-purple-500/20 border border-purple-500/30"
                                                    }`}
                                            >
                                                <p
                                                    className={`text-sm font-medium mb-1 ${index % 2 === 0 ? "text-green-300" : "text-purple-300"}`}
                                                >
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
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-green-500/30">
                                                HCS
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-300">HCS Interviewer</p>
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
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="h-8 w-8 text-green-400" />
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
                                                ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
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
                                    className="h-full bg-green-500"
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
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
                                <p className="text-gray-300 text-center mb-6">
                                    Thank you for participating in the HCS interview. Your responses have been recorded.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-green-300">HCS Interview Tips:</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                    <li>Review Haryana's administrative structure and recent policy initiatives</li>
                                    <li>Practice answering questions about local issues in your district</li>
                                    <li>Develop a balanced perspective on development challenges in Haryana</li>
                                    <li>Improve your bilingual communication skills (English and Hindi)</li>
                                </ul>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        finalizeInterview()
                                        setShowThankYouModal(false)
                                        setIsConfigured(false)
                                        setIsSetupComplete(false)
                                        setResponses([])
                                        setInterviewComplete(false)
                                    }}
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/30 transition-all duration-300"
                                >
                                    Start New Interview
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={closeThankYouModal}
                                    className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
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

