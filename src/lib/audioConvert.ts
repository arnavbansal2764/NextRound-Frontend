import useLoading from '@/hooks/useLoading';
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
    apiKey: 'bb271ed936ba4dc187ee92958fe1ebc7',
});

interface TranscriptResponse {
    text: string;
}

export const getTranscript = async (audioUrl: string): Promise<string> => {
    const data = {
        audio: audioUrl
    };

    try {
        //@ts-ignore
        const transcript: TranscriptResponse = await client.transcripts.transcribe(data);
        return transcript.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to transcribe audio");
    }
};
