"use client"
import InterviewClient from "@/components/interview/interview-page";
import { useState } from "react";

export default function InterviewPage() {
    const [status, setStatus] = useState<boolean>(true);
    const maxAllowedSwitches = 3;

    const handleViolation = (switchCount: number): void => {
        if (switchCount >= maxAllowedSwitches) {
            setStatus(false);
        } else {
            alert(`Tab switch detected! You have ${maxAllowedSwitches - switchCount} chances left.`);
        }
    };
    return (
        <div className="mx-auto min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-primary-foreground py-12 md:py-24 lg:py-32">
            <InterviewClient />
        </div>
    );
}
