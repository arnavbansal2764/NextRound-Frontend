import { NextRequest, NextResponse } from "next/server";
import { saveCulturalFitResult, saveInterviewResult } from "@/lib/saveData";

export async function POST(req: NextRequest) {
    const { userId, interviewData, resumeUrl, culturalFitData } = await req.json();

    try {
        let result;
        if (interviewData) {
            result = await saveInterviewResult(userId, interviewData, resumeUrl);
        } else if (culturalFitData) {
            result = await saveCulturalFitResult(userId, culturalFitData);
        } else {
            throw new Error('No valid data provided');
        }

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error('Error saving data:', error);
        return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
    }
}
