import { generateReactHelpers } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/core"
const { useUploadThing } = generateReactHelpers<OurFileRouter>()
export const uploadAudio = async (audio: File): Promise<string> => {
    const { startUpload } = useUploadThing("audioUploader")
    try {
        const response = await startUpload([audio]);

        console.log("Upload successful:", response);
        if (!response || response.length === 0) {
            return 'Error Uploading Audio';
        }

        const fileUrl = response[0].url;

        console.log("Upload successful:", fileUrl);

        return fileUrl;

    } catch (error) {
        console.error('Error uploading audio:', error);
        return 'Error Uploading Audio';
    }
}
