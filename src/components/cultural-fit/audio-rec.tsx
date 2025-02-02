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
    {
        "company": "Amazon",
        "questions": [
            "Tell me about a time you worked backward from a customer's needs to create a solution.",
            "Describe a situation where you had to take complete ownership of a project.",
            "How have you handled tight deadlines while maintaining high standards?",
            "Give an example of a time when you used data to make a decision.",
            "Tell me about a time you made a difficult decision with limited information.",
            "Describe a situation where you disagreed with your manager. How did you handle it?",
            "How have you prioritized tasks when managing multiple conflicting priorities?",
            "Tell me about a time you delivered results despite challenges.",
            "Have you ever identified a process that could be streamlined? What steps did you take?",
            "Describe a time you mentored or coached a colleague to improve their performance.",
            "What is the most innovative idea you've implemented?",
            "Tell me about a failure you experienced and how you handled it.",
            "How do you ensure that your team consistently delivers customer satisfaction?",
            "Have you ever faced resistance to a change you wanted to implement? What did you do?",
            "Describe a time you worked with a team that had conflicting goals.",
            "Tell me about a time you took a calculated risk.",
            "How have you influenced a team or stakeholders to align with your vision?",
            "Describe a situation where you improved an inefficient process.",
            "How do you stay focused and productive when priorities shift frequently?",
            "Have you ever faced pushback on a decision you made? How did you respond?"
        ]
    },
    {
        "company": "Google",
        "questions": [
            "How do you approach an ambiguous problem without clear guidance?",
            "Describe a time you solved a problem creatively.",
            "Tell me about a time you worked with a team to achieve a challenging goal.",
            "How have you handled a situation where you had to make a tough ethical decision?",
            "Have you ever challenged the status quo at work? What happened?",
            "Describe a time when you had to collaborate with people from diverse backgrounds.",
            "How do you prioritize tasks when facing competing deadlines?",
            "Tell me about a time you turned a failure into a learning opportunity.",
            "Have you ever proposed an out-of-the-box solution to a problem? What was the outcome?",
            "Describe a situation where you handled disagreement within a team.",
            "How do you ensure that all voices are heard in a discussion or meeting?",
            "Tell me about a time you took initiative to improve a project or process.",
            "How do you balance creativity with practical execution in your work?",
            "Describe a situation where you used data to support a decision.",
            "How do you adapt to changes in a project's direction or scope?",
            "Have you ever mentored a colleague? What was the impact?",
            "How have you balanced your professional goals with the company's mission?",
            "Tell me about a time you successfully managed stakeholder expectations.",
            "How do you stay updated on trends relevant to your work?",
            "What is your approach to handling stress and high-pressure situations?"
        ]
    },
    {
        "company": "Meta",
        "questions": [
            "Describe a situation where you delivered significant impact in your role.",
            "Tell me about a time you took a bold risk that paid off.",
            "How have you handled a situation where you needed to move quickly without compromising quality?",
            "Describe a time you advocated for an inclusive approach to problem-solving.",
            "How do you prioritize tasks in a fast-paced environment?",
            "Tell me about a project where you had to collaborate with multiple stakeholders.",
            "Describe a situation where you made a decision with incomplete information.",
            "How do you ensure transparency and open communication with your team?",
            "Tell me about a time you used feedback to improve your work.",
            "How have you handled failure or setbacks in your career?",
            "Describe a time you challenged a process or practice to make it more efficient.",
            "How have you managed conflict within a team?",
            "Tell me about a time you created or implemented a long-term vision for a project.",
            "How do you balance bold decision-making with mitigating risks?",
            "Describe a time you successfully led a cross-functional project.",
            "How do you ensure diversity of thought when brainstorming or problem-solving?",
            "Tell me about a time you contributed to a project outside your regular responsibilities.",
            "Describe a situation where you had to influence others to adopt your approach.",
            "How have you adapted to changing priorities in a high-growth environment?",
            "Tell me about a time you achieved a goal despite significant challenges."
        ]
    },
    {
        "company": "Netflix",
        "questions": [
            "Tell me about a time you managed a project with minimal supervision.",
            "Describe a situation where you had to own a mistake and fix it.",
            "How do you prioritize tasks when you have competing responsibilities?",
            "Tell me about a time you had to give direct and honest feedback to a colleague.",
            "How have you taken responsibility for achieving a challenging goal?",
            "Describe a time you made a difficult decision with significant impact.",
            "How do you handle ambiguity in a role or project?",
            "Tell me about a time you went beyond your job responsibilities to deliver results.",
            "Describe a situation where you managed a project from start to finish.",
            "How do you ensure accountability in your work?",
            "Tell me about a time you made a significant contribution to a team's success.",
            "How do you handle criticism and turn it into an opportunity for growth?",
            "Describe a time you challenged a decision to advocate for a better solution.",
            "How do you stay self-motivated in long or difficult projects?",
            "Tell me about a time you aligned your goals with the company's mission.",
            "How do you balance autonomy with collaboration in team settings?",
            "Describe a situation where you influenced a major decision.",
            "Tell me about a time you successfully balanced innovation with execution.",
            "How have you adapted to feedback from peers or leaders?",
            "Describe a project where you had full ownership and accountability."
        ]
    },
    {
        "company": "Apple",
        "questions": [
            "Tell me about a time you paid great attention to detail to ensure quality.",
            "How have you handled a project where perfection was expected?",
            "Describe a situation where you faced a tough quality-related decision.",
            "How do you balance creativity with functionality in your work?",
            "Tell me about a time you worked with a team to create something exceptional.",
            "How have you ensured customer satisfaction in your work?",
            "Tell me about a time you solved a problem with an innovative solution.",
            "Describe a situation where you had to learn a new skill quickly.",
            "How do you handle constructive criticism about your work?",
            "Tell me about a time you exceeded expectations in a project.",
            "How have you balanced competing priorities in a high-pressure situation?",
            "Describe a time you turned a complex idea into a simple solution.",
            "Tell me about a time you worked on a project you were deeply passionate about.",
            "How have you handled disagreements with peers while maintaining professionalism?",
            "Describe a situation where you went out of your way to help a customer or colleague.",
            "Tell me about a time you introduced a creative idea that improved a process.",
            "How do you ensure precision and accuracy in your work?",
            "Describe a project where collaboration was essential to success.",
            "Tell me about a time you identified and fixed a small issue before it became a bigger problem.",
            "How do you maintain focus on quality in a fast-paced environment?"
        ]
    }
]
function getRandomItemFromArray(arr: { company: string; questions: string[] }[]): string {
    const randomCompanyIndex = Math.floor(Math.random() * arr.length);
    const randomCompany = arr[randomCompanyIndex];
    const randomQuestionIndex = Math.floor(Math.random() * randomCompany.questions.length);
    return randomCompany.questions[randomQuestionIndex];
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
    const avatarVideoRef = useRef<HTMLVideoElement>(null)
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

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn)
        if (isSpeakerOn) {
            speechSynthesisRef.current?.cancel()
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
                        {questionRead ? (
                            <video ref={avatarVideoRef} src="/ai_avatar.mp4" className="w-full h-full object-cover" autoPlay muted />
                        ) : (
                            <img
                                src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-vector-600nw-1745180411.jpg"
                                alt="Interviewer"
                                className="w-fit h-full object-cover"
                            />
                        )}
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
                                        <QuestionReader question={question} questionRead={questionRead} setQuestionRead={setQuestionRead}/>
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