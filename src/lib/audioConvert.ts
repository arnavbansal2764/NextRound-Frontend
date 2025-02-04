import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: "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", dangerouslyAllowBrowser: true });

interface TranscriptResponse {
    text: string;
}

export const getTranscript = async (audio: File): Promise<string> => {
    try {
        const transcription: TranscriptResponse = await groq.audio.transcriptions.create({
            file: audio,
            model: 'distil-whisper-large-v3-en',
            response_format: 'verbose_json',
        });
        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
};
