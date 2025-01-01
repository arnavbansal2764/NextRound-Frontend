"use client";

import React, { useState, useRef } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/core";
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Send, Play } from 'lucide-react'
import Typewriter from 'react-ts-typewriter'
import useLoading from "@/hooks/useLoading";
import VoiceAnimation from "./voice-animation";
import { CulturalFitAnalysis } from "./cultural-fit-display";
const { useUploadThing } = generateReactHelpers<OurFileRouter>();
const exampleResponse = { "emotions": [["Interest: 0.4721828103065491", "Amusement: 0.43491387367248535", "Surprise (positive): 0.28914597630500793"], ["Concentration: 0.6366159319877625", "Interest: 0.5614610910415649", "Determination: 0.4061761498451233"], ["Satisfaction: 0.22752264142036438", "Contentment: 0.17091824114322662", "Pride: 0.16791008412837982"], ["Realization: 0.26484888792037964", "Sadness: 0.1887257695198059", "Disappointment: 0.1877591609954834"], ["Determination: 0.40023890137672424", "Interest: 0.320429265499115", "Satisfaction: 0.22500911355018616"], ["Interest: 0.7706456184387207", "Determination: 0.41761326789855957", "Excitement: 0.4144953191280365"]], "result": "Summary and Feedback:\n\nYour response includes a mix of statements about yourself, your interests, and your proficiencies. However, it appears that your response is fragmented and lacks cohesion. \n\nSome notable aspects of your response include:\n\n- You started with a friendly tone, introducing yourself with enthusiasm (segment 0).\n- You showed interest in your profession and mentioned your proficiency in building web applications using Flask and Python (segments 1 and 3).\n- You also mentioned your interest in implementing AI with a tool called Monster Truck (segment 2), but this seems to be an unusual and unclear statement.\n- Your response had a brief mention of your passion for other activities, such as badminton and other non-coding related hobbies (segment 5).\n- Your emotions fluctuated throughout the response, showcasing enthusiasm, determination, and interest in various tasks.\n\nTips for Improvement:\n\n1. Structure your response: Start with a clear and concise introduction, followed by your professional experience, skills, and interests. \n2. Be clear about your skills and experiences: While you mentioned your proficiency in using Flask and Python, it would be helpful to provide more specific examples or projects related to these skills. \n3. Be prepared for unusual questions: It is possible that you will be asked questions that you are not fully prepared for. A good strategy is to think on your feet and briefly describe your approach or experience related to the topic.\n4. Show consistency in tone and emotions: Although your response had some positive emotions, it was also marked by some negative emotions (e.g., sadness in segment 3). Take a moment to compose yourself before responding.\n\nOverall Score: 6/10\n\nYou showed enthusiasm and a willingness to engage in the conversation, but your response lacked cohesion and clarity. Focus on structuring your response, providing clear examples of your skills, and maintaining a consistent tone, and you will see significant improvement.\n\n---\n\nInterviewer Response:\n\nNice to meet you, Arnav! I'm here today to get to know you better. Let's start by talking about your experience with web development. What's your background in building web applications, and what tools or technologies do you find particularly exciting to work with?\n\nPlease respond as if you were Arnav, and I will provide feedback on your response." }
interface Emotion {
    name: string;
    value: number;
}

interface AnalysisResult {
    emotions: Emotion[][];
    result: string;
}

const CulturalFitClient = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { startUpload } = useUploadThing("audioUploader");
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [progress, setProgress] = useState(0)
    const loading = useLoading();
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const startRecording = () => {
        setIsInterviewStarted(true)
        setAudioFile(null)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    const mediaRecorder = new MediaRecorder(stream);
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

                    mediaRecorder.start();
                    setIsRecording(true);
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
            loading.onOpen();
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress < 95) {
                        return prevProgress + 5; 
                    }
                    return prevProgress;
                });
            }, 2000);
            const response = await startUpload([file]);

            console.log("Upload successful:", response);

            if (response && response.length > 0) {
                const fileUrl = response[0].url;
                console.log("Upload successful:", fileUrl);
                setAudioUrl(fileUrl);
                await analyzeAudio(fileUrl);
            }
            clearInterval(interval);
            setProgress(100);
            loading.onClose();
        } catch (error) {
            console.error("Upload failed:", error);
            setError("Failed to upload audio. Please try again.");
        }
    };

    const analyzeAudio = async (audioUrl: string) => {
        try {
            const response = await fetch('/api/cultural-fit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audioUrl }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze audio');
            }

            const result = await response.json();

            const processedResult: AnalysisResult = {
                emotions: result.emotions.map((segment: string[]) => {
                    return segment.map((emotion: string) => {
                        const [name, valueStr] = emotion.split(': ');
                        return {
                            name,
                            value: parseFloat(valueStr)
                        };
                    });
                }),
                result: result.result
            };
            console.log('Original analysis result:', result);
            console.log(
                'Processed analysis result:',
                processedResult
            )
            setAnalysisResult(processedResult);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error analyzing audio:', error);
            setError('An error occurred while analyzing the audio. Please try again.');
        }
    };

    const formatResult = (result: string) => {
        return result.replace(/\n/g, '<br>').replace(/\*\*/g, '');
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-4xl shadow-xl">
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
                                <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready for Your Cultural Fit Analysis?</h2>
                                <p className="mb-6 text-gray-600">Click the button below to begin. You'll be presented with a series of questions to answer.</p>
                                <Button onClick={startRecording} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                    <Play className="mr-2 h-5 w-5" /> Get Started
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
                                    <Typewriter text={"Tell me about yourself"} />
                                </h2>

                                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
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
                                    {audioFile && !isRecording &&
                                        <div className="flex space-x-2">
                                            <Button onClick={() => { uploadAudio(audioFile) }} disabled={!audioFile} className="bg-green-500 hover:bg-green-600 text-white">
                                                <Send className="mr-2 h-4 w-4" /> Submit
                                            </Button>
                                        </div>
                                    }
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-4 p-4 bg-red-100 text-red-700 rounded-md"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                                {analysisResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-8"
                                    >
                                        <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
                                        <CulturalFitAnalysis emotions={analysisResult.emotions} />
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold mb-2">Summary</h3>
                                            <p
                                                className="text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: formatResult(analysisResult.result) }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
};

export default CulturalFitClient;
