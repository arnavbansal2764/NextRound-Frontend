"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GradientBackground } from "./gradient-background"
import { Mic, MicOff, MessageSquare, Play, Pause, Volume2, VolumeX, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function InterviewSimulation() {
    const [step, setStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [activePanelist, setActivePanelist] = useState(0)
    const audioVisualizerRef = useRef<HTMLCanvasElement | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    const panelists = [
        {
            name: "Dr. Sharma",
            role: "Chairperson",
            avatar: "/placeholder.svg?height=128&width=128&text=DS",
            color: "from-emerald-400 to-emerald-600",
        },
        {
            name: "Prof. Kumar",
            role: "Subject Expert",
            avatar: "/placeholder.svg?height=128&width=128&text=PK",
            color: "from-blue-400 to-blue-600",
        },
        {
            name: "Mrs. Gupta",
            role: "Civil Services Expert",
            avatar: "/placeholder.svg?height=128&width=128&text=MG",
            color: "from-purple-400 to-purple-600",
        },
        {
            name: "Mr. Singh",
            role: "Current Affairs Expert",
            avatar: "/placeholder.svg?height=128&width=128&text=MS",
            color: "from-red-400 to-red-600",
        },
    ]

    const questions = [
        "What motivated you to join the civil services?",
        "How would you handle a conflict between local interests and national policy?",
        "What administrative reforms would you suggest for better governance?",
        "How do you stay updated with current affairs and policy changes?",
    ]

    // Start the simulation
    const startSimulation = () => {
        setIsPlaying(true)
        setStep(1)

        // Simulate the interview flow
        const timers = [
            setTimeout(() => {
                setCurrentQuestion(questions[0])
                setActivePanelist(0)
            }, 1000),
            setTimeout(() => {
                setStep(2)
            }, 5000),
            setTimeout(() => {
                setCurrentQuestion(questions[1])
                setActivePanelist(1)
            }, 8000),
            setTimeout(() => {
                setStep(3)
            }, 12000),
            setTimeout(() => {
                setCurrentQuestion(questions[2])
                setActivePanelist(2)
            }, 15000),
            setTimeout(() => {
                setStep(4)
            }, 19000),
            setTimeout(() => {
                setCurrentQuestion(questions[3])
                setActivePanelist(3)
            }, 22000),
            setTimeout(() => {
                setStep(5)
            }, 26000),
            setTimeout(() => {
                setIsPlaying(false)
                setStep(0)
                setCurrentQuestion("")
            }, 30000),
        ]

        return () => {
            timers.forEach((timer) => clearTimeout(timer))
        }
    }

    // Reset the simulation
    const resetSimulation = () => {
        setIsPlaying(false)
        setStep(0)
        setCurrentQuestion("")
        setActivePanelist(0)
    }

    // Toggle play/pause
    const togglePlay = () => {
        if (isPlaying) {
            resetSimulation()
        } else {
            startSimulation()
        }
    }

    // Audio visualizer effect
    useEffect(() => {
        if (!audioVisualizerRef.current || !isPlaying || isMuted) return

        const canvas = audioVisualizerRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const drawVisualizer = () => {
            const width = canvas.width
            const height = canvas.height

            ctx.clearRect(0, 0, width, height)

            // Draw audio waves (simulated)
            ctx.beginPath()
            ctx.strokeStyle = "#10b981" // Green color
            ctx.lineWidth = 2

            const segments = 20
            const segmentWidth = width / segments

            ctx.moveTo(0, height / 2)

            for (let i = 0; i <= segments; i++) {
                const x = i * segmentWidth
                // Generate random heights for the wave effect
                const randomFactor = isPlaying && !isMuted ? Math.random() * 0.5 + 0.5 : 0.1
                const y = height / 2 + Math.sin(Date.now() * 0.005 + i * 0.5) * height * 0.2 * randomFactor
                ctx.lineTo(x, y)
            }

            ctx.stroke()

            animationFrameRef.current = requestAnimationFrame(drawVisualizer)
        }

        drawVisualizer()

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isPlaying, isMuted])

    return (
        <section className="relative py-24 overflow-hidden">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600">
                        Experience a Live Interview
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        See how our AI-powered interview simulation works with this interactive demo
                    </p>
                </motion.div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-900/60 text-green-300 border-green-700">
                                {isPlaying ? "Live Interview" : "Demo Mode"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 border-gray-700"
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 border-gray-700"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left side - Panelists */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Interview Panel</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {panelists.map((panelist, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border ${activePanelist === index && isPlaying
                                                    ? "border-green-500 shadow-lg shadow-green-500/20"
                                                    : "border-gray-200 dark:border-gray-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 border-2 border-gray-300 dark:border-gray-700">
                                                    <AvatarImage src={panelist.avatar} alt={panelist.name} />
                                                    <AvatarFallback className={`bg-gradient-to-r ${panelist.color} text-white`}>
                                                        {panelist.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{panelist.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{panelist.role}</p>
                                                </div>
                                            </div>

                                            {activePanelist === index && isPlaying && (
                                                <div className="mt-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-3 py-1.5 rounded-md border border-green-200 dark:border-green-800/50 flex items-center">
                                                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                                    Speaking
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Current question */}
                                <div className="mt-6">
                                    <AnimatePresence mode="wait">
                                        {currentQuestion && (
                                            <motion.div
                                                key={currentQuestion}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                            >
                                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Question:</h4>
                                                <p className="text-gray-900 dark:text-gray-100">{currentQuestion}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!currentQuestion && !isPlaying && (
                                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
                                            <p className="flex items-center">
                                                <Play className="h-4 w-4 mr-2" />
                                                Click the play button to start the interview simulation
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right side - Candidate */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Candidate</h3>
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-gray-300 dark:border-gray-700">
                                                <AvatarImage src="/placeholder.svg?height=128&width=128&text=C" alt="Candidate" />
                                                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                                                    C
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">You</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Candidate</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`
                      ${isMuted
                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50"
                                                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50"
                                                }
                    `}
                                        >
                                            {isMuted ? "Muted" : "Speaking"}
                                        </Badge>
                                    </div>

                                    <div className="h-40 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                        <User className="h-16 w-16 text-gray-400" />
                                    </div>

                                    {/* Audio visualizer */}
                                    {isPlaying && (
                                        <div className="p-4">
                                            <canvas ref={audioVisualizerRef} width="300" height="60" className="w-full" />
                                        </div>
                                    )}

                                    <div className="p-4 flex justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`${isMuted
                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                                }`}
                                            onClick={() => setIsMuted(!isMuted)}
                                        >
                                            {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                                            {isMuted ? "Unmute" : "Mute"}
                                        </Button>
                                        <Button variant="outline" size="sm" className="bg-gray-200 dark:bg-gray-700">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Chat
                                        </Button>
                                    </div>
                                </div>

                                {/* Interview progress */}
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Interview Progress:</h4>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${step * 20}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Start</span>
                                        <span>End</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        <Button
                            onClick={togglePlay}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Stop Simulation
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Simulation
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        This is just a demo. The actual interview experience is much more comprehensive and personalized.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90">
                        Try the Full Experience
                    </Button>
                </div>
            </div>
        </section>
    )
}

