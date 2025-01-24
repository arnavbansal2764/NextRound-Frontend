
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const client = new PollyClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    },
});

// Helper function to convert the Polly stream to a Blob-compatible format
async function streamToBlob(stream: ReadableStream): Promise<Blob> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;

    while (!done) {
        const { value, done: isDone } = await reader.read();
        if (value) chunks.push(value);
        done = isDone;
    }

    const audioBuffer = new Uint8Array(chunks.reduce((acc, chunk) => {
        const temp = new Uint8Array(acc.length + chunk.length);
        temp.set(acc, 0);
        temp.set(chunk, acc.length);
        return temp;
    }, new Uint8Array()));
    return new Blob([audioBuffer], { type: "audio/mpeg" });
}

export async function synthesizeSpeech(text: string): Promise<string | null> {
    const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: "mp3",
        VoiceId: "Joanna", // Change this to your preferred voice
    });

    try {
        const response = await client.send(command);

        if (response.AudioStream instanceof ReadableStream) {
            const blob = await streamToBlob(response.AudioStream); // Convert the stream to a Blob
            return URL.createObjectURL(blob); // Return a URL for the Blob
        } else {
            console.error("AudioStream is not a valid ReadableStream.");
            return null;
        }
    } catch (error) {
        console.error("Error synthesizing speech:", error);
        return null;
    }
}
