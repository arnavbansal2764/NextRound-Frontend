import { useState } from "react";
import TabMonitor from '@/lib/proctocter/TabMonitor';

export default function Proc({ children }: { children: React.ReactNode }){
    const [status, setStatus] = useState<boolean>(true);
    const maxAllowedSwitches = 3;

    const handleViolation = (switchCount: number): void => {
        if (switchCount > maxAllowedSwitches) {
            setStatus(false);
        } else {
            alert(`Tab switch detected! You have ${maxAllowedSwitches - switchCount} chances left.`);
        }
    };

    return (
        <>
            {status ? children : <p>You have exceeded the maximum number of tab switches allowed.</p>}
            <TabMonitor onViolation={handleViolation} />
        </>
    );
}
