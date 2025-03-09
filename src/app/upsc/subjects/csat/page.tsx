"use client"
import { useEffect, useRef, useState } from "react"
import { CSATWebSocket, type CSATConfig } from "@/lib/upsc/subject/csat-ws"
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
} from "lucide-react"

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
    connectionStatus: "disconnected" as "disconnected" | "ready" | "complete",
  });

  const [uiState, setUiState] = useState({
    showChat: false,
    showParticipants: false,
    animateResponse: false,
  });

  const [responses, setResponses] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const csatWsRef = useRef<CSATWebSocket | null>(null)
  const responseEndRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Initialize CSAT WebSocket instance
  useEffect(() => {
    const ws = new CSATWebSocket("wss://ws3.nextround.tech/upsc-csat");
    csatWsRef.current = ws;

    const handleMessage = (message: string) => {
      setResponses(prev => [...prev, message]);
      setUiState(prev => ({ ...prev, animateResponse: true }));
      setTimeout(() => setUiState(prev => ({ ...prev, animateResponse: false })), 1000);
    };

    const handleStatusChange = (status: string) => {
      setInterviewState(prev => ({ ...prev, connectionStatus: status as any }));

      switch (status) {
        case "ready":
          setInterviewState(prev => ({ ...prev, isConfigured: true }));
          startRecording();
          break;
        case "complete":
          setInterviewState(prev => ({ 
            ...prev, 
            interviewComplete: true, 
            isRecording: false 
          }));
          // Remove the automatic reset here
          break;
        case "disconnected":
          setInterviewState(prev => ({ 
            ...prev, 
            isConfigured: false, 
            isRecording: false 
          }));
          break;
      }
    };

    ws.addMessageListener(handleMessage);
    ws.addStatusChangeListener(handleStatusChange);
    ws.addErrorListener((error) => {
      setResponses(prev => [...prev, `Error: ${error}`]);
    });

    return () => ws.disconnect();
  }, []);

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
    try {
      if (!csatWsRef.current) return;

      await csatWsRef.current.configure({ difficulty });
    } catch (error) {
      console.error("Error configuring CSAT interview:", error);
    }
  }

  const startRecording = async () => {
    try {
      if (!csatWsRef.current) return;

      await csatWsRef.current.startRecording();
      setInterviewState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  const toggleRecording = () => {
    if (!csatWsRef.current) return;

    if (interviewState.isRecording) {
      csatWsRef.current.stopRecording();
      setInterviewState(prev => ({ ...prev, isRecording: false }));
    } else {
      startRecording();
    }
  }

  const toggleMicrophone = () => {
    if (!csatWsRef.current || !interviewState.isRecording) return;

    if (interviewState.isMicMuted) {
      csatWsRef.current.resumeAudio();
      setInterviewState(prev => ({ ...prev, isMicMuted: false }));
    } else {
      csatWsRef.current.pauseAudio();
      setInterviewState(prev => ({ ...prev, isMicMuted: true }));
    }
  }

  const resetInterview = () => {
    setInterviewState({
      isRecording: false,
      isConfigured: false,
      isMicMuted: false,
      interviewComplete: false,
      connectionStatus: "disconnected",
    });
    setUiState({
      showChat: false,
      showParticipants: false,
      animateResponse: false,
    });
    setResponses([]);
    setInterviewState(prev => ({ ...prev, isRecording: false }));
    if (csatWsRef.current) {
      csatWsRef.current.disconnect();
      csatWsRef.current = new CSATWebSocket("ws://localhost:8766");
    }
  }

  const endInterview = () => {
    if (csatWsRef.current) {
      csatWsRef.current.endInterview()
    }
  }

  const clearResponses = () => {
    setResponses([])
  }

  const toggleChat = () => setUiState(prev => ({ 
    ...prev, 
    showChat: !prev.showChat, 
    showParticipants: false 
  }));

  const toggleParticipants = () => setUiState(prev => ({ 
    ...prev, 
    showParticipants: !prev.showParticipants, 
    showChat: false 
  }));

  const handleModalAction = (action: 'close' | 'new') => {
    resetInterview();
    if (action === 'new') {
      // Additional logic for starting a new interview if needed
      configureAndStartInterview();
    }
  };

  if (!interviewState.isConfigured) {
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
              CSAT Interview Practice
            </h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50 mb-6"
            >
              <h2 className="text-xl font-bold mb-4 text-center text-blue-300">Difficulty Level</h2>
              <div className="grid grid-cols-3 gap-3">
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
            </motion.div>

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
                Start CSAT Interview
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
                CSAT Interviewer
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center text-2xl md:text-4xl">
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
              <div className="w-20 h-20 md:w-32 md:h-32 bg-purple-600 rounded-full flex items-center justify-center text-2xl md:text-4xl">
                ME
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
                <p className="text-gray-200 text-sm md:text-base">{responses[responses.length - 1]}</p>
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
              {interviewState.isMicMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
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
              {interviewState.isRecording ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
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
                <h2 className="font-medium text-blue-300">{uiState.showChat ? "Interview Transcript" : "Participants"}</h2>
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
                    {responses.map((response, index) => (
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
                        ME
                      </div>
                      <div>
                        <p className="font-medium text-purple-300">You</p>
                        <p className="text-xs text-gray-400">{interviewState.isMicMuted ? "Microphone muted" : "Active"}</p>
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
              <h2 className="text-2xl font-bold text-center mb-4 text-blue-300">Interview Complete</h2>
              <p className="text-gray-300 mb-6 text-center">
                Thank you for participating in the CSAT practice interview. Your responses have been recorded.
              </p>

              <div className="space-y-4">
                <h3 className="font-medium text-blue-300">Interview Tips:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li>Review your answers and identify areas for improvement</li>
                  <li>Practice logical reasoning and analytical skills regularly</li>
                  <li>Work on time management for complex questions</li>
                  <li>Develop a structured approach to problem-solving</li>
                </ul>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalAction('close')}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalAction('new')}
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300"
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

