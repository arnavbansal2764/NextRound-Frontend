import { useEffect, useState } from 'react';

interface TabMonitorProps {
    onViolation: (switchCount: number) => void;
}

const TabMonitor: React.FC<TabMonitorProps> = ({ onViolation }) => {
    const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabSwitchCount((prevCount) => {
                    const newCount = prevCount + 1;
                    onViolation(newCount); // Trigger the violation callback
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [onViolation]);

    return null;
};

export default TabMonitor;