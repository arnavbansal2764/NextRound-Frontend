import { synthesizeSpeech } from '@/lib/polly_speech';
import { useEffect, useRef, useState } from 'react';

interface QuestionReaderProps {
    question: string;
    questionRead: boolean;
    setQuestionRead: (value: boolean) => void;
}

const QuestionReader: React.FC<QuestionReaderProps> = ({ 
    question, 
    questionRead, 
    setQuestionRead 
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousQuestionRef = useRef<string>("");
    const [isPlaying, setIsPlaying] = useState(false);

    const stopCurrentAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            setIsPlaying(false);
            setQuestionRead(false);
        }
    };

    useEffect(() => {
        const convertTextToSpeech = async () => {
            try {
                // Don't process if already playing or no question
                if (isPlaying || !question || question === previousQuestionRef.current || questionRead) {
                    return;
                }

                // Stop any existing audio
                stopCurrentAudio();

                console.log('Converting new question to speech:', question);
                previousQuestionRef.current = question;
                
                const audioUrl = await synthesizeSpeech(question);
                if (!audioUrl) {
                    console.error('Failed to generate audio URL');
                    return;
                }

                // Create new audio instance
                const audio = new Audio();
                audioRef.current = audio;

                // Set up event listeners
                audio.addEventListener('loadeddata', () => {
                    console.log('Audio loaded and ready to play');
                });

                audio.addEventListener('play', () => {
                    console.log('Started playing question');
                    setIsPlaying(true);
                    setQuestionRead(true);
                });

                audio.addEventListener('ended', () => {
                    console.log('Finished playing question');
                    setIsPlaying(false);
                    setQuestionRead(false);
                    audio.src = '';
                });

                audio.addEventListener('error', (error) => {
                    console.error('Audio playback error:', error);
                    setIsPlaying(false);
                    setQuestionRead(false);
                });

                // Set source and play
                audio.src = audioUrl;
                
                try {
                    await audio.play();
                } catch (playError) {
                    console.error('Play error:', playError);
                    stopCurrentAudio();
                }

            } catch (error) {
                console.error('Error in text to speech conversion:', error);
                stopCurrentAudio();
            }
        };

        convertTextToSpeech();

        // Cleanup function
        return () => {
            stopCurrentAudio();
            if (audioRef.current) {
                audioRef.current.removeEventListener('play', () => {});
                audioRef.current.removeEventListener('ended', () => {});
                audioRef.current.removeEventListener('error', () => {});
            }
        };
    }, [question]); // Only depend on question changes

    // Allow manual stopping of audio from parent
    useEffect(() => {
        if (!questionRead && isPlaying) {
            stopCurrentAudio();
        }
    }, [questionRead]);

    return null;
};

export default QuestionReader;
