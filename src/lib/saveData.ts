import axios from 'axios';
import prisma from "@/lib/prisma";

interface AnalysisResult {
    result: string;
    primary_traits: string[];
    segment_secondary_traits: string[];
}

export async function sendDataToBackend(userId: string, data: any, type: 'interview' | 'cultural', resumeUrl?: string) {
    const payload = {
        userId,
        interviewData: type === 'interview' ? data : null,
        resumeUrl: type === 'interview' ? resumeUrl : null,
        culturalFitData: type === 'cultural' ? data : null,
    };

    try {
        const response = await axios.post('/api/savedata', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error('Failed to send data to backend');
    }
}

export async function saveCulturalFitResult(userId: string, analysisResult: AnalysisResult) {
    return await prisma.cultural.create({
        data: {
            userId,
            result: analysisResult.result,
            primaryTraits: analysisResult.primary_traits,
            segmentSecondaryTraits: analysisResult.segment_secondary_traits,
        },
    });
}

export async function saveInterviewResult(userId: string, analysisResult: string, resumeUrl: string) {
    return await prisma.interview.create({
        data: {
            userId,
            analysisResult,
            resumeUrl,
        },
    });
}