"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Send, Play, GraduationCap, Briefcase, Trophy, Code } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import Typewriter from "react-ts-typewriter"
import useLoading from "@/hooks/useLoading"
import toast from "react-hot-toast"
import { getTranscript } from "@/lib/audioConvert"
import axios from "axios"
import { useSession } from "next-auth/react"
import { InterviewSocketClient } from "@/lib/otherInterview"
import { InterviewLayout } from "./interview-layout"
import QuestionReader from "../cultural-fit/screen-reader"
import AnalyzingResponseAnimation from "../interview/analyzing-response"
import EndInterview from "../interview/end-interview"
import VoiceAnimation from "../interview/voice-animation"
import Modal from "../modals/modal"
import InterviewFeedback from "./interview-feedback"
import { useRouter } from "next/navigation"
import StartInterview from "./start-interview"

enum STEPS {
  LEVEL = 0,
  QUESTIONS = 1,
}

const levels = [
  { text: "Beginner", icon: GraduationCap },
  { text: "Intermediate", icon: Briefcase },
  { text: "Advanced", icon: Trophy },
]

interface PracticeInterviewProps {
  websocketUrl: string;
  path: string;
}
interface Score {
  question: string
  answer: string
  code: string
  refrenceAnswer: string
  score: number
}

interface FeedbackProps {
  analysis: string
  scores: Score[]
  averageScore: number
  totalScore: number
}
export default function PracticeInterview({ websocketUrl, path }: PracticeInterviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(STEPS.LEVEL)
  const [level, setLevel] = useState("")
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const loading = useLoading()
  const [client, setClient] = useState<InterviewSocketClient | null>(null)
  const [transcript, setTranscript] = useState("")
  const [code, setCode] = useState("")
  const [isCodeMode, setIsCodeMode] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | MediaRecorder | null>(null)
  const [feedback, setFeedback] = useState<FeedbackProps | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [questionRead, setQuestionRead] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [creatingInterview, setCreatingInterview] = useState(false)
  const [endInterviewNotification, setEndInterviewNotification] = useState(false)
  const [displayingFeedback, setDisplayingFeedback] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession()
  const avatarVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const initStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing media devices:", err)
        setError("Unable to access camera or microphone. Please check your permissions and try again.")
      }
    }

    initStream()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const endInterview = async () => {
    if (!session?.user?.id) {
      toast.error("Not authorized to save interview data");
      return;
    }
    if (!client) {
      toast.error("Not authorized or client not initialized");
      return;
    }

    try {
      setEndInterviewNotification(true);
      setIsSaving(true);

      const analysisResult = await client.analyze();
      setFeedback(analysisResult);
      setDisplayingFeedback(true);

      await client.stopInterview();
      client.close();
      setClient(null);

      const response = await fetch('/api/savedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          practiceInterviewData: analysisResult,
          type: 'practice-interview',
          level: level,
          totalQuestions: totalQuestions,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save interview data');
      }

      const saveData = await response.json();
      // console.log("Interview data saved successfully:", saveData);
      toast.success("Interview completed and saved successfully!");

    } catch (error) {
      console.error("Error ending interview:", error);
      toast.error("Failed to end interview. Please try again.");
    } finally {
      setIsSaving(false);
      setEndInterviewNotification(false);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn))
    }
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn))
    }
  }


  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
    if (audioRef.current) {
      if (isSpeakerOn) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  const endCall = () => {
    endInterview()
    // console.log("Call ended")
  }

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.fftSize);

      let silenceStart: number | null = null;
      let isSilenceDetected = false;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      const checkSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        const volume = dataArray.reduce((sum, value) => sum + Math.abs(value - 128), 0) / dataArray.length;

        if (volume < 5) {
          // Silence threshold (adjust as needed)
          if (!silenceStart) {
            silenceStart = performance.now();
          } else if (performance.now() - silenceStart > 3000) {
            // 3 seconds of silence
            if (!isSilenceDetected) {
              // console.log("Silence detected. Stopping recording...");
              setIsRecording(false);
              isSilenceDetected = true;
              mediaRecorder.stop();

              stream.getTracks().forEach((track) => track.stop());
              audioContext.close();
            }
          }
        } else {
          silenceStart = null; // Reset silence timer
        }

        if (mediaRecorder.state === "recording") {
          requestAnimationFrame(checkSilence);
        }
      };

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks);
        const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });
        setIsAnalyzing(true);
        try {
          if (audioFile) {
            const transcriptText = await getTranscript(audioFile);
            setTranscript(transcriptText);
          } else {
            toast.error("Error processing audio");
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          toast.error("Error processing audio");
        } finally {
          setIsAnalyzing(false);
        }
      });

      mediaRecorder.start();
      recognitionRef.current = mediaRecorder;

      // Start checking for silence
      requestAnimationFrame(checkSilence);
    });
  };


  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current && recognitionRef.current instanceof MediaRecorder) {
      recognitionRef.current.stop()
    }
  }

  const onBack = () => {
    setStep((value) => value - 1)
  }

  const onNext = () => {
    setStep((value) => value + 1)
  }

  const actionLabel = useMemo(() => {
    if (step === STEPS.QUESTIONS) {
      return "Create"
    }
    return "Next"
  }, [step])

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.LEVEL) {
      return undefined
    }
    return "Back"
  }, [step])

  const fetchQuestions = async () => {
    setCreatingInterview(true)
    try {
      const newClient = new InterviewSocketClient(websocketUrl)
      await newClient.connect(path, totalQuestions, level)
      setClient(newClient)
      const { question } = await newClient.getQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast.error("Failed to start the interview. Please try again.")
    } finally {
      setCreatingInterview(false)
    }
  }

  const onSubmit = async () => {
    if (step !== STEPS.QUESTIONS) {
      return onNext()
    }

    try {
      // console.log("Level is ", level)
      setModalOpen(false)
      setIsInterviewStarted(true)
      await fetchQuestions()
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Failed to submit data. Please try again.")
    }
  }

  let bodyContent = (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">What level of position are you targeting?</h2>
      <div className="space-y-4 w-full max-w-md">
        {levels.map((levelItem, index) => (
          <Button
            key={levelItem.text}
            onClick={() => setLevel(levelItem.text)}
            className={`w-full py-3 text-lg text-gray-800 flex items-center justify-center ${levelItem.text === level ? "border-2 border-blue-500" : ""
              }`}
            variant="outline"
          >
            <levelItem.icon className="mr-2 h-5 w-5" />
            {levelItem.text}
          </Button>
        ))}
      </div>
    </div>
  )

  if (step === STEPS.QUESTIONS) {
    bodyContent = (
      <div className="p-8 max-w-lg mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">How many questions do you want to answer?</h2>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="10"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number.parseInt(e.target.value))}
            className="block w-full p-3 rounded-md text-black bg-white placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Enter a number between 1 and 10"
          />
        </div>
      </div>
    )
  }

  const submitAnswer = async () => {
    if (!client) {
      console.error("Interview client not initialized")
      return
    }

    try {
      await client.addQuestionAnswer(currentQuestion, transcript || " ", code || " ")
      setProgress((prevProgress) => prevProgress + 100 / totalQuestions)
      setQuestionNumber((prevNumber) => prevNumber + 1)

      if (questionNumber < totalQuestions) {
        const { question } = await client.getQuestion()
        setCurrentQuestion(question)
        setTranscript("")
        setCode("")
      } else {
        await endInterview()
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast.error("Failed to submit answer. Please try again.")
    }
  }
  const router = useRouter();
  const handleStartInterview = () => {
    if (!session?.user?.id) {
      router.push("/auth");
    } else {
      setModalOpen(true)
    }
  }
  return (
    <InterviewLayout
      isVideoOn={isVideoOn}
      isMicOn={isMicOn}
      isSpeakerOn={isSpeakerOn}
      toggleVideo={toggleVideo}
      toggleMic={toggleMic}
      toggleSpeaker={toggleSpeaker}
      endCall={endCall}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Interviewer Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-video bg-white rounded-lg overflow-hidden shadow-lg flex justify-center"
        >
          <div className="relative w-full h-full">
            <video
              ref={avatarVideoRef}
              src="https://uploadthingalternative.s3.ap-south-1.amazonaws.com/ai_avatar_speaking.mp4"
              className={`absolute w-full h-full object-cover transition-opacity duration-500 ${questionRead ? "opacity-100" : "opacity-0"
                }`}
              autoPlay
              muted
            />
            <video
              ref={avatarVideoRef}
              src="https://uploadthingalternative.s3.ap-south-1.amazonaws.com/ai_avatar_stop.mp4"
              className={`absolute w-full h-full object-cover transition-opacity duration-500 ${questionRead ? "opacity-0" : "opacity-100"
                }`}
              autoPlay
              muted
              loop
            />
          </div>
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/30 px-2 py-1 rounded-full">
            <Avatar className="h-8 w-8 ring-2 ring-white">
              <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <span className="text-sm text-white font-medium">AI Interviewer</span>
          </div>
        </motion.div>

        {/* Candidate Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg"
        >
          {isVideoOn ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Avatar className="h-32 w-32 ring-4 ring-gray-300">
                <AvatarImage src="/placeholder.svg?height=128&width=128&text=You" />
                <AvatarFallback>YOU</AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/30 px-2 py-1 rounded-full">
            <Avatar className="h-8 w-8 ring-2 ring-white">
              <AvatarImage src="/placeholder.svg?height=32&width=32&text=You" />
              <AvatarFallback>YOU</AvatarFallback>
            </Avatar>
            <span className="text-sm text-white font-medium">You</span>
          </div>
        </motion.div>
      </div>
      {creatingInterview && <StartInterview/>}
      {isAnalyzing && <AnalyzingResponseAnimation />}
      {endInterviewNotification && <EndInterview />}
      {!displayingFeedback && (<AnimatePresence mode="wait">
        {!isInterviewStarted && !displayingFeedback ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Ready for Your Practice Interview?
            </h2>
            <p className="mb-6 text-gray-600">
              Click the button below to begin. You'll be presented with a series of questions to answer.
            </p>
            <Button
              onClick={() => handleStartInterview()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" /> Start Interview
            </Button>
          </motion.div>
        ) : (

          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Progress value={progress} className="w-full mb-6" />
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              <Typewriter text={currentQuestion} />
              <QuestionReader question={currentQuestion} questionRead={questionRead} setQuestionRead={setQuestionRead} />
            </h2>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg relative overflow-hidden mb-6"
              >
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <motion.p
                  className="text-gray-700 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Typewriter text={transcript} />
                </motion.p>
                <motion.div
                  className="absolute bottom-2 right-2 w-16 h-16 opacity-10"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                </motion.div>
              </motion.div>
            )}

            <div className="mb-4">
              <Button
                onClick={() => setIsCodeMode(!isCodeMode)}
                className="mb-2"
                variant={isCodeMode ? "default" : "outline"}
              >
                <Code className="mr-2 h-4 w-4" />
                {isCodeMode ? "Switch to Text" : "Switch to Code"}
              </Button>
              {isCodeMode && (
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code here..."
                  className="w-full h-40"
                />
              )}
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className={`${isRecording
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    } text-white font-semibold flex items-center justify-center px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200`}
                >
                  {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isRecording ? "Stop" : "Start"} Recording
                </Button>
                {isRecording && <VoiceAnimation />}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={submitAnswer}
                  disabled={(!transcript && !code) || isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-semibold flex items-center transition-all duration-200"
                >
                  <Send className="mr-2 h-4 w-4" /> Submit
                </Button>
              </div>
            </div>
          </motion.div>
        )}


      </AnimatePresence>)}
      {feedback && <InterviewFeedback analysis={feedback.analysis} averageScore={feedback.averageScore} scores={feedback.scores} totalScore={feedback.totalScore} />}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={onSubmit}
        actionLabel={actionLabel}
        secondaryActionLabel={secondaryActionLabel}
        secondaryAction={step === STEPS.LEVEL ? undefined : onBack}
        title="Welcome!"
        body={bodyContent}
      />
    </InterviewLayout>
  )
}

