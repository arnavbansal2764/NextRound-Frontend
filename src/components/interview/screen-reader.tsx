import React, { useEffect, useRef } from 'react';

const ELEVEN_LABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVEN_LABS_VOICE_ID || '';
const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || '';

interface QuestionReaderProps {
    question: string;
}


const QuestionReader: React.FC<QuestionReaderProps> = ({ question }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const convertTextToSpeech = async () => {
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'xi-api-key': ELEVEN_LABS_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: question,
                        model_id: 'eleven_flash_v2_5',
                        voice_settings: {
                            stability: 0.3,
                            similarity_boost: 0.90,
                        }
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to convert text to speech');
                }

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    await audioRef.current.play();
                }
            } catch (error) {
                console.error('Error converting text to speech:', error);
            }
        };

        if (question) {
            convertTextToSpeech();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, [question]);

    return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default QuestionReader;

