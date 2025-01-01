'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Course {
  courseName: string
  courseLink: string
}

interface ApiResponse {
  courses: Course[]
}

export default function CareerGuidancePage() {
  const [currentStatus, setCurrentStatus] = useState('')
  const [endGoal, setEndGoal] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const promise = axios.post<ApiResponse>('/api/ai/checkpoint', { currentStatus, endGoal })

    toast.promise(
      promise,
      {
        loading: 'Analyzing your career path...',
        success: 'Career guidance ready!',
        error: 'Failed to analyze. Please try again.',
      }
    )

    try {
      const { data } = await promise
      setCourses(data.courses)
    } catch (error) {
      console.error('Error fetching career guidance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pt-8"
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-16">
          <motion.h1
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Career Guidance
          </motion.h1>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Discover your path to success with personalized course recommendations
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Career Journey</CardTitle>
              <CardDescription>Tell us about your current status and future goals</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStatus">Current Status</Label>
                  <Input
                    id="currentStatus"
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    placeholder="e.g., Junior Developer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endGoal">End Goal</Label>
                  <Input
                    id="endGoal"
                    value={endGoal}
                    onChange={(e) => setEndGoal(e.target.value)}
                    placeholder="e.g., Senior Full Stack Developer"
                    required
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Get Career Guidance'}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {courses.length > 0 && (
            <motion.div
              key="courses"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h2 className="text-2xl font-bold mb-4">Recommended Courses</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{course.courseName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.a
                          href={course.courseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-block"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          View Course
                        </motion.a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

