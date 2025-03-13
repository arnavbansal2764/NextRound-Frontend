"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { ImageIcon } from "lucide-react"

interface ImageDropzoneProps {
    onFileSelect: (file: File) => void
    maxSizeMB?: number
    className?: string
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onFileSelect, maxSizeMB = 5, className = "" }) => {
    const maxSize = maxSizeMB * 1024 * 1024 // Convert MB to bytes

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0])
            }
        },
        [onFileSelect],
    )

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/webp": [".webp"],
        },
        maxFiles: 1,
        maxSize: maxSize,
    })

    const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].file.size > maxSize

    return (
        <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${isDragActive
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-600/50 hover:border-blue-500/70 hover:bg-blue-900/10"
                } ${className}`}
        >
            <input {...getInputProps()} />
            <ImageIcon className="mx-auto h-12 w-12 text-blue-400/80" />
            <p className="mt-3 text-sm text-gray-300">
                {isDragActive ? "Drop the image here" : "Drag and drop an image here, or click to select a file"}
            </p>
            <p className="mt-1 text-xs text-gray-400">Supported formats: JPG, PNG, GIF, WEBP (max {maxSizeMB}MB)</p>
            {isFileTooLarge && <p className="mt-2 text-xs text-red-400">File is too large. Maximum size is {maxSizeMB}MB.</p>}
        </div>
    )
}

export default ImageDropzone

