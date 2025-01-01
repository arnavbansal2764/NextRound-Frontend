'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface MCQProps {
  question?: string
  options?: string[]
  correctAnswer?: number
}

export function McqComponent({ 
  question = "What is the capital of France?",
  options = ["London", "Berlin", "Paris", "Madrid"],
  correctAnswer = 2
}: MCQProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (index: number) => {
    setSelectedAnswer(index)
    setShowResult(false)
  }

  const handleSubmit = () => {
    setShowResult(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">{question}</h2>
        <div className="space-y-4">
          {options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full text-left p-4 rounded-lg text-white transition-colors ${
                selectedAnswer === index
                  ? 'bg-white bg-opacity-30'
                  : 'bg-white bg-opacity-10 hover:bg-opacity-20'
              }`}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(index)}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <motion.button
          className="mt-6 w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
        >
          Submit
        </motion.button>
        {showResult && (
          <p className={`mt-4 text-center font-semibold ${
            selectedAnswer === correctAnswer ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedAnswer === correctAnswer ? 'Correct!' : 'Incorrect. Try again!'}
          </p>
        )}
      </div>
    </div>
  )
}