import { synthesizeSpeech } from '@/lib/polly_speech';
import React, { useEffect, useRef } from 'react';
interface QuestionReaderProps {
    question: string;
}


const QuestionReader: React.FC<QuestionReaderProps> = ({ question }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        const convertTextToSpeech = async () => {
            try {
                
                const audioUrl = await synthesizeSpeech(question);

                const audio = new Audio(audioUrl!); 
                audio.play();
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

