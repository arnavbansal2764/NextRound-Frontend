import { synthesizeSpeech } from '@/lib/polly_speech';
import { useEffect, useRef } from 'react';

interface QuestionReaderProps {
    question: string;
    questionRead: boolean;
    setQuestionRead: (value: boolean) => void;
}

const QuestionReader: React.FC<QuestionReaderProps> = ({ question, questionRead, setQuestionRead }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const convertTextToSpeech = async () => {
            try {
                if (!questionRead) {
                    const audioUrl = await synthesizeSpeech(question);
                    const audio = new Audio(audioUrl!);
                    audioRef.current = audio;

                    audio.onplay = () => {
                        setQuestionRead(true);
                    };

                    audio.onended = () => {
                        setQuestionRead(false);
                    };

                    audio.play();
                }
            } catch (error) {
                console.error('Error converting text to speech:', error);
                setQuestionRead(false);
            }
        };

        if (question) {
            convertTextToSpeech();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                setQuestionRead(false);
            }
        };
    }, [question, setQuestionRead]);

    return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default QuestionReader;
