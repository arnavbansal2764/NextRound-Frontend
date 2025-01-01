import { NextResponse } from 'next/server';

import { RedisManager } from '@/lib/redis/RedisManagerOther';
import { GET_INTERVIEW_ANALYSIS } from '@/lib/redis/types';


export async function POST(request: Request) {
    try {
        // Instead of extracting question and transcript directly, expect responses
        const { responses } = await request.json();

        // Sending responses to the Python backend as an array

        const res = await RedisManager.getInstance().sendAndAwait({
            type: GET_INTERVIEW_ANALYSIS,
            data: {
                question_responses: responses,
            },
          })
          console.log('Analyze responses \n', res.payload);
        return NextResponse.json(res.payload);

    } catch (error) {
        console.error('Error analyzing responses:', error);
        return NextResponse.json({ error: 'Failed to analyze responses' }, { status: 500 });
    }

}

