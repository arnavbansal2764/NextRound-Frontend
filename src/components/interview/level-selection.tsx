import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Trophy } from 'lucide-react';

interface LevelSelectionModalProps {
    onSelect: (level: number) => void;
}

const LevelSelectionModal: React.FC<LevelSelectionModalProps> = ({ onSelect }) => {
    const levels = [
        { text: 'Entry-Level', icon: GraduationCap },
        { text: 'Intermediate', icon: Briefcase },
        { text: 'Senior Positions', icon: Trophy },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
            >
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-6 text-center text-gray-800"
                >
                    What level of position are you targeting?
                </motion.h2>
                <div className="space-y-4">
                    {levels.map((level, index) => (
                        <motion.div
                            key={level.text}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Button
                                onClick={() => onSelect(index)}
                                className="w-full py-3 text-lg text-gray-800 flex items-center justify-center"
                                variant="outline"
                            >
                                <level.icon className="mr-2 h-5 w-5" />
                                {level.text}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LevelSelectionModal;

