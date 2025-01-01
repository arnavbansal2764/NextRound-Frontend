"use client"
import { useState } from 'react';
import TabMonitor from '@/lib/proctocter/TabMonitor';

const InterviewPage: React.FC = () => {
    const [status, setStatus] = useState<string>('Interview is in progress');
    const maxAllowedSwitches = 2;

    const handleViolation = (switchCount: number): void => {
        if (switchCount > maxAllowedSwitches) {
            setStatus('Interview ended due to tab switching violations.');
        } else {
            alert(`Tab switch detected! You have ${maxAllowedSwitches - switchCount} chances left.`);
        }
    };

    return (
        <div>
            <h1>Welcome to the AI Interview</h1>
            <p>{status}</p>
            <TabMonitor onViolation={handleViolation} />
        </div>
    );
};

export default InterviewPage;