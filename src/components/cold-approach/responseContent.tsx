"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clipboard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ResponseContent({ content, platform }:any) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy text: ", err)
        }
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
                    {platform === "email" ? "Email Content" : "LinkedIn Message"}
                </h2>
                <Button
                    onClick={handleCopyToClipboard}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600"
                >
                    {isCopied ? (
                        <>
                            <Check className="mr-2" size={18} />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Clipboard className="mr-2" size={18} />
                            Copy to Clipboard
                        </>
                    )}
                </Button>
            </div>
            <div
                className={`p-6 rounded-lg ${platform === "email" ? "bg-gray-100 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-900"}`}
            >
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200">{content}</pre>
            </div>
        </motion.div>
    )
}

