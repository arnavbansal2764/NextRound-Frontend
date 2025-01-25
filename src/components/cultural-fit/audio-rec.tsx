"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Users, Phone, Send, Play, VolumeX, Volume2 } from 'lucide-react'
import Typewriter from 'react-ts-typewriter'
import useLoading from "@/hooks/useLoading"
import VoiceAnimation from "./voice-animation"
import CulturalFitAnalysis from "./cultural-fit-display"
import { Segment, SegmentSecondaryTrait } from "@/lib/redis/types"
import axios from "axios"
import EndCultural from "./end-cultural"
import QuestionReader from "./screen-reader"
import { sendDataToBackend } from "@/lib/saveData"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
interface CulturalScore {
    question: string
    refrenceAnswer: string
    score: number
}

interface CulturalFitAnalysisProps {
    result: string
    primary_traits: Segment[]
    segment_secondary_traits: SegmentSecondaryTrait[]
    scores: {
        totalScore: number
        averageScore: number
        scores: CulturalScore[]
    }
}
const questionsPool = [
    "Introduce yourself.",
    "What motivates you to come to work every day?",
    "How do you handle feedback from peers or supervisors?",
    "Can you describe your ideal work environment?",
    "How do you typically approach problem-solving in a team setting?",
    "What does success mean to you in your professional life?",
    "How do you balance your work responsibilities with personal life?",
    "What do you do when you’re assigned a task outside your comfort zone?",
    "How do you handle conflicts with coworkers?",
    "Tell us about a time when you had to quickly learn something new to complete a task.",
    "How do you stay organized and manage your time?",
    "How do you handle situations where you’re working with someone with a completely different perspective?",
    "Can you share an example of how you’ve dealt with uncertainty?",
    "What do you value most in a manager or leader?",
    "How do you prepare yourself when taking on a new responsibility or role?",
    "What are your strengths and weaknesses?",
    "How do you ensure a positive and collaborative atmosphere in a team?",
    "Share an experience where you improved team morale or engagement.",
    "How do you approach giving constructive feedback to a colleague?",
    "What strategies do you use to stay positive during challenging times?",
    "How do you approach situations where you need to ask for help?",
    "How do you handle situations where you disagree with a decision?",
    "How do you ensure your work contributes to the organization’s goals?",
    "What is your approach to mentoring or helping a less experienced colleague?",
    "How do you stay updated on trends or changes in your field?",
    "What have you done in the past to go above and beyond for your team or company?",
    "How do you approach networking or building professional connections?",
    "What steps do you take to align your personal goals with your professional objectives?",
    "How do you handle tight deadlines or high-pressure situations at work?",
    "Where do you see yourself in 5 years?",
    "What inspires you to pursue a career in this field?",
    "Describe a situation where you showed leadership skills.",
    "How do you handle criticism?",
    "Tell me about a time when you worked effectively under pressure.",
    "How do you adapt to changing priorities or unexpected situations?",
    "Describe a situation where you had to collaborate with someone very different from you.",
    "What are your hobbies or interests outside of work or studies?",
    "How do you manage stress?",
    "Can you describe an achievement you are particularly proud of?",
    "How do you handle failure or setbacks?",
    "What motivates you to achieve your goals?",
    "How do you approach learning new skills?",
    "What is a recent achievement that made you proud, and why?",
    "How do you prioritize tasks when you have multiple deadlines?",
    "Describe a time when you had to learn a new skill quickly. How did you approach it?",
    "How do you build relationships with team members?",
    "What is the most challenging project you have worked on?",
    "How do you receive and act upon constructive feedback?",
    "What does teamwork mean to you?",
    "How do you ensure attention to detail in your work?",
    "How do you stay motivated when working towards a long-term goal?",
    "How do you stay motivated during monotonous or repetitive tasks?",
    "In what type of team environment do you thrive?",
    "How do you handle situations where you have to make a difficult decision?",
    "What are your career aspirations?",
    "How do you define good customer service?",
    "Describe a time when you had to explain a complex concept to someone.",
    "How do you handle competition among peers?",
    "Can you provide an example of setting and achieving a personal goal?",
    "How do you balance quality and efficiency in your work?",
    "What qualities do you appreciate in a teammate?",
    "How do you approach ethical dilemmas?",
    "Tell us about a time when you exceeded expectations on a project or assignment.",
    "How do you handle ambiguity in instructions or tasks?",
    "How do you maintain enthusiasm when working on a challenging task?",
    "What skills do you want to improve upon?",
    "How do you ensure open communication within a team?",
    "How do you keep yourself accountable for your work?",
    "How do you react when you need to change your plans due to unforeseen circumstances?",
    "Tell me about a time when you helped someone achieve their goals.",
    "How do you incorporate feedback into your personal development?",
    "What values are most important to you in a workplace?",
    "How do you handle tasks that you find uninteresting?",
    "Describe a situation where you had to persuade others to accept your idea.",
    "What do you think makes a successful team?",
    "How do you measure your own success?",
    "What steps do you take when you notice a mistake in your work?",
    "How do you maintain focus on long-term objectives?",
    "Describe a situation where you learned from a mistake.",
    "How do you keep yourself engaged and focused during prolonged projects?",
    "What motivates you to perform at your best?",
    "How do you handle receiving multiple assignments at once?",
    "Describe your approach to conflict resolution.",
    "How do you manage working with a difficult team member?",
    "What professional development opportunities are you seeking?",
    "How do you stay productive when working independently?",
    "What do you do to ensure continuous learning?",
    "How do you handle feeling overwhelmed?",
    "What steps do you take to ensure that you meet deadlines?",
    "How do you build resilience when facing obstacles or setbacks?",
    "How do you handle decision-making when you have limited information?",
    "How do you approach setting personal goals?",
    "What strategies do you use to resolve misunderstandings?",
    "How do you keep yourself organized in a fast-paced environment?",
    "How do you seek out opportunities for personal and professional growth?",
    "Describe a time when you had to manage conflicting priorities.",
    "How do you handle tasks that require attention to detail?",
    "What is your approach to teamwork in virtual or remote settings?",
    "What does work-life balance mean to you?",
    "What is one thing you would like to improve about yourself?"
]
function getRandomItemFromArray(arr: string[]): string {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

const CulturalFitClient = () => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const audioRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [progress, setProgress] = useState(0)
    const loading = useLoading()
    const [analysisResult, setAnalysisResult] = useState<CulturalFitAnalysisProps | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [question, setQuestion] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(new Date())
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isSpeakerOn, setIsSpeakerOn] = useState(true)
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
    const [questionRead, setQuestionRead] = useState(false);
    const [endInterviewNotification, setEndInterviewNotification] = useState(false)
    const [fileName, setFileName] = useState<string>("")
    useEffect(() => {
        const randomQuestion = getRandomItemFromArray(questionsPool);
        setQuestion(randomQuestion);
        startVideo();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        speechSynthesisRef.current = window.speechSynthesis
        return () => {
            clearInterval(timer)
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel()
            }
        }

    }, [])
    const { data: session } = useSession()
    const speakQuestion = (question: string) => {
        if (!questionRead && question && speechSynthesisRef.current && isSpeakerOn) {
            const utterance = new SpeechSynthesisUtterance(question);
            speechSynthesisRef.current.speak(utterance);
            setQuestionRead(true);
        }
    }

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn)
        if (isSpeakerOn) {
            speechSynthesisRef.current?.cancel()
        } else {
            speakQuestion(question)
        }
    }
    const startVideo = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
            setStream(videoStream)
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream
            }
        } catch (err) {
            console.error("Error accessing camera:", err)
            setError("Unable to access camera. Please check your permissions and try again.")
        }
    }

    const startRecording = () => {
        setIsInterviewStarted(true);
        setAudioFile(null);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    const mediaRecorder = new MediaRecorder(stream);
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();

                    source.connect(analyser);
                    analyser.fftSize = 256; // Adjust FFT size
                    const dataArray = new Uint8Array(analyser.fftSize);

                    let silenceStart:any = null;
                    let isSilenceDetected = false;

                    audioRef.current = mediaRecorder;
                    audioChunksRef.current = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunksRef.current.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, {
                            type: "audio/wav",
                        });
                        const audioFile = new File([audioBlob], "audio.wav", {
                            type: "audio/wav",
                        });

                        setAudioFile(audioFile);
                        console.log("Recording finished, file URL:", URL.createObjectURL(audioBlob));
                    };

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
                                    console.log("Silence detected. Stopping recording...");
                                    isSilenceDetected = true;
                                    mediaRecorder.stop();
                                    stream.getTracks().forEach((track) => track.stop());
                                    audioContext.close();
                                    setIsRecording(false);
                                }
                            }
                        } else {
                            silenceStart = null; // Reset silence timer
                        }

                        if (mediaRecorder.state === "recording") {
                            requestAnimationFrame(checkSilence);
                        }
                    };

                    mediaRecorder.start();
                    setIsRecording(true);
                    requestAnimationFrame(checkSilence);
                })
                .catch((error) => {
                    console.error("Error accessing microphone:", error);
                    setError("Error accessing microphone. Please check your permissions and try again.");
                });
        } else {
            console.error("Your browser does not support audio recording.");
            setError("Your browser does not support audio recording. Please try using a different browser.");
        }
    };


    const stopRecording = () => {
        if (audioRef.current && isRecording) {
            audioRef.current.stop();
            setIsRecording(false);
        }
        console.log("Recording stopped", audioFile)
    };

    const uploadAudio = async (file: File) => {
        try {
            // Start progress indicator
            setEndInterviewNotification(true);
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress < 95) {
                        return prevProgress + 5;
                    }
                    return prevProgress;
                });
            }, 2000);

            const fileName = `${Date.now()}-${file.name}`; // Generate unique file name
            const fileType = file.type;

            // Get pre-signed URL for upload
            const res = await axios.post('/api/s3/upload', { fileName, fileType });
            const { uploadUrl } = await res.data;

            if (!uploadUrl) {
                throw new Error('Failed to get upload URL');
            }

            // Upload the file to S3
            const upload = await axios.put(uploadUrl, file);
            if (upload.status !== 200) {
                throw new Error('Failed to upload audio');
            }

            clearInterval(interval); // Clear the progress interval
            setProgress(100); // Set progress to 100% after successful upload

            const audioUrl = uploadUrl.split('?')[0]; // Get the S3 object URL (without query params)
            setFileName(fileName); // Set the file name for reference

            // Analyze the audio file after successful upload
            await analyzeAudio(audioUrl);

        } catch (error) {
            console.error('Upload failed:', error);
            setError('Failed to upload audio. Please try again.');
        } finally {
            setEndInterviewNotification(false); // Stop the notification
        }
    };

    const deleteAudio = async (fileName: string) => {
        try {
            if (!fileName) throw new Error('File name is missing for deletion.');

            // Send delete request to API
            const res = await axios.post('/api/s3/delete', { fileName });
            if (res.status !== 200) {
                throw new Error('Failed to delete the file.');
            }

            console.log('File deleted successfully.');
        } catch (error) {
            console.error('Delete failed:', error);
            setError('Failed to delete the file.');
        }
    };

    const analyzeAudio = async (audioUrl: string) => {
        try {
            // Send audio URL for analysis
            const response = await axios.post('/api/cultural-fit', { audioUrl, question });

            console.log('Analysis result:', response.data);
            const analysisResult: CulturalFitAnalysisProps = response.data; // Assuming response.data is already in the correct format
            setAnalysisResult(analysisResult); // Set the analysis result
            setError(null); // Clear any previous error
            
            const saveData = await sendDataToBackend(`${session?.user.id}`, analysisResult, 'cultural');
            console.log('Cultural fit data saved successfully:', saveData);
        } catch (error) {
            console.error('Error analyzing audio:', error);
            // setAnalysisResult(example); // Fallback result
            setError('Error analyzing audio. Please try again.');
        } finally {
            // Delete the audio file after analysis
            if (fileName) {
                await deleteAudio(fileName);
            }
        }
    };
    const router = useRouter();
    const handleStartCultural = () => {
        if (!session?.user?.id) {
            router.push("/auth");
        }else{
            setIsInterviewStarted(true);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800">
            {endInterviewNotification && <EndCultural />}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4 sticky top-0 z-10"
            >
                <div className="flex items-center justify-between max-w-7xl mx-auto -mt-4">
                    <div className="w-full flex items-center justify-end max-w-7xl mx-auto">
                        <span className="text-sm text-gray-500">{currentTime.toLocaleTimeString()}</span>
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                            <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 space-y-6">
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

                {/* Interview Content */}
                <AnimatePresence mode="wait">
                    {!isInterviewStarted && !loading.isOpen ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-center max-w-2xl mx-auto"
                        >
                            <h2 className="text-4xl font-bold mb-4 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Ready for Your Cultural Fit?</h2>
                            <p className="mb-6 text-gray-600 text-lg">Our AI interviewer will assess your cultural fit using cutting-edge analysis.</p>
                            <Button
                                onClick={() => handleStartCultural()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                <Play className="mr-2 h-5 w-5" /> Click to start
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <Progress value={progress} className="w-full h-2 bg-gray-200" />

                            <Card className="bg-white shadow-lg border-0">
                                <motion.div
                                    className="p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                                        <Typewriter text={question as string} />
                                        <QuestionReader question={question} />
                                    </h2>

                                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                        <div className="flex items-center space-x-4">
                                            {/* {audioFile && (
                                                    <div className="mt-4">
                                                        <audio controls src={URL.createObjectURL(audioFile)} />
                                                    </div>
                                                )} */}
                                            {isRecording && <VoiceAnimation />}
                                        </div>

                                        {audioFile && !isRecording && (
                                            <Button
                                                onClick={() => uploadAudio(audioFile)}
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 transform hover:scale-105"
                                            >
                                                <Send className="mr-2 h-4 w-4" /> Submit Answer
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            </Card>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {analysisResult && <CulturalFitAnalysis data={analysisResult} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Meeting Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200"
            >
                <div className="max-w-7xl mx-auto p-4">
                    <div className="flex items-center justify-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-12 w-12 rounded-full transition-all duration-300 ${isRecording ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={isRecording ? stopRecording : startRecording}
                        >
                            {isRecording ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-12 w-12 rounded-full transition-all duration-300 ${isVideoOn ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => {
                                setIsVideoOn(!isVideoOn)
                                if (stream) {
                                    startVideo()
                                }
                            }}
                        >
                            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-12 w-12 rounded-full transition-all duration-300 ${isSpeakerOn ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={toggleSpeaker}
                        >
                            {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                        >
                            <MonitorUp className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                        >
                            <Phone className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default CulturalFitClient