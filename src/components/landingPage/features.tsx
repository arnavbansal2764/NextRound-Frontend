"use client"

import { motion, useAnimation } from "framer-motion"
import { Code2, Users2, Brain, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { GradientBackground } from "./gradientbg"
import { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

export default function Features() {
  const features = [
    {
      icon: <Code2 className="h-12 w-12 text-purple-500" />,
      title: "Technical Interview Preparation",
      description: "Practice coding challenges, system design questions, and get real-time feedback on your solutions.",
      items: [
        "In-depth code analysis",
        "System design exercises",
        "Algorithm optimization tips",
        "Real-world problem scenarios",
      ],
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Users2 className="h-12 w-12 text-blue-500" />,
      title: "Behavioral Interview Training",
      description: "Master the art of behavioral interviews with our comprehensive preparation system.",
      items: [
        "STAR method coaching",
        "Common question practice",
        "Response structure guidance",
        "Communication skills enhancement",
      ],
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <Brain className="h-12 w-12 text-green-500" />,
      title: "Cultural Fit Assessment",
      description: "Understand company cultures and assess your alignment with potential employers.",
      items: [
        "Company values analysis",
        "Work style evaluation",
        "Team dynamics insights",
        "Cultural adaptation strategies",
      ],
      color: "from-green-400 to-green-600",
    },
  ]

  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <section className="relative py-32 overflow-hidden perspective-1000">
      <GradientBackground />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-green-600">
            Comprehensive Interview Preparation
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to succeed in your next interview, from technical skills to cultural fit.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5, z: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                    className={`mb-6 inline-block p-4 rounded-full bg-gradient-to-br ${feature.color}`}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3
                    className={`text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${feature.color}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 + itemIndex * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle2
                          className={`h-6 w-6 text-${feature.color.split("-")[1]}-500 mt-0.5 flex-shrink-0`}
                        />
                        <span className="text-gray-700 dark:text-gray-200">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

