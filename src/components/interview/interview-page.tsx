"use client"
import dotenv from 'dotenv';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Send, Play, GraduationCap, Briefcase, Trophy, ChevronUp, ChevronDown } from 'lucide-react'
import Typewriter from 'react-ts-typewriter'

import FeedbackComponent from './feedback-component'
import QuestionReader from './screen-reader'
import VoiceAnimation from '../cultural-fit/voice-animation'
import useLoading from '@/hooks/useLoading'
import Modal from '../modals/modal'
import { UploadDropzone } from "@/lib/uploadThing/uploadThing"

import toast from "react-hot-toast"
import { InterviewSocketClient } from '../../lib/interviewsocket/interviewsocket'
import { InterviewLayout } from './interview-layout'

enum STEPS {
    RESUME = 0,
    LEVEL = 1,
    QUESTIONS = 2
}

const levels = [
    { text: 'Entry-Level', icon: GraduationCap },
    { text: 'Intermediate', icon: Briefcase },
    { text: 'Senior Positions', icon: Trophy },
]
interface FeedbackItem {
    question: string
    transcript: string
    feedback: string
}
export default function InterviewClient() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [isSpeakerOn, setIsSpeakerOn] = useState(true)
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [transcription, setTranscription] = useState("")
    const [analysisResults, setAnalysisResults] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [step, setStep] = useState(STEPS.RESUME)
    const [resume, setResume] = useState("")
    const [level, setLevel] = useState("")
    const [totalQuestions, setTotalQuestions] = useState(5)
    const [error, setError] = useState("")
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const audioRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const loading = useLoading()
    const [client, setClient] = useState<InterviewSocketClient | null>(null)
    const [responses, setResponses] = useState<{ question: string; transcript: string }[]>([])
    const answeredQuestions = useRef(0)
    const [questions, setQuestions] = useState<string[]>([])
    const [transcript, setTranscript] = useState("")
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
    const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string>("")
    const [questionNumber, setQuestionNumber] = useState(1)
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
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
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000)
            speechSynthesisRef.current = window.speechSynthesis
            return () => {
                clearInterval(timer)
                if (speechSynthesisRef.current) {
                    speechSynthesisRef.current.cancel()
                }
            }
    })
    useEffect(() => {
        speakQuestion(currentQuestion)
    }, [currentQuestion])
    const endInterview = async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        loading.onOpen()
        setIsInterviewStarted(false)
        setCurrentQuestion("")
        setTranscript("")
        try {
            const analysisResult = await client.analyze()
            setFeedback(analysisResult)
            await client.stopInterview()
            client.close()
            setClient(null)
        } catch (error) {
            console.error('Error ending interview:', error)
            toast.error('Failed to end interview. Please try again.')
        } finally {
            loading.onClose()
        }
    }


    const toggleFeedbackItem = (question: string) => {
        setSelectedFeedbackItem(prevSelected => prevSelected === question ? null : question)
    }

    const formatFeedback = (text: string) => {
        return text.split('\n').map((line, index) => {
            const cleanedLine = line.replace(/\*/g, '').trim();

            if (cleanedLine.startsWith('•')) {
                return <li key={index} className="ml-4">{cleanedLine.substring(1).trim()}</li>;
            } else if (cleanedLine.includes(':')) {
                const [title, ...content] = cleanedLine.split(':');
                if (content.length) {
                    return (
                        <div key={index} className="font-semibold mt-2">
                            {title.trim()}:
                            <span className="font-normal ml-1">{content.join(':').trim()}</span>
                        </div>
                    );
                }
            }
            return <p key={index} className="mt-1">{cleanedLine}</p>;
        });
    };

    
    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn)
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !isVideoOn)
        }
    }

    const toggleMic = () => {
        setIsMicOn(!isMicOn)
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMicOn)
        }
    }
    const speakQuestion = (question: string) => {
        if (speechSynthesisRef.current && isSpeakerOn) {
            const utterance = new SpeechSynthesisUtterance(question);
            utterance.rate = 0.9;
            utterance.onerror = (e) => console.error("Speech error:", e.error);
            speechSynthesisRef.current.speak(utterance);
        }
    }
    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn)
        if (isSpeakerOn) {
            speechSynthesisRef.current?.cancel()
        } else {
            speakQuestion(currentQuestion)
        }
    }

    const endCall = () => {
        // Implement end call functionality
        console.log("Call ended")
    }

    const startRecording = () => {
        setIsRecording(true)
        startSpeechRecognition()
    }

    const stopRecording = () => {
        setIsRecording(false)
        stopSpeechRecognition()
    }
    const startSpeechRecognition = useCallback(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setError("Speech recognition is not supported in this browser.")
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('')
            setTranscript(transcript)
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error)
            setError("Error in speech recognition. Please try again.")
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [])

    const stopSpeechRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }, [])
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
        if (step === STEPS.RESUME) {
            return undefined
        }
        return "Back"
    }, [step])

    const fetchQuestions = async () => {
        loading.onOpen()
        try {
            const newClient = new InterviewSocketClient(process.env.WEBSOCKET_ID?process.env.WEBSOCKET_ID:"ws://localhost:8765")
            await newClient.connect(resume, totalQuestions, level)
            setClient(newClient)
            const { question } = await newClient.getQuestion()
            setCurrentQuestion(question)
        } catch (error) {
            console.error('Error fetching questions:', error)
            toast.error('Failed to start the interview. Please try again.')
        } finally {
            loading.onClose()
        }
    }

    const onSubmit = async () => {
        if(!resume){
            toast.error("Please upload your resume")
            return
        }
        else if (step !== STEPS.QUESTIONS) {
            return onNext()
        }


        const sendApi = async () => {
            try {
                console.log("Resume is ", resume)
                console.log("Level is ", level)
                setModalOpen(false)
                setIsInterviewStarted(true)
                await fetchQuestions()
            } catch (error) {
                console.error("Error submitting data:", error)
            }
        }
        toast.promise(sendApi(), {
            loading: "Creating Profile...",
            success: "Profile Created !!",
            error: "Something went wrong!!",
        })
    }
    let bodyContent = (
        <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                What level of position are you targeting?
            </h2>
            <div className="space-y-4 w-full max-w-md">
                {levels.map((levelItem, index) => (
                    <Button
                        key={levelItem.text}
                        onClick={() => setLevel(levelItem.text)}
                        className={`w-full py-3 text-lg text-gray-800 flex items-center justify-center ${levelItem.text === level ? 'border-2 border-blue-500' : ''
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

    if (step === STEPS.RESUME) {
        bodyContent = (
            <div className="p-5 rounded-lg text-black bg-gray-50">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Upload Your Resume
                </h2>
                <div className="flex flex-col items-center text-black border-collapse">
                    <UploadDropzone
                        className='w-full p-4 rounded-lg text-black bg-blue-500'
                        endpoint="resume"
                        onClientUploadComplete={(res) => {
                            setResume(res[0].url)
                            toast.success("Resume uploaded successfully!")
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(`Error uploading file: ${error.message}`)
                        }}
                    />
                </div>
            </div>
        )
    }

    if (step === STEPS.QUESTIONS) {
        bodyContent = (
            <div className="p-8 max-w-lg mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center text-white">
                    How many questions do you want to answer?
                </h2>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                        className="block w-full p-3 rounded-md text-black bg-white placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Enter a number between 1 and 10"
                    />
                </div>
            </div>
        )
    }
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopSpeechRecognition()
        } else {
            startSpeechRecognition()
        }
        setIsRecording(!isRecording)
    }, [isRecording])
    const submitAnswer = useCallback(async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        try {
            await client.addQuestionAnswer(currentQuestion, transcript)
            setProgress((prevProgress) => prevProgress + (100 / totalQuestions))
            setQuestionNumber(prevNumber => prevNumber + 1)

            if (questionNumber < totalQuestions) {
                const { question } = await client.getQuestion()
                setCurrentQuestion(question)
                setTranscript("")
            } else {
                await endInterview()
            }
        } catch (error) {
            console.error('Error submitting answer:', error)
            toast.error('Failed to submit answer. Please try again.')
        }
    }, [client, currentQuestion, transcript, questionNumber, totalQuestions])
    const skipQuestion = useCallback(async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        try {
            setProgress((prevProgress) => prevProgress + (100 / totalQuestions))
            setQuestionNumber(prevNumber => prevNumber + 1)

            if (questionNumber < totalQuestions) {
                const { question } = await client.getQuestion()
                setCurrentQuestion(question)
                setTranscript("")
            } else {
                await endInterview()
            }
        } catch (error) {
            console.error('Error skipping question:', error)
            toast.error('Failed to skip question. Please try again.')
        }
    }, [client, questionNumber, totalQuestions])
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
                    <img
                        src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-vector-600nw-1745180411.jpg"
                        alt="Interviewer"
                        className="w-fit h-full object-cover"
                    />
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
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
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

            <AnimatePresence mode="wait">
                {!isInterviewStarted && !loading.isOpen ? (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-bold mb-4 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Ready for Your Interview?</h2>
                        <p className="mb-6 text-gray-600">Click the button below to begin. You'll be presented with a series of questions to answer.</p>
                        <Button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
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
                            <QuestionReader question={currentQuestion} />
                        </h2>
                        {transcript && (
                            <div className="p-4 rounded-md mb-4 bg-gray-100 shadow-inner">
                                <p className="text-sm text-gray-700">{transcript}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? "destructive" : "default"}
                                    className="flex items-center"
                                >
                                    {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                                    {isRecording ? 'Stop' : 'Start'} Recording
                                </Button>
                                {isRecording && <VoiceAnimation />}
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={submitAnswer} disabled={!transcript} className="bg-green-500 hover:bg-green-600 text-white">
                                    <Send className="mr-2 h-4 w-4" /> Submit
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
                {feedback && <FeedbackComponent feedback={feedback} />}

            </AnimatePresence>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={onSubmit}
                actionLabel={actionLabel}
                secondaryActionLabel={secondaryActionLabel}
                secondaryAction={step === STEPS.RESUME ? undefined : onBack}
                title="Welcome! Create your profile"
                body={bodyContent}
            />
        </InterviewLayout>
    )
}

