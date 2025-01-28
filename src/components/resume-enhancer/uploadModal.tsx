"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import FileDropzone from "./FileDropzone"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

export default function UploadModal({ isOpen, onClose, onUpload }:any) {
    const [file, setFile] = useState<File | null>(null)

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile)
    }

    const handleUpload = () => {
        if (file) {
            toast.promise(onUpload(file), {
                loading: "Uploading...",
                success: "Resume uploaded successfully!",
                error: "Failed to upload resume",
            })
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                Upload Resume
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <FileDropzone onFileSelect={handleFileSelect} />
                        <Button
                            onClick={handleUpload}
                            disabled={!file}
                            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                        >
                            Upload Resume
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

