"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { usePDF } from "react-to-pdf"
import { Button } from "@/components/ui/button"

export default function ResumeContent({ content }:any) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const { toPDF, targetRef } = usePDF({ filename: "enhanced_resume.pdf" })

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        await toPDF()
        setIsGeneratingPDF(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    Enhanced Resume
                </h2>
                <Button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600"
                >
                    {isGeneratingPDF ? (
                        <motion.div
                            className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        ></motion.div>
                    ) : (
                        <Download className="mr-2" size={18} />
                    )}
                    Download PDF
                </Button>
            </div>
            <div ref={targetRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </motion.div>
    )
}

