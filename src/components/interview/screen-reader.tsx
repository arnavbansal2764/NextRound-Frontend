import React, { useEffect } from 'react';

interface QuestionReaderProps {
    question: string;
}

const QuestionReader: React.FC<QuestionReaderProps> = ({ question }) => {
    useEffect(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(question);

        const voices = synth.getVoices();

        // Attempt to select a female English voice
        const femaleVoice = voices.find(
            voice =>
                voice.lang.startsWith('en') &&
                (   voice.name.toLowerCase().includes("female") ||
                    voice.name.toLowerCase().includes("zira") ||
                    voice.name.toLowerCase().includes("susan") ||
                    voice.name.toLowerCase().includes("google uk english female"))
        );

        // Use the selected female voice or fall back to the first available voice
        utterance.voice = femaleVoice || voices[0];

        // Set speech properties
        utterance.pitch = 1.0; // Normal pitch
        utterance.rate = 1.0;  // Normal speed

        // Speak the question
        synth.speak(utterance);

        // Clean up on component unmount
        return () => {
            synth.cancel();
        };
    }, [question]);

    return null; // No UI needed
};

export default QuestionReader;
