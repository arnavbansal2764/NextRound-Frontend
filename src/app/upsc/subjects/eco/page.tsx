"use client"
import { useEffect, useRef, useState } from "react"
import { EcoWebSocket } from "@/lib/upsc/subject/eco-ws"
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
  BarChart,
  TrendingUp,
  LineChart,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react"

const difficultyLevels = [
  { text: "Easy", icon: GraduationCap },
  { text: "Medium", icon: Briefcase },
  { text: "Hard", icon: Trophy },
]

export default function EconomicsInterview() {
  const [interviewState, setInterviewState] = useState({
    isRecording: false,
    isConfigured: false,
    isMicMuted: false,
    interviewComplete: false,
    connectionStatus: "disconnected" as "disconnected" | "connected" | "ready" | "complete",
    isLoading: false,
  })

  const [uiState, setUiState] = useState({
    showChat: false,
    showParticipants: false,
    animateResponse: false,
  })

  const [responses, setResponses] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const ecoWsRef = useRef<EcoWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize Economics WebSocket instance
  useEffect(() => {
    const ws = new EcoWebSocket("wss://ws3.nextround.tech/upsc-economics")
    ecoWsRef.current = ws

    const handleMessage = (message: string) => {
      setResponses((prev) => [...prev, message])
      setUiState((prev) => ({ ...prev, animateResponse: true }))
      setTimeout(() => setUiState((prev) => ({ ...prev, animateResponse: false })), 1000)
    }

    const handleStatusChange = (status: string) => {
      setInterviewState((prev) => ({
        ...prev,
        connectionStatus: status as any,
        isLoading: false,
      }))

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
          }))
          break
        case "disconnected":
          setInterviewState((prev) => ({
            ...prev,
            isConfigured: false,
            isRecording: false,
          }))
          break
      }
    }

    ws.addMessageListener(handleMessage)
    ws.addStatusChangeListener(handleStatusChange)
    ws.addErrorListener((error) => {
      setResponses((prev) => [...prev, `Error: ${error}`])
      setInterviewState((prev) => ({ ...prev, isLoading: false }))
    })

    return () => {
      ws.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

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
      ctx.strokeStyle = "#10b981" // emerald color for economics theme
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
      if (!ecoWsRef.current) return

      await ecoWsRef.current.configure({ difficulty })
    } catch (error) {
      console.error("Error configuring Economics interview:", error)
      setInterviewState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const startRecording = async () => {
    try {
      if (!ecoWsRef.current) return

      await ecoWsRef.current.startRecording()
      setInterviewState((prev) => ({ ...prev, isRecording: true }))
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const toggleRecording = () => {
    if (!ecoWsRef.current) return

    if (interviewState.isRecording) {
      ecoWsRef.current.stopRecording()
      setInterviewState((prev) => ({ ...prev, isRecording: false }))
    } else {
      startRecording()
    }
  }

  const toggleMicrophone = () => {
    if (!ecoWsRef.current || !interviewState.isRecording) return

    if (interviewState.isMicMuted) {
      ecoWsRef.current.resumeAudio()
      setInterviewState((prev) => ({ ...prev, isMicMuted: false }))
    } else {
      ecoWsRef.current.pauseAudio()
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
    })
    setUiState({
      showChat: false,
      showParticipants: false,
      animateResponse: false,
    })
    setResponses([])
    if (ecoWsRef.current) {
      ecoWsRef.current.disconnect()
      ecoWsRef.current = new EcoWebSocket("wss://ws3.nextround.tech/upsc-economics")
    }
  }

  const endInterview = () => {
    if (ecoWsRef.current) {
      ecoWsRef.current.endInterview()
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
        return "bg-emerald-500"
      case "complete":
        return "bg-purple-500"
      case "disconnected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-500">
              Economics Interview Practice
            </h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-300">What to expect:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <BarChart className="h-8 w-8 text-green-400 mb-2 mx-auto" />
                  <p className="text-center text-sm">Microeconomics and macroeconomics concepts</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <TrendingUp className="h-8 w-8 text-emerald-400 mb-2 mx-auto" />
                  <p className="text-center text-sm">Indian economic policies and development</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <LineChart className="h-8 w-8 text-teal-400 mb-2 mx-auto" />
                  <p className="text-center text-sm">International economics and trade relations</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Difficulty Level</h3>
              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map((levelItem) => (
                  <motion.button
                    key={levelItem.text}
                    onClick={() => setDifficulty(levelItem.text.toLowerCase() as "easy" | "medium" | "hard")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${levelItem.text.toLowerCase() === difficulty
                      ? "bg-emerald-500/30 border-2 border-emerald-500 text-white"
                      : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    <levelItem.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{levelItem.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={configureAndStartInterview}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                disabled={interviewState.isLoading}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {interviewState.isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Preparing Interview...
                  </div>
                ) : (
                  "Start Economics Interview"
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
                Economics Interviewer
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-emerald-700 rounded-full flex items-center justify-center text-2xl md:text-4xl shadow-lg shadow-emerald-500/30">
                EC
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
                    borderColor: ["rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0.8)", "rgba(16, 185, 129, 0.5)"],
                  }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-3 md:p-4 max-h-24 md:max-h-32 overflow-y-auto border border-gray-700/50 shadow-lg"
            >
              {responses.length > 0 ? (
                <p className="text-gray-200 text-sm md:text-base">{responses[responses.length - 1]}</p>
              ) : (
                <p className="text-gray-400 italic text-sm md:text-base">
                  Waiting for the economics interview to begin...
                </p>
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
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
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
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
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
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
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
              onClick={endInterview}
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
                      .filter((response, index, self) =>
                        self.findIndex(r => r === response) === index
                      )
                      .map((response, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-xl p-3 bg-blue-500/20 border border-blue-500/30"
                        >
                          <p className="text-sm font-medium mb-1 text-blue-300">
                            Interviewer
                          </p>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-700 rounded-full flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/30">
                        EC
                      </div>
                      <div>
                        <p className="font-medium text-emerald-300">Economics Interviewer</p>
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
        {interviewState.interviewComplete && (
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
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Interview Complete</h2>
                <p className="text-gray-300 text-center mb-6">
                  Thank you for participating in the Economics practice interview. Your responses have been recorded.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-emerald-300">Economics Interview Tips:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li>Explain economic concepts with real-world examples</li>
                  <li>Connect theories to current economic policies</li>
                  <li>Discuss both Indian and global economic perspectives</li>
                  <li>Analyze economic trends with data-driven insights</li>
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
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 transition-all duration-300"
                >
                  Start New Interview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

