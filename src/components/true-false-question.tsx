'use client'

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface TrueFalseQuestionProps {
  question?: string
  onSubmit?: (answer: boolean | null) => void
}

export function TrueFalseQuestion({ 
  question = "Is React a JavaScript library for building user interfaces?",
  onSubmit
}: TrueFalseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSubmit = () => {
    setSubmitted(true)
    if (onSubmit) {
      onSubmit(selectedAnswer)
    }
    // Provide feedback based on the answer
    setFeedback(selectedAnswer === true ? "Correct!" : "Incorrect. Try again!")
  }

  const handleReset = () => {
    setSelectedAnswer(null)
    setSubmitted(false)
    setFeedback(null)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">{question}</h2>
        {!submitted ? (
          <>
            <RadioGroup
              onValueChange={(value) => setSelectedAnswer(value === "true")}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" className="border-white text-white" />
                <Label htmlFor="true" className="text-white">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" className="border-white text-white" />
                <Label htmlFor="false" className="text-white">False</Label>
              </div>
            </RadioGroup>
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-white text-blue-600 hover:bg-blue-100 transition-colors"
              disabled={selectedAnswer === null}
            >
              Submit
            </Button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-white text-xl mb-4">{feedback}</p>
            <Button 
              onClick={handleReset} 
              className="bg-white text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Try Another Question
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}