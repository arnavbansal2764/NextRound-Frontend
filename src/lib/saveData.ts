import axios from 'axios';
import prisma from "@/lib/prisma";
import { Segment, SegmentSecondaryTrait } from './redis/types';

interface CulturalScore {
    question: string
    refrenceAnswer: string
    score: number
}

interface CulturalFitAnalysisProps {
    result: string
    primary_traits: Segment[]
    segment_secondary_traits: SegmentSecondaryTrait[]
    scores: {
        totalScore: number
        averageScore: number
        scores: CulturalScore[]
    }
}

interface Score {
  question: string;
  answer: string;
  code: string;
  refrenceAnswer: string;
  score: number;
}

interface PracticeInterviewResult {
  analysis: string;
  scores: Score[];
  averageScore: number;
  totalScore: number;
  level: string;
  totalQuestions: number;
}

export async function sendDataToBackend(userId: string, data: any, type: 'interview' | 'cultural' | 'practice-interview', resumeUrl?: string) {
    const payload = {
        userId,
        interviewData: type === 'interview' ? data : null,
        resumeUrl: type === 'interview' ? resumeUrl : null,
        culturalFitData: type === 'cultural' ? data : null,
        practiceInterviewData: type === 'practice-interview' ? data : null
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

export async function saveCulturalFitResult(userId: string, analysisResult: CulturalFitAnalysisProps) {
    return await prisma.cultural.create({
        data: {
            userId,
            result: analysisResult.result,
            //@ts-ignore
            primaryTraits: analysisResult.primary_traits,
            //@ts-ignore
            segmentSecondaryTraits: analysisResult.segment_secondary_traits,
            //@ts-ignore
            scores: analysisResult.scores,
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

export async function savePracticeInterviewResult(userId: string, analysisResult: PracticeInterviewResult,level: string,totalQuestions: number) {
    return await prisma.practiceInterview.create({
        data: {
            userId,
            analysis: analysisResult.analysis,
            //@ts-ignore
            scores: analysisResult.scores,
            averageScore: analysisResult.averageScore,
            totalScore: analysisResult.totalScore,
            level,
            totalQuestions
        },
    });
}