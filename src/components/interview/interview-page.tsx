'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, SkipForward, Send, Play } from 'lucide-react'
import axios from 'axios'
import Typewriter from 'react-ts-typewriter'
import FeedbackComponent from './feedback-component'
import QuestionReader from './screen-reader'
import VoiceAnimation from '../cultural-fit/voice-animation'
import useLoading from '@/hooks/useLoading'
import useCreateProfile from '@/hooks/useCreateProfile'

interface AnalysisResult {
    question: string
    transcript: string
    feedback: string
}

export default function InterviewClient() {
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [showLevelModal, setShowLevelModal] = useState(false)
    const [interviewLevel, setInterviewLevel] = useState<number | null>(null)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [transcription, setTranscription] = useState("")
    const [progress, setProgress] = useState(0)
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
    const [questions, setQuestions] = useState<string[]>([])
    const [responses, setResponses] = useState<{ question: string; transcript: string }[]>([])
    const [soundIntensity, setSoundIntensity] = useState(0)
    const totalQuestions = 5
    const answeredQuestions = useRef(0)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const loading = useLoading();
    const createProfile = useCreateProfile();
    useEffect(() => {
        if (isInterviewStarted && interviewLevel !== null) {
            fetchQuestions()
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [isInterviewStarted, interviewLevel])

    const fetchQuestions = async () => {
        loading.onOpen();
        try {
            const response = await axios.get('/api/interview/questions');
            const refinedQuestions = response.data.questions.questions
                .filter((question: string) =>
                    question.trim() !== '' && /^\d+\./.test(question.trim())
                )
                .map((question: string) =>
                    question
                        .replace(/^\d+\.\s*/, '')
                        .replace(/"/g, '')
                        .trim()
                );
            setQuestions(refinedQuestions);
            setCurrentQuestion(refinedQuestions[0]);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            loading.onClose();
        }
    };

    const startInterview = () => {
        createProfile.onOpen();
        // setShowLevelModal(true)
    }

    const handleLevelSelection = (level: number) => {
        setInterviewLevel(level)
        setShowLevelModal(false)
        setIsInterviewStarted(true)
        answeredQuestions.current = 0
        setProgress(0)
        setResponses([])
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
        setResponses(prevResponses => [
            ...prevResponses,
            { question: currentQuestion, transcript: transcription }
        ])

        answeredQuestions.current += 1
        setProgress((answeredQuestions.current / totalQuestions) * 100)

        if (answeredQuestions.current < questions.length) {
            setCurrentQuestion(questions[answeredQuestions.current])
            setTranscription("")
        } else {
            await endInterview()
        }
    }

    const skipQuestion = async () => {
        answeredQuestions.current += 1
        setProgress((answeredQuestions.current / totalQuestions) * 100)

        if (answeredQuestions.current < questions.length) {
            setCurrentQuestion(questions[answeredQuestions.current])
            setTranscription("")
        } else {
            await endInterview()
        }
    }

    const endInterview = async () => {
        loading.onOpen()
        setIsInterviewStarted(false)
        setCurrentQuestion("")
        setTranscription("")
        try {
            const response = await axios.post('/api/interview/analyze', { responses });

            // Parse the JSON string in the 'analysis' property
            const analysisData = JSON.parse(response.data.analysis);

            // Ensure analysisData is an array (if multiple analyses are returned)
            // If it's a single object, wrap it in an array
            const analysisResultsArray = Array.isArray(analysisData)
                ? analysisData
                : [analysisData];

            // Update the state with the analysis results
            setAnalysisResults(analysisResultsArray);
        } catch (error) {
            console.error('Error sending responses for analysis:', error);
        } finally {
            loading.onClose();
        }
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
        </div>
    )
}
