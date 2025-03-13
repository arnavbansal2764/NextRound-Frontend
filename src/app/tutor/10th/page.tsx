"use client"
import { useEffect, useRef, useState } from "react"
import React from "react"
import { TutorWebSocket } from "@/lib/tutor/10th/tutor-ws"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  Send,
  RefreshCw,
  X,
  Upload,
  MessageSquare,
  BookOpen,
  Brain,
  ImageIcon,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  PanelRightClose,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import toast from "react-hot-toast"
import ImageDropzone from "@/components/tutor/image-dropzone"
import TutorResponseDisplay from "@/components/tutor/tutor-response-display"
import ChatMessage from "@/components/tutor/chat-message"


// Feature card component for setup page
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-gray-800/50 border-gray-700/50 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-3">{icon}</div>
        <CardTitle className="text-blue-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function NCERTTutor() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [responses, setResponses] = useState<string[]>([])
  const [userMessages, setUserMessages] = useState<string[]>([])
  const [textQuestion, setTextQuestion] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [remainingImages, setRemainingImages] = useState<number>(5)
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false)
  const [imageDescription, setImageDescription] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState<boolean>(true)
  const [userInfo, setUserInfo] = useState({
    name: "",
    grade: "10th",
    subjects: "",
  })
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true)
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [currentDetailedResponse, setCurrentDetailedResponse] = useState<string>("")
  const [currentDetailedTitle, setCurrentDetailedTitle] = useState<string>("")
  const [currentDetailedSubject, setCurrentDetailedSubject] = useState<string>("Science")
  const [currentDetailedChapter, setCurrentDetailedChapter] = useState<string>("NCERT Textbook")
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false)

  const tutorWsRef = useRef<TutorWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsControlsExpanded(false)
        setIsControlsCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Initialize tutor WebSocket instance
  useEffect(() => {
    tutorWsRef.current = new TutorWebSocket("ws://localhost:8766")

    // Set up event listeners
    tutorWsRef.current.addMessageListener((message) => {
      if (message.startsWith("You asked:")) {
        // Store user messages separately
        setUserMessages((prev) => [...prev, message.substring(10)])
      } else {
        setResponses((prev) => [...prev, message])

        // Show educational content for any substantive response from the tutor
        // This will ensure all detailed responses get the typewriter animation treatment
        if (message.length > 100) {
          // Extract potential title, subject, and chapter from the message
          let title = "NCERT Tutor Response"
          let subject = "Science"
          let chapter = "NCERT Textbook"

          if (message.includes("Q:") && message.includes("\n\nA:")) {
            const question = message.split("\n\nA:")[0].substring(3)
            // Set more specific title based on content
            if (question.toLowerCase().includes("generator")) {
              title = "Exploring Generators from 10th Science NCERT"
              chapter = "Electromagnetic Induction"
            } else if (question.toLowerCase().includes("electromagnetic")) {
              title = "Understanding Electromagnetic Induction"
              chapter = "Electromagnetic Induction"
            } else if (question.toLowerCase().includes("physics")) {
              title = "Physics Concepts from NCERT"
            } else if (question.toLowerCase().includes("chemistry")) {
              title = "Chemistry Concepts from NCERT"
            } else if (question.toLowerCase().includes("biology")) {
              title = "Biology Concepts from NCERT"
            } else if (question.toLowerCase().includes("math")) {
              title = "Mathematics Concepts from NCERT"
              subject = "Mathematics"
            }
          }

          // Set the detailed response content and metadata
          setCurrentDetailedResponse(message)
          setCurrentDetailedTitle(title)
          setCurrentDetailedSubject(subject)
          setCurrentDetailedChapter(chapter)

          // Show the educational content with typewriter animation
          setShowEducationalContent(true)
        }
      }
    })

    tutorWsRef.current.addStatusChangeListener((status) => {
      setConnectionStatus(status)

      if (status === "connected" || status === "ready") {
        setIsConnected(true)
      } else if (status === "disconnected") {
        setIsConnected(false)
        setIsRecording(false)
      } else if (status === "processing_image") {
        setIsProcessingImage(true)
      }
    })

    tutorWsRef.current.addErrorListener((error) => {
      setResponses((prev) => [...prev, `Error: ${error}`])
      toast.error(`Error: ${error}`)
    })

    tutorWsRef.current.addExplanationListener((question, explanation) => {
      // Optional: Add specific handling for explanations beyond the general message listener
      setCurrentDetailedResponse(`Q: ${question}\n\nA: ${explanation}`)
      setCurrentDetailedTitle("Detailed Explanation")
    })

    tutorWsRef.current.addImageProcessedListener((description) => {
      setImageDescription(description)
      setIsProcessingImage(false)
      toast.success("Image processed successfully!")
    })

    return () => {
      // Cleanup
      if (tutorWsRef.current) {
        tutorWsRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    // Update remaining images count when tutorWs changes
    if (tutorWsRef.current) {
      setRemainingImages(tutorWsRef.current.remainingImages)
    }
  }, [responses, isConnected])

  const connectToTutor = async () => {
    try {
      if (tutorWsRef.current) {
        toast.promise(
          (async () => {
            await tutorWsRef.current?.connect()
            setRemainingImages(5) // Reset image count on new connection
            setShowSetup(false)
          })(),
          {
            loading: "Connecting to NCERT Tutor...",
            success: "Connected successfully!",
            error: "Connection failed. Please try again.",
          },
        )
      }
    } catch (error) {
      console.error("Error connecting to tutor:", error)
    }
  }

  const startRecording = async () => {
    try {
      if (tutorWsRef.current) {
        await tutorWsRef.current.startRecording()
        setIsRecording(true)
        toast.success("Voice input activated")
      }
    } catch (error) {
      console.error("Failed to start recording:", error)
      toast.error("Failed to start voice input")
    }
  }

  const stopRecording = () => {
    if (tutorWsRef.current) {
      tutorWsRef.current.stopRecording()
      setIsRecording(false)
      toast.success("Voice input stopped")
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
        toast.success("Microphone unmuted")
      } else {
        // Mute - pause sending audio without stopping recording
        tutorWsRef.current.pauseAudio()
        setIsMicMuted(true)
        toast.success("Microphone muted")
      }
    }
  }

  const sendTextQuestion = () => {
    if (tutorWsRef.current && textQuestion.trim()) {
      tutorWsRef.current.sendTextQuestion(textQuestion)
      setTextQuestion("")
      toast.success("Question sent")
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
    setUserMessages([])
    toast.success("Chat cleared")
  }

  const clearHistory = () => {
    if (tutorWsRef.current) {
      tutorWsRef.current.clearHistory()
      toast.success("Memory reset")
    }
  }

  const disconnect = () => {
    if (tutorWsRef.current) {
      tutorWsRef.current.disconnect()
      // Reset states
      setImageFile(null)
      setImagePreview(null)
      setImageDescription(null)
      setRemainingImages(5)
      setShowSetup(true)
      toast.success("Disconnected from tutor")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile || !imagePreview || !tutorWsRef.current) return

    try {
      toast.promise(
        (async () => {
          // Simple direct approach - using the data URL from preview
          const success = tutorWsRef.current?.sendImage(imagePreview)

          if (success) {
            setImageFile(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
            setRemainingImages(tutorWsRef.current?.remainingImages || 5)
          }
          return success
        })(),
        {
          loading: "Uploading image...",
          success: "Image uploaded successfully!",
          error: "Failed to upload image",
        },
      )
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const cancelImageUpload = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Setup page
  if (showSetup) {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              NCERT 10th Grade AI Tutor
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Your personal AI tutor for NCERT 10th grade subjects. Ask questions, upload images, and get instant
              explanations.
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
                  <CardTitle className="text-2xl text-blue-400">Student Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Enter your details to personalize your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="name"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="bg-gray-900/70 border-gray-700 text-white"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="grade" className="text-sm font-medium text-gray-300">
                        Grade
                      </label>
                      <Input
                        id="grade"
                        value={userInfo.grade}
                        onChange={(e) => setUserInfo({ ...userInfo, grade: e.target.value })}
                        className="bg-gray-900/70 border-gray-700 text-white"
                        placeholder="10th"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subjects" className="text-sm font-medium text-gray-300">
                      Subjects You Need Help With
                    </label>
                    <Textarea
                      id="subjects"
                      value={userInfo.subjects}
                      onChange={(e) => setUserInfo({ ...userInfo, subjects: e.target.value })}
                      className="bg-gray-900/70 border-gray-700 text-white min-h-[100px]"
                      placeholder="E.g., Mathematics, Science, Social Studies, etc."
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.button
                    onClick={connectToTutor}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/20 transition-all duration-300"
                    disabled={!userInfo.name.trim()}
                  >
                    Connect to NCERT Tutor
                  </motion.button>
                </CardFooter>
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
                  <CardTitle className="text-2xl text-blue-400">AI Tutor Features</CardTitle>
                  <CardDescription className="text-gray-300">
                    Discover what our NCERT AI tutor can do for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                    <div className="bg-blue-900/30 rounded-full p-2">
                      <Mic className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-300">Voice Interaction</h3>
                      <p className="text-sm text-gray-400">Ask questions naturally using your voice</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                    <div className="bg-blue-900/30 rounded-full p-2">
                      <ImageIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-300">Image Analysis</h3>
                      <p className="text-sm text-gray-400">
                        Upload textbook pages or diagrams for instant explanations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                    <div className="bg-blue-900/30 rounded-full p-2">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-300">NCERT Curriculum</h3>
                      <p className="text-sm text-gray-400">Aligned with the latest NCERT 10th grade syllabus</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-700/50">
                    <div className="bg-blue-900/30 rounded-full p-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-300">Personalized Learning</h3>
                      <p className="text-sm text-gray-400">
                        Adapts to your learning style and remembers past interactions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-blue-400">Study Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">Ask specific questions for better answers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">Upload clear images of textbook pages</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">Review previous explanations in the chat history</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">Use voice for complex questions, text for simple ones</p>
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
      className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 ${isFullScreen ? "fixed inset-0 z-50" : ""}`}
    >

      <main className="flex-1 p-4 md:p-6 mx-auto max-w-5xl w-full">
        <AnimatePresence mode="wait">
          {showEducationalContent ? (
            <motion.div
              key="educational-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <TutorResponseDisplay
                content={currentDetailedResponse}
                title={currentDetailedTitle}
                subject={currentDetailedSubject}
                chapter={currentDetailedChapter}
                onClose={() => setShowEducationalContent(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="tutor-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-blue-400 flex items-center">
                  <Wand2 className="h-5 w-5 mr-2" />
                  AI Tutor Controls
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
                  >
                    {isControlsCollapsed ? (
                      <PanelRightOpen className="h-5 w-5" />
                    ) : (
                      <PanelRightClose className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                  >
                    {isControlsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {isControlsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`grid grid-cols-1 ${isControlsCollapsed ? "md:grid-cols-1" : "md:grid-cols-3"} gap-4 md:gap-6`}
                    >
                      <Card
                        className={`bg-gray-800/50 backdrop-blur-md border-gray-700/50 col-span-1 ${isControlsCollapsed ? "" : "md:col-span-2"}`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl text-blue-400 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Voice & Text Input
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={toggleRecording}
                                    className={`${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                      } transition-all duration-300`}
                                    disabled={!isConnected}
                                  >
                                    <motion.div
                                      animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                      className="mr-2"
                                    >
                                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </motion.div>
                                    {isRecording ? "Stop Voice" : "Start Voice"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isRecording ? "Stop voice recording" : "Start voice recording"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={toggleMicrophone}
                                    className={`${isMicMuted ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-500 hover:bg-gray-600"
                                      } transition-all duration-300`}
                                    disabled={!isRecording || !isConnected}
                                  >
                                    {isMicMuted ? (
                                      <MicOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Mic className="h-4 w-4 mr-2" />
                                    )}
                                    {isMicMuted ? "Unmute" : "Mute"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isMicMuted ? "Unmute microphone" : "Mute microphone"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={clearResponses}
                                    className="bg-gray-600 hover:bg-gray-700 transition-all duration-300"
                                    disabled={!isConnected}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Clear Chat
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Clear the chat history</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={clearHistory}
                                    className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
                                    disabled={!isConnected}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset Memory
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reset the tutor's memory</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={disconnect}
                                    className="bg-gray-700 hover:bg-gray-800 transition-all duration-300"
                                    disabled={!isConnected}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Disconnect
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Disconnect from the tutor</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Demo button removed as requested */}
                            {/* <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={addSampleResponse}
                                    className="bg-green-600 hover:bg-green-700 transition-all duration-300"
                                  >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Demo Response
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Show a sample educational response</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider> */}
                          </div>

                          <div className="relative">
                            <Textarea
                              value={textQuestion}
                              onChange={(e) => setTextQuestion(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="w-full p-3 pr-16 bg-gray-900/70 border-gray-700 text-white resize-none"
                              placeholder="Type your question here... (Press Enter to send)"
                              rows={3}
                              disabled={!isConnected}
                            />
                            <Button
                              onClick={sendTextQuestion}
                              className="absolute right-2 bottom-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                              disabled={!textQuestion.trim() || !isConnected}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-sm text-gray-400">
                            {isRecording
                              ? isMicMuted
                                ? "Microphone muted. Click 'Unmute' to continue."
                                : "Voice input active. Ask your questions about NCERT topics."
                              : "Click 'Start Voice' to ask questions by voice."}
                          </div>
                        </CardContent>
                      </Card>

                      {!isControlsCollapsed && (
                        <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl text-blue-400 flex items-center">
                              <ImageIcon className="h-5 w-5 mr-2" />
                              Image Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-300">
                              Upload an image of a textbook page, diagram, or problem to analyze
                            </p>
                            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
                              {remainingImages} images remaining
                            </Badge>

                            <div className="space-y-3">
                              <ImageDropzone
                                onFileSelect={(file) => {
                                  if (fileInputRef.current) {
                                    const dataTransfer = new DataTransfer()
                                    dataTransfer.items.add(file)
                                    fileInputRef.current.files = dataTransfer.files
                                    handleImageChange({
                                      target: { files: dataTransfer.files },
                                    } as React.ChangeEvent<HTMLInputElement>)
                                  }
                                }}
                                maxSizeMB={5}
                                className={
                                  remainingImages <= 0 || isProcessingImage || !isConnected
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                                }
                              />

                              <AnimatePresence>
                                {imagePreview && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-4"
                                  >
                                    <div className="relative max-w-xs mx-auto">
                                      <img
                                        src={imagePreview || "/placeholder.svg"}
                                        alt="Preview"
                                        className="w-full object-contain border rounded-md max-h-48 border-blue-700/50"
                                      />
                                    </div>
                                    <div className="flex justify-center gap-2 mt-2">
                                      <Button
                                        onClick={uploadImage}
                                        disabled={isProcessingImage || remainingImages <= 0 || !isConnected}
                                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isProcessingImage ? "Processing..." : "Analyze Image"}
                                      </Button>
                                      <Button
                                        onClick={cancelImageUpload}
                                        className="bg-gray-600 hover:bg-gray-700 transition-all duration-300"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence>
                                {isProcessingImage && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center mt-4"
                                  >
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-sm text-gray-400">Processing image...</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(responses.length > 0 || userMessages.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-lg"
                  >
                    <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Tutor Chat
                    </h2>
                    <div ref={chatContainerRef} className="bg-gray-900/70 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                      {/* Interleave user messages and responses */}
                      {userMessages.map((userMessage, index) => {
                        const correspondingResponse = responses[index]
                        return (
                          <React.Fragment key={index}>
                            <ChatMessage message={userMessage} isUser={true} />
                            {correspondingResponse && (
                              <ChatMessage
                                message={correspondingResponse}
                                isUser={false}
                                hasDetailedView={
                                  correspondingResponse.includes("generator") ||
                                  correspondingResponse.includes("electromagnetic")
                                }
                                onViewFullExplanation={() => {
                                  setCurrentDetailedResponse(correspondingResponse)
                                  // Set appropriate title based on content
                                  let title = "NCERT Tutor Response"
                                  if (correspondingResponse.toLowerCase().includes("generator")) {
                                    title = "Exploring Generators from 10th Science NCERT"
                                  } else if (correspondingResponse.toLowerCase().includes("electromagnetic")) {
                                    title = "Understanding Electromagnetic Induction"
                                  }
                                  setCurrentDetailedTitle(title)
                                  setCurrentDetailedSubject("Science")
                                  setCurrentDetailedChapter("NCERT Textbook")
                                  // Ensure this is set to true to show the content
                                  setShowEducationalContent(true)
                                }}
                              />
                            )}
                          </React.Fragment>
                        )
                      })}

                      {/* Display any remaining responses */}
                      {responses.slice(userMessages.length).map((response, index) => (
                        <ChatMessage
                          key={`extra-${index}`}
                          message={response}
                          isUser={false}
                          hasDetailedView={response.includes("generator") || response.includes("electromagnetic")}
                          onViewFullExplanation={() => {
                            setCurrentDetailedResponse(response)
                            setCurrentDetailedTitle("NCERT Tutor Response")
                            setCurrentDetailedSubject("Science")
                            setCurrentDetailedChapter("NCERT Textbook")
                            setShowEducationalContent(true)
                          }}
                        />
                      ))}
                      <div ref={responseEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

     
    </motion.div>
  )
}

