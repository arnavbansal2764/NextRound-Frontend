"use client"

import { motion, useAnimation } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientBackground } from "./gradientbg"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Quote } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "NextRound's technical interview preparation was instrumental in helping me land my dream job. The AI-powered feedback system helped me identify and improve my weak areas.",
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager at Meta",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The cultural fit assessment gave me invaluable insights into company cultures. I was much more confident in my interviews knowing I aligned well with the company values.",
    },
    {
      name: "Emily Watson",
      role: "Data Scientist at Amazon",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The combination of technical and behavioral interview preparation made all the difference. I felt prepared for every aspect of the interview process.",
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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hear from candidates who landed their dream jobs with NextRound's innovative interview preparation platform.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          ref={ref}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 border-4 border-purple-200 dark:border-purple-900">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="font-semibold text-lg">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex-grow relative">
                    <Quote className="absolute top-0 left-0 h-8 w-8 text-purple-300 dark:text-purple-700 -translate-x-4 -translate-y-4" />
                    <p className="text-gray-700 dark:text-gray-300 italic relative z-10">{testimonial.quote}</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <motion.div
                      className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "4rem" }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

