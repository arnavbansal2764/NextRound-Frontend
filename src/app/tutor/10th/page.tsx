"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import { TutorWebSocket } from "@/lib/tutor/10th/tutor-ws"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  MessageSquare,
  RotateCcw,
  BookOpen,
  Send,
  Loader2,
  Lightbulb,
  GraduationCap,
  BookText,
  Brain,
  X,
} from "lucide-react"

export default function NCERTTutor() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [responses, setResponses] = useState<string[]>([])
  const [textQuestion, setTextQuestion] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showChat, setShowChat] = useState<boolean>(true)
  const [animateResponse, setAnimateResponse] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

  const tutorWsRef = useRef<TutorWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const subjects = [
    { id: "all", name: "All Subjects", icon: BookOpen },
    { id: "science", name: "Science", icon: Lightbulb },
    { id: "math", name: "Mathematics", icon: Brain },
    { id: "social", name: "Social Studies", icon: BookText },
    { id: "english", name: "English", icon: GraduationCap },
  ]

  // Initialize tutor WebSocket instance
  useEffect(() => {
    tutorWsRef.current = new TutorWebSocket("wss://ws3.nextround.tech/tutor")

    // Set up event listeners
    tutorWsRef.current.addMessageListener((message) => {
      setResponses((prev) => [...prev, message])
      setAnimateResponse(true)
      setTimeout(() => setAnimateResponse(false), 1000)
    })

    tutorWsRef.current.addStatusChangeListener((status) => {
      setConnectionStatus(status)

      if (status === "connected" || status === "ready") {
        setIsConnected(true)
        setIsLoading(false)
      } else if (status === "disconnected") {
        setIsConnected(false)
        setIsRecording(false)
        setIsLoading(false)
      }
    })

    tutorWsRef.current.addErrorListener((error) => {
      setResponses((prev) => [...prev, `Error: ${error}`])
      setIsLoading(false)
    })

    tutorWsRef.current.addExplanationListener((question, explanation) => {
      // Optional: Add specific handling for explanations beyond the general message listener
    })

    return () => {
      // Cleanup
      if (tutorWsRef.current) {
        tutorWsRef.current.disconnect()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to the bottom when new responses arrive
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
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
      ctx.strokeStyle = "#3b82f6" // Blue color for NCERT theme
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

  const connectToTutor = async () => {
    setIsLoading(true)
    try {
      if (tutorWsRef.current) {
        await tutorWsRef.current.connect()
      }
    } catch (error) {
      console.error("Error connecting to tutor:", error)
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      if (tutorWsRef.current) {
        await tutorWsRef.current.startRecording()
        setIsRecording(true)
      }
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = () => {
    if (tutorWsRef.current) {
      tutorWsRef.current.stopRecording()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const toggleMicrophone = () => {
    if (tutorWsRef.current && isRecording) {
      if (isMicMuted) {
        // Unmute - resume sending audio
        tutorWsRef.current.resumeAudio()
        setIsMicMuted(false)
      } else {
        // Mute - pause sending audio without stopping recording
        tutorWsRef.current.pauseAudio()
        setIsMicMuted(true)
      }
    }
  }

  const sendTextQuestion = () => {
    if (tutorWsRef.current && textQuestion.trim()) {
      tutorWsRef.current.sendTextQuestion(textQuestion)
      // Add the user's question to the responses
      setResponses((prev) => [...prev, `You asked: ${textQuestion}`])
      setTextQuestion("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendTextQuestion()
    }
  }

  const clearResponses = () => {
    setResponses([])
  }

  const disconnect = () => {
    if (tutorWsRef.current) {
      tutorWsRef.current.disconnect()
    }
  }

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
      case "ready":
        return "bg-blue-500"
      case "disconnected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        <main className="flex-1 flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-700/50"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              NCERT 10th Grade Tutor
            </h2>

            {/* What is NCERT Tutor section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Your AI Study Companion</h3>
              <p className="text-gray-300 mb-4">
                Get instant help with your NCERT 10th grade subjects. Ask questions, solve problems, and understand
                difficult concepts with the help of our AI tutor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-center text-sm">Covers all NCERT 10th grade subjects</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Lightbulb className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="text-center text-sm">Clear explanations with examples</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-center text-sm">Voice and text-based questions</p>
                </div>
              </div>
            </motion.div>

            {/* Subjects section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Choose Your Subject</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {subjects.map((subject) => (
                  <motion.button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${subject.id === selectedSubject
                        ? "bg-blue-500/30 border-2 border-blue-500 text-white"
                        : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    <subject.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{subject.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* How it works section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-300">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-gray-300">
                    <span className="font-medium text-blue-300">Connect:</span> Click the connect button to start your
                    tutoring session
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-indigo-400 font-bold">2</span>
                  </div>
                  <p className="text-gray-300">
                    <span className="font-medium text-indigo-300">Ask:</span> Type your question or use voice input
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-purple-400 font-bold">3</span>
                  </div>
                  <p className="text-gray-300">
                    <span className="font-medium text-purple-300">Learn:</span> Get detailed explanations and examples
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tips section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
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
                  <span className="text-blue-400 mr-2">•</span> Be specific with your questions for better answers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span> Mention the chapter or topic for more relevant help
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span> Use voice input for longer or complex questions
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span> Ask for examples if you need more clarity
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={connectToTutor}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting to Tutor...
                  </div>
                ) : (
                  "Connect to Tutor"
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
          {(connectionStatus === "connected" || connectionStatus === "ready") && (
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
        {/* Main tutor area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 flex flex-col relative h-full"
        >
          {/* Subject selector */}
          <div className="p-2 md:p-4 flex flex-wrap gap-2 justify-center">
            {subjects.map((subject) => (
              <motion.button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm ${subject.id === selectedSubject
                    ? "bg-blue-500/30 border border-blue-500 text-white"
                    : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                <subject.icon className="h-4 w-4" />
                <span>{subject.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Tutor avatar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-1 p-2 md:p-4 flex items-center justify-center"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-700/50 shadow-xl min-h-[180px] w-full max-w-md">
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
                NCERT Tutor
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center text-2xl md:text-4xl shadow-lg shadow-blue-500/30">
                AI
              </div>
            </div>
          </motion.div>

          {/* Audio visualizer */}
          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-2">
              <canvas ref={audioVisualizerRef} width="600" height="60" className="w-full max-w-md mx-auto" />
            </motion.div>
          )}

          {/* Text input */}
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
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-3 md:p-4 border border-gray-700/50 shadow-lg relative"
            >
              <textarea
                value={textQuestion}
                onChange={(e) => setTextQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border-none focus:ring-0 text-gray-200 text-sm md:text-base resize-none outline-none"
                placeholder="Type your question here... (Press Enter to send)"
                rows={2}
              ></textarea>
              <motion.button
                onClick={sendTextQuestion}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!textQuestion.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </motion.button>
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
              disabled={!isRecording}
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
            >
              {isRecording ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
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
              onClick={clearResponses}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 md:p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-lg shadow-gray-700/30"
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            <motion.button
              onClick={disconnect}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Chat panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full md:w-80 bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 flex flex-col shadow-xl absolute md:relative inset-0 z-20 md:z-0 pb-[160px]"
            >
              <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="font-medium text-blue-300">Chat History</h2>
                <motion.button
                  onClick={toggleChat}
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
                {responses.length > 0 ? (
                  <div className="space-y-4">
                    {responses.map((response, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-3 ${response.startsWith("You asked:") || response.startsWith("Q:")
                            ? "bg-blue-500/20 border border-blue-500/30 ml-auto max-w-[85%]"
                            : response.startsWith("Error:")
                              ? "bg-red-500/20 border border-red-500/30"
                              : "bg-indigo-500/20 border border-indigo-500/30"
                          }`}
                      >
                        {response.startsWith("You asked:") ? (
                          <>
                            <p className="text-sm font-medium mb-1 text-blue-300">You</p>
                            <p className="text-gray-200 text-sm">{response.substring(10)}</p>
                          </>
                        ) : response.startsWith("Error:") ? (
                          <>
                            <p className="text-sm font-medium mb-1 text-red-300">Error</p>
                            <p className="text-gray-200 text-sm">{response.substring(6)}</p>
                          </>
                        ) : response.startsWith("Q:") ? (
                          <>
                            <p className="text-sm font-medium mb-1 text-blue-300">Question</p>
                            <p className="text-gray-200 text-sm">{response.split("\n\nA:")[0].substring(3)}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium mb-1 text-indigo-300">NCERT Tutor</p>
                            <p className="text-gray-200 text-sm whitespace-pre-wrap">{response}</p>
                          </>
                        )}
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                    <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-2">Ask a question to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}

