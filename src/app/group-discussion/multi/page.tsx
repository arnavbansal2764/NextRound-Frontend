"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  MessageSquare,
  Users,
  PhoneOff,
  Sparkles,
  Brain,
  MessageCircle,
  Lightbulb,
  PenTool,
  FileText,
  Clock,
  Copy,
  UserPlus,
  Plus,
  LogIn,
} from "lucide-react"
import { GroupDiscussionWebSocket, type DiscussionMessage, type GroupDiscussionConfig } from "@/lib/gd/gd-multiple"
import QuestionReader from "@/components/interview/screen-reader"

const topicSuggestions = [
  "Is AI a threat to human jobs?",
  "Should college education be free?",
  "Is remote work better than office work?",
  "Should social media be regulated?",
  "Is nuclear energy the future?",
  "Are cryptocurrencies a good investment?",
  "Should voting be mandatory?",
  "Is space exploration worth the cost?",
]

const features = [
  {
    icon: Brain,
    title: "AI Participants",
    description: "Engage with intelligent AI participants that respond naturally to your points",
  },
  {
    icon: MessageCircle,
    title: "Real-time Transcription",
    description: "Your speech is transcribed in real-time for a seamless discussion experience",
  },
  {
    icon: Lightbulb,
    title: "Insightful Analysis",
    description: "Get a comprehensive summary and analysis of your discussion points",
  },
  {
    icon: UserPlus,
    title: "Multi-User Support",
    description: "Invite others to join your discussion with a simple code",
  },
]

export default function GroupDiscussion() {
  // State management
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [messages, setMessages] = useState<DiscussionMessage[]>([])
  const [topic, setTopic] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [discussionComplete, setDiscussionComplete] = useState<boolean>(false)
  const [summary, setSummary] = useState<string>("")
  const [isAnalysisRequested, setIsAnalysisRequested] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("")
  const [showChat, setShowChat] = useState<boolean>(false)
  const [showParticipants, setShowParticipants] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [currentBotMessage, setCurrentBotMessage] = useState<DiscussionMessage | null>(null)
  const [discussionStage, setDiscussionStage] = useState<"setup" | "active" | "analysis" | "complete">("setup")
  const [joinMode, setJoinMode] = useState<"create" | "join">("create")
  const [discussionCode, setDiscussionCode] = useState<string>("")
  const [inputCode, setInputCode] = useState<string>("")
  const [activeParticipants, setActiveParticipants] = useState<number>(0)
  const [participants, setParticipants] = useState<string[]>([])
  const [codeCopied, setCodeCopied] = useState<boolean>(false)
  const [messageread,setMessageRead] = useState<boolean>(false)
  // Refs
  const gdWsRef = useRef<GroupDiscussionWebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket instance
  useEffect(() => {
    gdWsRef.current = new GroupDiscussionWebSocket("wss://ws3.nextround.tech/gd-multi")

    // Set up event listeners
    gdWsRef.current.addMessageListener((name:any, content:any) => {
      console.log(`Received message from ${name}: ${content}`)
      setMessages((prev) => {
        // Check if the previous message was from the same user
        if (prev.length > 0 && prev[prev.length - 1].name === name) {
          // Create a copy of the previous messages array
          const updatedMessages = [...prev]
          // Get the last message
          const lastMessage = updatedMessages[updatedMessages.length - 1]
          // Update the last message by merging the content
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: `${lastMessage.content} ${content}`,
            timestamp: Date.now(), // Update timestamp to current time
          }
          return updatedMessages
        } else {
          // Add as a new message if it's from a different user
          return [...prev, { name, content, timestamp: Date.now() }]
        }
      })

      // Only update current bot message if it's from a bot or another user
      if (name !== userName && name !== "System") {
        setCurrentBotMessage({ name, content, timestamp: Date.now() })
        setCurrentSpeaker(name)

        // Visual indicator for bot speaking
        setIsSpeaking(true)
        // Clear any existing timer
        if (speakingTimerRef.current) {
          clearTimeout(speakingTimerRef.current)
        }
        // Set timer to clear speaking indicator after 2 seconds
        speakingTimerRef.current = setTimeout(() => {
          setIsSpeaking(false)
          setCurrentSpeaker("")
        }, 2000)
      }
    })

    gdWsRef.current.addStatusChangeListener((status, details) => {
      setConnectionStatus(status)

      if (status === "created" || status === "joined") {
        setIsConfigured(true)
        setDiscussionStage("active")
        setDiscussionCode(details?.code || "")
        if (details?.topic) {
          setTopic(details.topic)
        }
        // Auto-start recording when ready
        startRecording()
      } else if (status === "analyzing") {
        setIsAnalysisRequested(true)
        setDiscussionStage("analysis")
      } else if (status === "disconnected") {
        setIsConfigured(false)
        setIsRecording(false)
      } else if (status === "recording") {
        setIsRecording(true)
        setIsMicMuted(false)
      } else if (status === "muted") {
        setIsMicMuted(true)
      } else if (status === "paused") {
        setIsRecording(false)
      }
    })

    gdWsRef.current.addErrorListener((error) => {
      console.error("GD Error:", error)
      // Add error to messages
      setMessages((prev) => [...prev, { name: "System", content: `Error: ${error}`, timestamp: Date.now() }])
    })

    gdWsRef.current.addParticipantListener((userName, isJoining, activeCount) => {
      const action = isJoining ? "joined" : "left"
      setMessages((prev) => [
        ...prev,
        {
          name: "System",
          content: `${userName} has ${action} the discussion.`,
          timestamp: Date.now(),
        },
      ])
      setActiveParticipants(activeCount)

      // Update participants list
      if (isJoining) {
        setParticipants((prev) => [...prev, userName])
      } else {
        setParticipants((prev) => prev.filter((name) => name !== userName))
      }
    })

    gdWsRef.current.addAnalysisListener((analysis, history) => {
      setSummary(analysis)
      setDiscussionComplete(true)
      setDiscussionStage("complete")
      setIsAnalysisRequested(false)
      if (history) {
        // Add any missing messages from history
        setMessages((prev) => {
          // Create a set of existing message combinations (name+content)
          const existingMessages = new Set(prev.map((m) => `${m.name}:${m.content}`))

          // Filter history to only include messages not already in our state
          const newMessages = history.filter((m) => !existingMessages.has(`${m.name}:${m.content}`))

          return [...prev, ...newMessages]
        })
      }
    })

    return () => {
      // Cleanup timers
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current)
      }

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }

      // Disconnect WebSocket
      if (gdWsRef.current) {
        gdWsRef.current.disconnect()
      }
    }
  }, [userName])

  const configureAndStartDiscussion = async () => {
    if (joinMode === "create" && !topic.trim()) {
      alert("Please provide a topic for the group discussion")
      return
    }

    if (!userName.trim()) {
      alert("Please provide your name")
      return
    }

    if (joinMode === "join" && !inputCode.trim()) {
      alert("Please enter a valid discussion code to join")
      return
    }

    try {
      const config: GroupDiscussionConfig = {
        action: joinMode,
        user_name: userName.trim(),
      }

      // Add topic or code based on mode
      if (joinMode === "create") {
        config.topic = topic.trim()
      } else {
        config.code = inputCode.trim()
      }

      if (gdWsRef.current) {
        await gdWsRef.current.configure(config)
        // Note: startRecording will be triggered by the "ready" status change
      }
    } catch (error) {
      console.error("Error configuring group discussion:", error)
    }
  }

  const startRecording = async () => {
    try {
      if (gdWsRef.current) {
        await gdWsRef.current.startRecording()
        setIsRecording(true)
      }
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const toggleRecording = () => {
    if (gdWsRef.current) {
      if (isRecording) {
        gdWsRef.current.stopRecording()
        setIsRecording(false)
      } else {
        startRecording()
      }
    }
  }

  const toggleMicrophone = () => {
    if (gdWsRef.current && isRecording) {
      if (isMicMuted) {
        // Unmute - resume sending audio
        gdWsRef.current.resumeAudio()
        setIsMicMuted(false)
      } else {
        // Mute - pause sending audio without stopping recording
        gdWsRef.current.pauseAudio()
        setIsMicMuted(true)
      }
    }
  }

  const requestAnalysis = () => {
    if (gdWsRef.current) {
      gdWsRef.current.requestAnalysis()
      setIsAnalysisRequested(true)
      setDiscussionStage("analysis")
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic)
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    setShowParticipants(false)
  }

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants)
    setShowChat(false)
  }

  const copyDiscussionCode = () => {
    if (discussionCode) {
      navigator.clipboard
        .writeText(discussionCode)
        .then(() => {
          setCodeCopied(true)
          if (copyTimerRef.current) {
            clearTimeout(copyTimerRef.current)
          }
          copyTimerRef.current = setTimeout(() => {
            setCodeCopied(false)
          }, 2000)
        })
        .catch((err) => {
          console.error("Could not copy code:", err)
        })
    }
  }

  const getBotColor = (botName: string) => {
    if (botName === "Bot 1") return "bg-blue-100 text-blue-900"
    if (botName === "Bot 2") return "bg-purple-100 text-purple-900"
    if (botName === "Bot 3") return "bg-orange-100 text-orange-900"
    if (botName === "Moderator") return "bg-gray-100 text-gray-800"
    if (botName === "System") return "bg-red-100 text-red-900"
    return "bg-gray-100 text-gray-800"
  }

  const getBotBgColor = (botName: string) => {
    if (botName === "Bot 1") return "from-blue-500/20 to-blue-700/20"
    if (botName === "Bot 2") return "from-purple-500/20 to-purple-700/20"
    if (botName === "Bot 3") return "from-orange-500/20 to-orange-700/20"
    if (botName === "Moderator") return "from-gray-500/20 to-gray-700/20"
    if (botName === "System") return "from-red-500/20 to-red-700/20"
    return "from-gray-500/20 to-gray-700/20"
  }

  const getBotTextColor = (botName: string) => {
    if (botName === "Bot 1") return "text-blue-300"
    if (botName === "Bot 2") return "text-purple-300"
    if (botName === "Bot 3") return "text-orange-300"
    if (botName === "Moderator") return "text-gray-300"
    if (botName === "System") return "text-red-300"
    return "text-gray-300"
  }

  const resetDiscussion = () => {
    setMessages([])
    setDiscussionComplete(false)
    setSummary("")
    setIsAnalysisRequested(false)
    setDiscussionStage("setup")
    setIsConfigured(false)
    setActiveStep(0)
    setTopic("")
    setDiscussionCode("")
    setInputCode("")
    setJoinMode("create")
    setParticipants([])
    setActiveParticipants(0)
  }

  if (discussionStage === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-10"
      >
        

        <main className="flex-1 flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-4xl"
          >
            {/* Join or Create Selection */}
            <div className="mb-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                Welcome to Group Discussion
              </h2>

              <div className="flex space-x-4 w-full max-w-md">
                <motion.button
                  onClick={() => setJoinMode("create")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center ${joinMode === "create"
                      ? "bg-gradient-to-r from-blue-500 to-green-500 shadow-lg shadow-blue-500/20"
                      : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create
                </motion.button>
                <motion.button
                  onClick={() => setJoinMode("join")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center ${joinMode === "join"
                      ? "bg-gradient-to-r from-blue-500 to-green-500 shadow-lg shadow-blue-500/20"
                      : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Join
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {joinMode === "create" ? (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700/50"
                >
                  <div className="mb-6">
                    <label htmlFor="user-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="user-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                      Discussion Topic
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 p-3 bg-gray-900/50 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white"
                        placeholder="Enter a topic for discussion"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 bg-gray-700 rounded-r-lg border-y border-r border-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        <PenTool className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="block text-sm font-medium text-gray-300 mb-3">Or choose from suggestions:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topicSuggestions.map((suggestedTopic, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${topic === suggestedTopic
                              ? "bg-green-500/20 border-green-500 text-green-300"
                              : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                            }`}
                          onClick={() => handleTopicSelect(suggestedTopic)}
                        >
                          {suggestedTopic}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: index * 0.1 + 0.2 },
                        }}
                        className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex items-start"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mr-3 mt-1">
                          <feature.icon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-md font-medium text-white mb-1">{feature.title}</h3>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      onClick={configureAndStartDiscussion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg shadow-blue-500/20 transition-all duration-300"
                      disabled={!userName.trim() || !topic.trim()}
                    >
                      Create & Start Discussion
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="join-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700/50"
                >
                  <div className="mb-6">
                    <label htmlFor="user-name-join" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="user-name-join"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-8">
                    <label htmlFor="discussion-code" className="block text-sm font-medium text-gray-300 mb-2">
                      Discussion Code
                    </label>
                    <input
                      type="text"
                      id="discussion-code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white"
                      placeholder="Enter the discussion code (e.g., ABC123)"
                    />
                  </div>

                  <div className="p-4 bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-700/30 mb-8">
                    <h3 className="text-lg font-medium text-blue-300 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      About Joining a Discussion
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Enter the discussion code provided by the discussion creator. Once you join, you'll be able to
                      participate in the conversation using your microphone. Your speech will be transcribed in
                      real-time for all participants to see.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      onClick={configureAndStartDiscussion}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg shadow-blue-500/20 transition-all duration-300"
                      disabled={!userName.trim() || !inputCode.trim()}
                    >
                      Join Discussion
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

      </motion.div>
    )
  }

  if (discussionStage === "analysis") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-10"
      >
        

        <main className="flex-1 flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50 text-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                transition: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
              className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-t-blue-500 border-r-green-500 border-b-purple-500 border-l-orange-500"
            />

            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
              Analyzing Your Discussion
            </h2>

            <p className="text-gray-300 mb-8">
              Our AI is analyzing the discussion on <span className="text-green-400 font-medium">{topic}</span> and
              preparing a comprehensive summary of the key points and insights.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-blue-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-300">Analyzing discussion duration</p>
                  <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-green-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-300">Processing {messages.length} messages</p>
                  <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex items-center">
                <Lightbulb className="w-5 h-5 mr-3 text-yellow-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-300">Extracting key insights</p>
                  <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-yellow-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 2.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              This may take a moment. Please wait while we generate your discussion summary.
            </p>
          </motion.div>
        </main>

    
      </motion.div>
    )
  }

  if (discussionStage === "complete") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-10"
      >
        

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700/50 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                  Discussion Summary
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Topic:</span>
                  <span className="text-sm font-medium text-green-400">{topic}</span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-blue-700/30 mb-6">
                <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                  Key Insights
                </h3>
                <div className="whitespace-pre-wrap text-gray-300 text-sm">{summary}</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Participants
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-gray-700/50 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 flex items-center justify-center text-lg font-bold mb-2">
                      You
                    </div>
                    <p className="text-sm font-medium text-gray-300">{userName}</p>
                  </div>

                  {participants
                    .filter((name) => name !== userName)
                    .map((participant, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-gray-700/50 flex flex-col items-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center text-lg font-bold mb-2">
                          {participant.substring(0, 1).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-300">{participant}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-gray-700/50">
                <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Discussion Transcript
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className="mb-4 pb-4 border-b border-gray-700/50 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getBotBgColor(msg.name)} flex items-center justify-center text-xs font-bold mr-2`}
                        >
                          {msg.name === userName ? "You" : msg.name.substring(0, 1)}
                        </div>
                        <p className={`text-sm font-medium ${getBotTextColor(msg.name)}`}>
                          {msg.name === userName ? "You" : msg.name}
                        </p>
                        {msg.timestamp && (
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm pl-10">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <motion.button
                  onClick={resetDiscussion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  Start New Discussion
                </motion.button>
              </div>
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
      className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden pt-10"
    >
      <header className="bg-black/30 backdrop-blur-md py-4 px-6 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500 mr-4">
            Group Discussion
          </h1>
          <div className="hidden md:flex items-center space-x-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${isRecording ? (isMicMuted ? "bg-yellow-500" : "bg-green-500 animate-pulse") : "bg-gray-500"
                }`}
            ></span>
            <span className="text-sm text-gray-300">
              {isRecording ? (isMicMuted ? "Mic Muted" : "Recording") : "Paused"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 backdrop-blur-md rounded-full px-3 py-1 border border-gray-700/50">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">{activeParticipants} participants</span>
          </div>

          <div
            className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-md rounded-full px-3 py-1 border border-gray-700/50 cursor-pointer"
            onClick={copyDiscussionCode}
          >
            <span className="text-sm text-gray-300">Code: {discussionCode}</span>
            <Copy className="w-4 h-4 text-gray-400" />
            {codeCopied && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-0 top-full mt-1 bg-green-500 text-white text-xs px-2 py-1 rounded"
              >
                Copied!
              </motion.span>
            )}
          </div>
        </div>

        {isSpeaking && currentSpeaker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm animate-pulse absolute top-16 left-1/2 transform -translate-x-1/2"
          >
            {currentSpeaker} speaking...
          </motion.div>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main discussion area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col relative h-full"
        >
          <div className="flex-1 p-4 overflow-y-auto pb-[120px]">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 p-4 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50"
              >
                <h2 className="font-medium text-lg text-green-400 mb-2">Current Topic: {topic}</h2>
                <p className="text-gray-300 text-sm">
                  {isRecording
                    ? isMicMuted
                      ? "Microphone muted. Click 'Unmute Mic' to continue."
                      : "Discussion in progress... Speak naturally when you want to contribute."
                    : "Click 'Resume Discussion' to continue."}
                </p>
              </motion.div>

              {/* Current bot message */}
              {currentBotMessage && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-6 p-4 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getBotBgColor(currentBotMessage.name)} flex items-center justify-center text-lg font-bold mr-3`}
                    >
                      {currentBotMessage.name.substring(0, 1)}
                    </div>
                    <p className={`font-medium ${getBotTextColor(currentBotMessage.name)}`}>{currentBotMessage.name}</p>
                  </div>
                  <p className="text-gray-300 pl-13">{currentBotMessage.content}</p>
                  <QuestionReader question={currentBotMessage.content} questionRead={messageread} setQuestionRead={setMessageRead}/>
                </motion.div>
              )}

              {/* Participants */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 flex items-center justify-center text-xl font-bold mb-2">
                    You
                  </div>
                  <p className="text-sm font-medium text-gray-300">{userName}</p>
                  <p className="text-xs text-gray-500">{isMicMuted ? "Muted" : "Speaking"}</p>
                </div>

                {participants
                  .filter((name) => name !== userName)
                  .map((participant, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center text-xl font-bold mb-2">
                        {participant.substring(0, 1).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-gray-300">{participant}</p>
                      <p className="text-xs text-gray-500">Participant</p>
                    </div>
                  ))}
              </motion.div>

              {/* Latest messages */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-lg font-medium text-white mb-3">Discussion History</h3>
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No messages yet. Start speaking to contribute to the discussion.
                      </p>
                    ) : (
                      messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (index * 0.05) % 0.5 }}
                          className={`mb-4 ${msg.name === userName ? "text-right" : ""}`}
                        >
                          <div
                            className={`inline-block max-w-3/4 rounded-lg px-4 py-2 ${msg.name === userName
                                ? "bg-green-500/20 border border-green-500/30 text-green-300"
                                : msg.name === "System"
                                  ? "bg-red-500/20 border border-red-500/30 text-red-300"
                                  : "bg-gray-700/50 border border-gray-600/30 text-gray-300"
                              }`}
                          >
                            <div className="flex justify-between items-baseline mb-1">
                              <p className="text-xs font-bold">{msg.name === userName ? "You" : msg.name}</p>
                              {msg.timestamp && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Controls - fixed at bottom */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black/30 backdrop-blur-md py-4 px-6 flex justify-center items-center space-x-4 border-t border-gray-700/50 fixed bottom-0 left-0 right-0 z-10"
          >
            <motion.button
              onClick={toggleMicrophone}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMicMuted
                  ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30"
                  : "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                }`}
              disabled={!isRecording}
            >
              {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            <motion.button
              onClick={toggleRecording}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isRecording
                  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                  : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                }`}
            >
              {isRecording ? <PhoneOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            <motion.button
              onClick={toggleChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${showChat
                  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                  : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                }`}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={toggleParticipants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${showParticipants
                  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
                  : "bg-gray-700 hover:bg-gray-600 shadow-gray-700/30"
                }`}
            >
              <Users className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={requestAnalysis}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-4 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
              disabled={isAnalysisRequested}
            >
              {isAnalysisRequested ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
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
              className="w-full md:w-80 bg-gray-800/50 backdrop-blur-md border-l border-gray-700/50 flex flex-col shadow-xl absolute md:relative inset-0 z-20 md:z-0 pb-[80px]"
            >
              <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="font-medium text-blue-300">{showChat ? "Discussion Transcript" : "Participants"}</h2>
                <motion.button
                  onClick={showChat ? toggleChat : toggleParticipants}
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

              <div className="flex-1 overflow-y-auto p-4">
                {showChat && (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: (index * 0.05) % 0.5 }}
                        className="rounded-lg p-3 bg-gray-900/50 border border-gray-700/50"
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <p className={`text-sm font-medium ${getBotTextColor(msg.name)}`}>
                            {msg.name === userName ? "You" : msg.name}
                          </p>
                          {msg.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm">{msg.content}</p>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {showParticipants && (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-lg p-4 bg-gray-900/50 border border-gray-700/50 flex items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 flex items-center justify-center text-sm font-bold mr-3">
                        You
                      </div>
                      <div>
                        <p className="font-medium text-green-300">{userName}</p>
                        <p className="text-xs text-gray-400">{isMicMuted ? "Microphone muted" : "Active"}</p>
                      </div>
                    </motion.div>

                    {participants
                      .filter((name) => name !== userName)
                      .map((participant, index) => (
                        <motion.div
                          key={index}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="rounded-lg p-4 bg-gray-900/50 border border-gray-700/50 flex items-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center text-sm font-bold mr-3">
                            {participant.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-blue-300">{participant}</p>
                            <p className="text-xs text-gray-400">Participant</p>
                          </div>
                        </motion.div>
                      ))}

                    <div className="mt-6 p-4 bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-700/30">
                      <h3 className="text-md font-medium text-blue-300 mb-2 flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Others
                      </h3>
                      <p className="text-gray-300 text-xs mb-3">
                        Share this code with others to invite them to join this discussion:
                      </p>
                      <div className="flex items-center bg-gray-900/50 rounded-lg p-2 border border-gray-700/50">
                        <span className="text-lg font-mono text-green-400 flex-1 text-center">{discussionCode}</span>
                        <motion.button
                          onClick={copyDiscussionCode}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                      </div>
                      {codeCopied && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="text-green-400 text-xs mt-2 text-center"
                        >
                          Code copied to clipboard!
                        </motion.p>
                      )}
                    </div>
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

