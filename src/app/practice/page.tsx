"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { languages } from "@/lib/languages"
import Link from "next/link"
import { ArrowRight, Code, Sparkles } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"

export default function PracticePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  return (
    <>
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-16 relative z-10 mt-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 ">
            Choose Your Programming Language
          </h1>
          <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300">
            Select a language to start your practice interview
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          <AnimatePresence>
            {languages.map((lang) => (
              <motion.div
                key={lang.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${selectedLanguage === lang.name
                      ? "border-2 border-blue-500 dark:border-blue-400 shadow-lg"
                      : "hover:shadow-md"
                    }`}
                  onClick={() => setSelectedLanguage(lang.name)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <lang.icon className="w-16 h-16 mb-4 text-blue-500 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{lang.name}</h2>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedLanguage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <Link href={`/practice/${selectedLanguage}`} className="w-full max-w-md">
                <Button className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Practice Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Not sure where to start? Try our recommended path:
          </p>
          <Link href="/guidance">
            <Button variant="outline" className="text-lg py-4 px-8">
              <Code className="mr-2 h-5 w-5" />
              Recommended Learning Path
            </Button>
          </Link>
        </motion.div>
      </div>
    </>
  )
}

