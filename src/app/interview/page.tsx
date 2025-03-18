"use client"
import { useEffect, useRef, useState } from "react"
import { type InterviewScore, InterviewWebSocket, type InterviewConfig } from "@/lib/interview-ws"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  PhoneOff,
  GraduationCap,
  Briefcase,
  Trophy,
} from "lucide-react"
import axios from "axios"
import FileDropzone from "@/components/interview/file-dropzone"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import InterviewResults from "@/components/interview/interview-result"
import { useRouter } from "next/navigation"
import QuestionReader from "@/components/interview/screen-reader"

const levels = [
  { text: "Entry-Level", icon: GraduationCap },
  { text: "Intermediate", icon: Briefcase },
  { text: "Senior Positions", icon: Trophy },
]

export default function InterviewAssistant() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [aiResponses, setAiResponses] = useState<string[]>([])
  const [resumeText, setResumeText] = useState<string>("")
  const [resumeUrl, setResumeUrl] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("Entry-Level")
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false)
  const [finalMessage, setFinalMessage] = useState<string>("")
  const [isAnalysisRequested, setIsAnalysisRequested] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [showChat, setShowChat] = useState<boolean>(false)
  const [showParticipants, setShowParticipants] = useState<boolean>(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [animateResponse, setAnimateResponse] = useState(false)
  const [questionRead, setQuestionRead] = useState(false)
  const [scores, setScores] = useState<InterviewScore[]>([])
  const interviewWsRef = useRef<InterviewWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const router = useRouter()
  useEffect(() => {
    interviewWsRef.current = new InterviewWebSocket("wss://ws.nextround.tech/ws/interview")

    interviewWsRef.current.addMessageListener((message) => {
      setAiResponses((prev) => [...prev, message])
      setAnimateResponse(true)
      setTimeout(() => setAnimateResponse(false), 1000)
    })

    interviewWsRef.current.addStatusChangeListener((status) => {
      setConnectionStatus(status)

      if (status === "ready") {
        setIsConfigured(true)
        startRecording()
      } else if (status === "complete") {
        setInterviewComplete(true)
        setIsRecording(false)
      } else if (status === "disconnected") {
        setIsConfigured(false)
        setIsRecording(false)
      }
    })

    interviewWsRef.current.addErrorListener((error) => {
      setAiResponses((prev) => [...prev, `Error: ${error}`])
    })

    interviewWsRef.current.addAnalysisListener((message, interviewScores) => {
      setFinalMessage(message)
      if (interviewScores) {
        setScores(interviewScores)
        // No need to format history as we'll pass the raw scores to the component
      }
      // console.log("\n These are scores \n", interviewScores)
    })

    return () => {
      if (interviewWsRef.current) {
        interviewWsRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [aiResponses])

  useEffect(() => {
    if (isConfigured) {
      const setupWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (error) {
          console.error("Error accessing webcam:", error)
          toast.error("Failed to access webcam. Please check your permissions.")
        }
      }

      setupWebcam()

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }, [isConfigured])

  const configureAndStartInterview = async () => {
    if (!resumeText.trim() && !resumeUrl.trim()) {
      toast.error("Please provide either resume text or upload a resume PDF to start the interview")
      return
    }

    try {
      const config: InterviewConfig = {
        resume_text: resumeText,
        difficulty: difficulty as "easy" | "medium" | "hard",
      }

      if (resumeUrl.trim()) {
        config.resume_pdf = resumeUrl
      }

      if (interviewWsRef.current) {
        await interviewWsRef.current.configure(config)
        setIsConfigured(true)
      }
    } catch (error) {
      console.error("Error configuring interview:", error)
      toast.error("Failed to configure interview. Please try again.")
    }
  }

  const startRecording = async () => {
    try {
      if (interviewWsRef.current && interviewWsRef.current.configured) {
        await interviewWsRef.current.startRecording()
        setIsRecording(true)
      }
    } catch (error) {
      console.error("Failed to start recording:", error)
      toast.error("Failed to start recording. Please check your microphone permissions.")
    }
  }

  const toggleRecording = () => {
    if (interviewWsRef.current) {
      if (isRecording) {
        interviewWsRef.current.stopRecording()
        setIsRecording(false)

        // Stop video stream when stopping recording
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }
      } else {
        startRecording()

        // Restart video stream
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream
            }
          })
          .catch((error) => {
            console.error("Error accessing webcam:", error)
            toast.error("Failed to access webcam. Please check your permissions.")
          })
      }
    }
  }

  const toggleMicrophone = () => {
    if (interviewWsRef.current && interviewWsRef.current.recording) {
      setIsMicMuted(!isMicMuted)
      if (!isMicMuted) {
        interviewWsRef.current.pauseAudio()
      } else {
        interviewWsRef.current.resumeAudio()
      }
    }
  }

  const requestAnalysis = () => {
    if (interviewWsRef.current) {
      interviewWsRef.current.requestAnalysis()
      setIsAnalysisRequested(true)
    }
  }

  const clearResponses = () => {
    setAiResponses([])
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    setShowParticipants(false)
  }

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants)
    setShowChat(false)
  }

  const endCall = () => {
    requestAnalysis()
  }

  const uploadResume = async (file: File) => {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const fileType = file.type

      const res = await axios.post("/api/s3/upload", { fileName, fileType })
      const { uploadUrl } = await res.data

      if (!uploadUrl) {
        throw new Error("Failed to get upload URL")
      }

      const upload = await axios.put(uploadUrl, file)
      if (upload.status !== 200) {
        throw new Error("Failed to upload resume")
      }

      const resumeUrl = uploadUrl.split("?")[0]
      setResumeUrl(resumeUrl)
    } catch (error) {
      console.error("Upload failed:", error)
      throw new Error("Failed to upload resume. Please try again.")
    }
  }

  const handleFileSelect = async (file: File) => {
    setResumeFile(file)
    toast.promise(uploadResume(file), {
      loading: "Uploading resume...",
      success: "Resume uploaded successfully",
      error: "Failed to upload resume",
    })
  }

  if (!isConfigured) {
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Prepare for Your Interview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50"
              >
                {resumeUrl ? (
                  <div className="p-5 rounded-lg bg-white/10 backdrop-blur-md">
                    <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">Resume Uploaded</h2>
                    <div className="flex flex-col items-center border-collapse">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-300 font-medium">File Uploaded Successfully</p>
                      <p className="text-gray-400 text-sm mt-2">{resumeFile?.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-lg bg-white/5 backdrop-blur-md">
                    <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">Upload Your Resume</h2>
                    <div className="flex flex-col items-center border-collapse">
                      <FileDropzone onFileSelect={handleFileSelect} />
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50"
              >
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">Interview Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Position Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {levels.map((levelItem) => (
                        <motion.button
                          key={levelItem.text}
                          onClick={() => setDifficulty(levelItem.text)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${levelItem.text === difficulty
                              ? "bg-blue-500/30 border-2 border-blue-500 text-white"
                              : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                          <levelItem.icon className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">{levelItem.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={configureAndStartInterview}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300"
              >
                Start Interview
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
        {/* Main video area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 flex flex-col relative h-full"
        >
          {/* Video grid */}
          <div className="flex-1 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 overflow-y-auto pb-[40px] md:pb-[40px]">
            {/* Interviewer video */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-700/50 shadow-xl min-h-[180px]"
            >
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
                Interviewer
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center text-2xl md:text-4xl">
                AI
              </div>
            </motion.div>

            {/* Your video */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-700/50 shadow-xl min-h-[180px]"
            >
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium z-10">
                You
              </div>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
              {aiResponses.length > 0 ? (
                <p className="text-gray-200 text-sm md:text-base">
                  {/* QuestionReader should be invisible but handle screen reading */}
                  <span className="sr-only">
                    <QuestionReader
                      question={aiResponses[aiResponses.length - 1]}
                      questionRead={questionRead}
                      setQuestionRead={setQuestionRead}
                    />
                  </span>
                  {/* Visual display of the text */}
                  {aiResponses[aiResponses.length - 1]}
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
              {isRecording ? (
                <Video className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
              )}
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
              onClick={endCall}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
              disabled={interviewComplete || isAnalysisRequested}
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
                {showChat && (
                  <div className="space-y-4">
                    {aiResponses.map((response, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-3 ${index % 2 === 0
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-purple-500/20 border border-purple-500/30"
                          }`}
                      >
                        <p
                          className={`text-sm font-medium mb-1 ${index % 2 === 0 ? "text-blue-300" : "text-purple-300"
                            }`}
                        >
                          {index % 2 === 0 ? "Interviewer" : "You"}
                        </p>
                        <p className="text-gray-200 text-sm">{response}</p>
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
                        AI
                      </div>
                      <div>
                        <p className="font-medium text-blue-300">AI Interviewer</p>
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
                        ME
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

      <AnimatePresence>
        {interviewComplete && finalMessage && (
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
              className="max-w-3xl w-full"
            >
              <InterviewResults
                resultData={finalMessage}
                scores={scores.map((score) => ({
                  ...score,
                  question: score.question || "", // Ensure question is never undefined
                  answer: score.answer || "", // Ensure answer is never undefined
                  refrenceAnswer: score.refrenceAnswer || "", // Ensure refrenceAnswer is never undefined
                  score: score.score !== undefined ? score.score : 0, // Ensure score is always a number
                }))}
                onClose={() => {
                  setInterviewComplete(false)
                  setFinalMessage("")
                }}
                onStartNew={() => {
                  setInterviewComplete(false)
                  setFinalMessage("")
                  clearResponses()
                  router.refresh()
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}