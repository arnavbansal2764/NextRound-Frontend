"use client"
import { useEffect, useRef, useState } from "react"
import { type CSATConfig, CSATWebSocket } from "@/lib/upsc/subject/csat-ws"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  MessageSquare,
  Users,
  PhoneOff,
  GraduationCap,
  Briefcase,
  Trophy,
  Trash2,
  BookOpen,
  User,
  CheckCircle,
  Loader2,
  Globe,
  Languages,
} from "lucide-react"
import QuestionReader from "@/components/interview/screen-reader"

const difficultyLevels = [
  { text: "Easy", icon: GraduationCap },
  { text: "Medium", icon: Briefcase },
  { text: "Hard", icon: Trophy },
]

export default function CSATInterview() {
  const [interviewState, setInterviewState] = useState({
    isRecording: false,
    isConfigured: false,
    isMicMuted: false,
    interviewComplete: false,
    connectionStatus: "disconnected" as "disconnected" | "connected" | "ready" | "complete",
    isLoading: false,
    showThankYouModal: false,
  })

  const [uiState, setUiState] = useState({
    showChat: false,
    showParticipants: false,
    animateResponse: false,
    setupStep: 1, // Add this to track the setup step
  })

  const [responses, setResponses] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [language, setLanguage] = useState<string>("english")
  const [showLanguagePrompt, setShowLanguagePrompt] = useState<boolean>(false)
  const [languageOptions, setLanguageOptions] = useState<string[]>(["English", "Hindi"])
  const [showLanguageAnimation, setShowLanguageAnimation] = useState<boolean>(false)
  const [animatingLanguage, setAnimatingLanguage] = useState<string>("english")
  const csatWsRef = useRef<CSATWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [questionRead, setQuestionRead] = useState<boolean>(false)
  const [currentQuestion,setCurrentQuestion] = useState("")
  // Add these new state variables for user information
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  })

  // Initialize CSAT WebSocket instance
  useEffect(() => {
    const ws = new CSATWebSocket("wss://ws3.nextround.tech/upsc-csat")
    csatWsRef.current = ws

    const handleMessage = (message: string) => {
      setResponses((prev) => [...prev, message])
      if (!message.includes("Would you like to conduct this interview")){
        setCurrentQuestion(message);
      }
      setUiState((prev) => ({ ...prev, animateResponse: true }))
      setTimeout(() => setUiState((prev) => ({ ...prev, animateResponse: false })), 1000)
    }

    const handleStatusChange = (status: string) => {
      setInterviewState((prev) => ({ ...prev, connectionStatus: status as any, isLoading: false }))

      switch (status) {
        case "ready":
          setInterviewState((prev) => ({ ...prev, isConfigured: true }))
          startRecording()
          break
        case "complete":
          setInterviewState((prev) => ({
            ...prev,
            interviewComplete: true,
            isRecording: false,
            showThankYouModal: true,
          }))
          // Remove the automatic reset here
          break
        case "disconnected":
          setInterviewState((prev) => ({
            ...prev,
            isConfigured: false,
            isRecording: false,
            isLoading: false,
          }))
          break
      }
    }

    ws.addMessageListener(handleMessage)
    ws.addStatusChangeListener(handleStatusChange)
    ws.addErrorListener((error) => { 
      setInterviewState((prev) => ({ ...prev, isLoading: false }))
    })
    ws.addLanguagePromptListener((options) => {
    // console("Language selection prompt received with options:", options)
      setLanguageOptions(options)

      // Show the language animation
      setShowLanguageAnimation(true)

      // Set the animating language to the current language
      setAnimatingLanguage(language)

      // After a short delay to show the animation, send the language
      setTimeout(() => {
        if (csatWsRef.current) {
        // console(`Automatically sending language selection: ${language}`)
          try {
            csatWsRef.current.selectLanguage(language)
            // Add a confirmation message to the responses
           
          } catch (error) {
            console.error("Error sending language selection:", error)
           
          }

          // Hide the animation after sending
          setTimeout(() => {
            setShowLanguageAnimation(false)
          }, 1500)
        }
      }, 2000) // Show animation for 2 seconds before sending
    })
    return () => {
      ws.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [language])

  // Audio visualizer effect
  useEffect(() => {
    if (!audioVisualizerRef.current || !interviewState.isRecording || interviewState.isMicMuted) return

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
        const randomFactor = interviewState.isRecording && !interviewState.isMicMuted ? Math.random() * 0.5 + 0.5 : 0.1
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
  }, [interviewState.isRecording, interviewState.isMicMuted])

  useEffect(() => {
    // Auto-scroll to the bottom when new responses arrive
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [responses])

  const configureAndStartInterview = async () => {
    setInterviewState((prev) => ({ ...prev, isLoading: true }))
    try {
      if (!csatWsRef.current) return
      const config: CSATConfig = {
        difficulty: difficulty as "easy" | "medium" | "hard",
        // No user info or language sent in initial config
      }
    // console("Sending initial configuration:", config)
      await csatWsRef.current.configure(config)
    } catch (error) {
      console.error("Error configuring CSAT interview:", error)
      setInterviewState((prev) => ({ ...prev, isLoading: false }))
    }
  }
  // Update the selectLanguage function to log more details and ensure the message is sent
  const selectLanguage = (selectedLanguage: string) => {
    const normalizedLanguage = selectedLanguage.toLowerCase()
    setLanguage(normalizedLanguage)
    setShowLanguagePrompt(false)

    if (csatWsRef.current) {
    // console(`Sending language selection: ${normalizedLanguage}`)
      try {
        csatWsRef.current.selectLanguage(normalizedLanguage)
        // Add a confirmation message to the responses
        
      } catch (error) {
        console.error("Error sending language selection:", error)
        
      }
    } else {
      console.error("WebSocket reference is not available")
      
    }
  }

  // Add this after the useEffect hooks
  useEffect(() => {
    if (showLanguagePrompt && languageOptions.length > 0) {
    // console("Language selection prompt received with options:", languageOptions)
      // The message from backend has already been processed by the WebSocket class
      // and the options are now available in the languageOptions state
    }
  }, [showLanguagePrompt, languageOptions])

  const startRecording = async () => {
    try {
      if (!csatWsRef.current) return

      await csatWsRef.current.startRecording()
      setInterviewState((prev) => ({ ...prev, isRecording: true }))
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const toggleRecording = () => {
    if (!csatWsRef.current) return

    if (interviewState.isRecording) {
      csatWsRef.current.stopRecording()
      setInterviewState((prev) => ({ ...prev, isRecording: false }))
    } else {
      startRecording()
    }
  }

  const toggleMicrophone = () => {
    if (!csatWsRef.current || !interviewState.isRecording) return

    if (interviewState.isMicMuted) {
      csatWsRef.current.resumeAudio()
      setInterviewState((prev) => ({ ...prev, isMicMuted: false }))
    } else {
      csatWsRef.current.pauseAudio()
      setInterviewState((prev) => ({ ...prev, isMicMuted: true }))
    }
  }

  const resetInterview = () => {
    setInterviewState({
      isRecording: false,
      isConfigured: false,
      isMicMuted: false,
      interviewComplete: false,
      connectionStatus: "disconnected",
      isLoading: false,
      showThankYouModal: false,
    })
    setUiState({
      showChat: false,
      showParticipants: false,
      animateResponse: false,
      setupStep: 1,
    })
    setResponses([])
    setShowLanguageAnimation(false)
    if (csatWsRef.current) {
      csatWsRef.current.disconnect()
      csatWsRef.current = new CSATWebSocket("wss://ws3.nextround.tech/upsc-csat")
    }
  }

  const showEndInterviewModal = () => {
    setInterviewState((prev) => ({ ...prev, showThankYouModal: true }))
  }

  const endInterview = () => {
    if (csatWsRef.current) {
      csatWsRef.current.endInterview()
    }
  }

  const clearResponses = () => {
    setResponses([])
  }

  const toggleChat = () =>
    setUiState((prev) => ({
      ...prev,
      showChat: !prev.showChat,
      showParticipants: false,
    }))

  const toggleParticipants = () =>
    setUiState((prev) => ({
      ...prev,
      showParticipants: !prev.showParticipants,
      showChat: false,
    }))

  const handleModalAction = (action: "close" | "new") => {
    if (action === "close") {
      // End the interview when the user clicks "Close"
      endInterview()
    }

    resetInterview()

    if (action === "new") {
      // Additional logic for starting a new interview if needed
      configureAndStartInterview()
    }
  }

  const getStatusColor = () => {
    switch (interviewState.connectionStatus) {
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

  // Function to handle language selection in setup
  const handleSetupLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage.toLowerCase())
  }

  if (!interviewState.isConfigured) {
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
              CSAT Interview Practice
            </h2>

            {uiState.setupStep === 1 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-300">
                    Benefits of CSAT Interview Practice
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-blue-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">Realistic interview simulation with AI-powered questions</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-purple-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">
                        Practice in English or Hindi to improve language proficiency
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-pink-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">
                        Adjustable difficulty levels to match your preparation stage
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-300">What to expect:</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-blue-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">Logical reasoning and analytical ability questions</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-purple-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">Data interpretation and numerical aptitude challenges</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <BookOpen className="h-8 w-8 text-pink-400 mb-2 mx-auto" />
                      <p className="text-center text-sm">Reading comprehension and decision-making scenarios</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center"
                >
                  <motion.button
                    onClick={() => setUiState((prev) => ({ ...prev, setupStep: 2 }))}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300"
                  >
                    Continue to Setup
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Interview Setup</h2>
                  <p className="text-center text-gray-300 mb-4">
                    Configure your CSAT interview settings below. After configuration, you'll be prompted to select your
                    preferred language.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Difficulty Level</h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {difficultyLevels.map((levelItem) => (
                      <motion.button
                        key={levelItem.text}
                        onClick={() => setDifficulty(levelItem.text.toLowerCase() as "easy" | "medium" | "hard")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${levelItem.text.toLowerCase() === difficulty
                            ? "bg-blue-500/30 border-2 border-blue-500 text-white"
                            : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        <levelItem.icon className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">{levelItem.text}</span>
                      </motion.button>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Preferred Language</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {["English", "Hindi"].map((langOption) => (
                      <motion.button
                        key={langOption}
                        onClick={() => handleSetupLanguageChange(langOption)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${langOption.toLowerCase() === language
                            ? "bg-purple-500/30 border-2 border-purple-500 text-white"
                            : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        <Globe className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">{langOption}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between"
                >
                  <motion.button
                    onClick={() => setUiState((prev) => ({ ...prev, setupStep: 1 }))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={configureAndStartInterview}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={interviewState.isLoading}
                    className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {interviewState.isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Preparing Interview...
                      </div>
                    ) : (
                      "Start CSAT Interview"
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
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
          {interviewState.connectionStatus === "ready" && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
          {interviewState.connectionStatus.charAt(0).toUpperCase() + interviewState.connectionStatus.slice(1)}
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
                CSAT Interviewer
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-2xl md:text-4xl shadow-lg shadow-blue-500/30">
                CS
              </div>
            </motion.div>

            {/* You */}
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
              {interviewState.isMicMuted && (
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
          {interviewState.isRecording && (
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
                uiState.animateResponse
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
                <>
                <p className="text-gray-200 text-sm md:text-base">{responses[responses.length - 1]}</p>
                <QuestionReader question={currentQuestion} questionRead={questionRead} setQuestionRead={setQuestionRead} />
                </>
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
              className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${interviewState.isMicMuted
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                  : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                }`}
              disabled={!interviewState.isRecording || interviewState.interviewComplete}
            >
              {interviewState.isMicMuted ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </motion.button>

            <motion.button
              onClick={toggleRecording}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${interviewState.isRecording
                  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                  : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                }`}
              disabled={interviewState.interviewComplete}
            >
              {interviewState.isRecording ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </motion.button>

            <motion.button
              onClick={toggleChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${uiState.showChat
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
              className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg ${uiState.showParticipants
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
              <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            <motion.button
              onClick={showEndInterviewModal}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
              disabled={interviewState.interviewComplete}
            >
              <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Side panel */}
        <AnimatePresence>
          {(uiState.showChat || uiState.showParticipants) && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full md:w-80 bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 flex flex-col shadow-xl absolute md:relative inset-0 z-20 md:z-0 pb-[160px]"
            >
              <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="font-medium text-blue-300">
                  {uiState.showChat ? "Interview Transcript" : "Participants"}
                </h2>
                <motion.button
                  onClick={uiState.showChat ? toggleChat : toggleParticipants}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
                {uiState.showChat && (
                  <div className="space-y-4">
                    {responses
                      // Filter to only show responses at even indices (interviewer responses)
                      .filter((_, index) => index % 2 === 0)
                      // Filter out duplicate responses
                      .filter((response, index, self) => self.findIndex((r) => r === response) === index)
                      .map((response, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-xl p-3 bg-blue-500/20 border border-blue-500/30"
                        >
                          <p className="text-sm font-medium mb-1 text-blue-300">Interviewer</p>
                          <p className="text-gray-200 text-sm">{response}</p>
                        </motion.div>
                      ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {uiState.showParticipants && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/30">
                        CS
                      </div>
                      <div>
                        <p className="font-medium text-blue-300">CSAT Interviewer</p>
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
                        <p className="text-xs text-gray-400">
                          {interviewState.isMicMuted ? "Microphone muted" : "Active"}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interview complete modal */}
      <AnimatePresence>
        {interviewState.showThankYouModal && (
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
                <p className="text-gray-300 text-center mb-6">
                  Thank you for participating in the CSAT practice interview. Your responses have been recorded.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-blue-300">Interview Tips:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li>Review your answers and identify areas for improvement</li>
                  <li>Practice logical reasoning and analytical skills regularly</li>
                  <li>Work on time management for complex questions</li>
                  <li>Develop a structured approach to problem-solving</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalAction("close")}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalAction("new")}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-300"
                >
                  Start New Interview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language selection animation */}
      <AnimatePresence>
        {showLanguageAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 max-w-lg w-full border border-gray-700/50 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Language Selection</h2>
                <p className="text-gray-300 text-center mb-6">
                  Would you like to conduct this interview in English or Hindi?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {languageOptions.map((option) => (
                  <motion.div
                    key={option}
                    className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${option.toLowerCase() === animatingLanguage
                        ? "bg-blue-500/30 border-2 border-blue-500 text-white scale-110"
                        : "bg-gray-700/50 border border-gray-600 text-gray-400"
                      }`}
                  >
                    <Languages
                      className={`h-8 w-8 mb-2 ${option.toLowerCase() === animatingLanguage ? "text-blue-400" : "text-gray-500"}`}
                    />
                    <span className="font-medium">{option}</span>
                    {option.toLowerCase() === animatingLanguage && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-2 bg-blue-500 rounded-full p-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="h-1 bg-blue-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

