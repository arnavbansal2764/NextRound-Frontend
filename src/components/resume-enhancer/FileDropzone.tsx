"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { FiUploadCloud } from "react-icons/fi"

interface FileDropzoneProps {
    onFileSelect: (file: File) => void
}

export default function FileDropzone({ onFileSelect }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0]
                setFileName(file.name)
                onFileSelect(file)
            }
        },
        [onFileSelect],
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0]
                setFileName(file.name)
                onFileSelect(file)
            }
        },
        [onFileSelect],
    )

    return (
        <motion.div
            className={`w-full p-8 rounded-lg border-2 border-dashed transition-colors duration-300 ease-in-out ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                    className="mb-4 text-blue-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                >
                    <FiUploadCloud size={48} />
                </motion.div>
                <motion.p
                    className="mb-2 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {fileName ? `Selected file: ${fileName}` : "Drag & drop your resume here, or click to select"}
                </motion.p>
                <motion.input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    id="fileInput"
                    accept=".pdf,.doc,.docx"
                    whileTap={{ scale: 0.95 }}
                />
                <motion.label
                    htmlFor="fileInput"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Select File
                </motion.label>
            </div>
        </motion.div>
    )
}

