import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

const StartInterview = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        //@ts-ignore
        await loadFull(engine);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <motion.div
                className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative w-[400px] h-[400px]">
                    <Particles
                        id="tsparticles"
                        init={particlesInit}
                        options={{
                            fullScreen: { enable: false },
                            background: {
                                color: {
                                    value: "transparent",
                                },
                            },
                            fpsLimit: 120,
                            interactivity: {
                                events: {
                                    onClick: {
                                        enable: false,
                                        mode: "push",
                                    },
                                    onHover: {
                                        enable: true,
                                        mode: "repulse",
                                    },
                                    resize: true,
                                },
                                modes: {
                                    push: {
                                        quantity: 4,
                                    },
                                    repulse: {
                                        distance: 100,
                                        duration: 0.4,
                                    },
                                },
                            },
                            particles: {
                                color: {
                                    value: "#ffffff",
                                },
                                links: {
                                    color: "#ffffff",
                                    distance: 150,
                                    enable: true,
                                    opacity: 0.5,
                                    width: 1,
                                },
                                collisions: {
                                    enable: true,
                                },
                                move: {
                                    direction: "none",
                                    enable: true,
                                    outModes: {
                                        default: "bounce",
                                    },
                                    random: false,
                                    speed: 1,
                                    straight: false,
                                },
                                number: {
                                    density: {
                                        enable: true,
                                        area: 800,
                                    },
                                    value: 80,
                                },
                                opacity: {
                                    value: 0.5,
                                },
                                shape: {
                                    type: "circle",
                                },
                                size: {
                                    value: { min: 1, max: 5 },
                                },
                            },
                            detectRetina: true,
                        }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <motion.svg
                            width="150"
                            height="150"
                            viewBox="0 0 200 200"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4F46E5">
                                        <animate attributeName="stop-color" values="#4F46E5; #9333EA; #4F46E5" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="100%" stopColor="#9333EA">
                                        <animate attributeName="stop-color" values="#9333EA; #4F46E5; #9333EA" dur="4s" repeatCount="indefinite" />
                                    </stop>
                                </linearGradient>
                            </defs>
                            <motion.circle
                                cx="100"
                                cy="100"
                                r="80"
                                stroke="url(#gradient)"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray="502"
                                strokeDashoffset="502"
                                animate={{
                                    strokeDashoffset: [502, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            />
                            <motion.circle
                                cx="100"
                                cy="100"
                                r="60"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray="377"
                                strokeDashoffset="377"
                                animate={{
                                    strokeDashoffset: [377, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: 0.5,
                                }}
                            />
                            <motion.circle
                                cx="100"
                                cy="100"
                                r="40"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray="251"
                                strokeDashoffset="251"
                                animate={{
                                    strokeDashoffset: [251, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: 1,
                                }}
                            />
                        </motion.svg>

                        <motion.div className="mt-4 flex space-x-2">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: index * 0.2,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StartInterview;
