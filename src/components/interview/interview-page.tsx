'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, SkipForward, Send, Play } from 'lucide-react'
import Typewriter from 'react-ts-typewriter'
import FeedbackComponent from './feedback-component'
import QuestionReader from './screen-reader'
import VoiceAnimation from '../cultural-fit/voice-animation'
import useLoading from '@/hooks/useLoading'
import { GraduationCap, Briefcase, Trophy } from 'lucide-react'
import Modal from '../modals/modal'
import { UploadDropzone } from "@/lib/uploadThing/uploadThing"
import toast from "react-hot-toast"
import { InterviewSocketClient } from '../../lib/interviewsocket/interviewsocket'

interface AnalysisResult {
    question: string
    transcript: string
    feedback: string
}

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

export default function InterviewClient() {
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [transcription, setTranscription] = useState("")
    const [progress, setProgress] = useState(0)
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
    const [questions, setQuestions] = useState<string[]>([])
    const [responses, setResponses] = useState<{ question: string; transcript: string }[]>([])
    const [soundIntensity, setSoundIntensity] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(5)
    const answeredQuestions = useRef(0)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const loading = useLoading()
    const [modalOpen, setModalOpen] = useState(false)
    const [step, setStep] = useState(STEPS.RESUME)
    const [isLoading, setIsLoading] = useState(false)
    const [resume, setResume] = useState("")
    const uploadToastId = useRef<string | number | undefined>(undefined)
    const [fileName, setFileName] = useState<string>("")
    const [level, setLevel] = useState("")
    const [client, setClient] = useState<InterviewSocketClient | null>(null)

    const onBack = () => {
        setStep((value) => value - 1)
    }

    const onNext = () => {
        setStep((value) => value + 1)
    }

    const onSubmit = async () => {
        if (step !== STEPS.QUESTIONS) {
            return onNext()
        }

        setIsLoading(true)

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

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
            if (client) {
                client.close()
            }
        }
    }, [])

    const fetchQuestions = async () => {
        loading.onOpen()
        try {
            const newClient = new InterviewSocketClient('ws://localhost:8765')
            await newClient.connect(resume, totalQuestions, level)
            setClient(newClient)
            const { question } = await newClient.getQuestion()
            setCurrentQuestion(question)
            setQuestions([question])
        } catch (error) {
            console.error('Error fetching questions:', error)
            toast.error('Failed to start the interview. Please try again.')
        } finally {
            loading.onClose()
        }
    }

    const startInterview = () => {
        setModalOpen(true)
    }

    const startRecording = () => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser. Please use Google Chrome for the best experience.")
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsRecording(true)
            startAudioAnalysis()
        }

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('')
            setTranscription(transcript)
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error)
        }

        recognition.onend = () => {
            setIsRecording(false)
            stopAudioAnalysis()
        }

        recognitionRef.current = recognition
        recognition.start()
    }

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }

    const startAudioAnalysis = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext()
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = audioContextRef.current!.createMediaStreamSource(stream)
                analyserRef.current = audioContextRef.current!.createAnalyser()
                analyserRef.current.fftSize = 256
                source.connect(analyserRef.current)

                const updateIntensity = () => {
                    const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount)
                    analyserRef.current!.getByteFrequencyData(dataArray)
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
                    setSoundIntensity((average / 255) * 100)
                    animationFrameRef.current = requestAnimationFrame(updateIntensity)
                }

                updateIntensity()
            })
            .catch(error => {
                console.error('Error accessing microphone:', error)
            })
    }

    const stopAudioAnalysis = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }
        setSoundIntensity(0)
    }

    const submitAnswer = async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        try {
            await client.addQuestionAnswer(currentQuestion, transcription)
            setResponses(prevResponses => [
                ...prevResponses,
                { question: currentQuestion, transcript: transcription }
            ])

            answeredQuestions.current += 1
            setProgress((answeredQuestions.current / totalQuestions) * 100)

            if (answeredQuestions.current < totalQuestions) {
                const { question } = await client.getQuestion()
                setCurrentQuestion(question)
                setQuestions(prevQuestions => [...prevQuestions, question])
                setTranscription("")
            } else {
                await endInterview()
            }
        } catch (error) {
            console.error('Error submitting answer:', error)
            toast.error('Failed to submit answer. Please try again.')
        }
    }

    const skipQuestion = async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        try {
            answeredQuestions.current += 1
            setProgress((answeredQuestions.current / totalQuestions) * 100)

            if (answeredQuestions.current < totalQuestions) {
                const { question } = await client.getQuestion()
                setCurrentQuestion(question)
                setQuestions(prevQuestions => [...prevQuestions, question])
                setTranscription("")
            } else {
                await endInterview()
            }
        } catch (error) {
            console.error('Error skipping question:', error)
            toast.error('Failed to skip question. Please try again.')
        }
    }

    const endInterview = async () => {
        if (!client) {
            console.error('Interview client not initialized')
            return
        }

        loading.onOpen()
        setIsInterviewStarted(false)
        setCurrentQuestion("")
        setTranscription("")
        try {
            const analysisResult = await client.analyze()
            setAnalysisResults(analysisResult)
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

    let bodyContent = (
        <div className="flex flex-auto gap-8 justify-center">
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="bg-white p-8 rounded-lg max-w-md w-full"
            >
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-6 text-center text-gray-800"
                >
                    What level of position are you targeting?
                </motion.h2>
                <div className="space-y-4">
                    {levels.map((levelItem, index) => (
                        <motion.div
                            key={levelItem.text}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Button
                                onClick={() => setLevel(levelItem.text)}
                                className={`w-full py-3 text-lg text-gray-800 flex items-center justify-center ${levelItem.text === level ? 'border-2 border-red-800' : ''
                                    }`}
                                variant="outline"
                            >
                                <levelItem.icon className="mr-2 h-5 w-5" />
                                {levelItem.text}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )

    if (step === STEPS.RESUME) {
        bodyContent = (
            <div className="p-5 rounded-lg text-black bg-gray-800">
                <div className="flex flex-col items-center text-white border-collapse">
                    <UploadDropzone
                        className="border-gray-800"
                        endpoint="resume"
                        onClientUploadComplete={(res: any) => {
                            setResume(res[0].url)
                            setFileName(res[0].name)
                            if (uploadToastId.current !== undefined) {
                                toast.success("Resume uploaded successfully!", { id: uploadToastId.current as string })
                                uploadToastId.current = undefined
                            }
                            console.log(res)
                        }}
                        onUploadBegin={() => {
                            uploadToastId.current = toast.loading("Resume uploading...")
                        }}
                        onUploadError={(error: Error) => {
                            if (uploadToastId.current !== undefined) {
                                toast.error(`Error uploading file: ${error.message}`, { id: uploadToastId.current as string })
                                uploadToastId.current = undefined
                            }
                        }}
                    />
                </div>
            </div>
        )
    }

    if (step === STEPS.QUESTIONS) {
        bodyContent = (
            <div className="p-8 max-w-lg mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                <p className="text-2xl font-semibold text-white mb-4">How many questions do you want to ask?</p>
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

    if (analysisResults.length > 0) {
        return <FeedbackComponent apiResponse={analysisResults} />
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardContent className="p-6">
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
                                <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready for Your Interview?</h2>
                                <p className="mb-6 text-gray-600">Click the button below to begin. You'll be presented with a series of questions to answer.</p>
                                <Button onClick={startInterview} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
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
                                {transcription && (
                                    <div className="p-4 rounded-md mb-4 shadow-inner">
                                        <p className="text-sm text-gray-700"><Typewriter text={transcription} /></p>
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
                                        {isRecording && <div><VoiceAnimation /></div>}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button onClick={submitAnswer} disabled={!transcription} className="bg-green-500 hover:bg-green-600 text-white">
                                            <Send className="mr-2 h-4 w-4" /> Submit
                                        </Button>
                                        <Button onClick={skipQuestion} variant="outline" className="border-gray-300">
                                            <SkipForward className="mr-2 h-4 w-4" /> Skip
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
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
        </div>
    )
}

