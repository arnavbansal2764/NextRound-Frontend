import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export const useAudioUpload = () => {
    const { startUpload } = useUploadThing("audioUploader");

    const uploadAudio = async (audio: File): Promise<string> => {
        try {
            const response = await startUpload([audio]);

            console.log("Upload successful:", response);
            if (!response || response.length === 0) {
                throw new Error('Error Uploading Audio');
            }

            const fileUrl = response[0].url;

            console.log("Upload successful:", fileUrl);

            return fileUrl;
        } catch (error) {
            console.error('Error uploading audio:', error);
            throw new Error('Error Uploading Audio');
        }
    };

    return { uploadAudio };
};