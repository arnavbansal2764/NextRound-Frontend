
import { RedisManager } from '@/lib/redis/RedisManagerColdApproach';
import { GET_COLD_APPROACH } from '@/lib/redis/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('POST /api/cold-approach');
        const { user_info, job_description, approach_platform } = await req.json();
        if(!user_info || !job_description || !approach_platform) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
        const res = await RedisManager.getInstance().sendAndAwait({
            type: GET_COLD_APPROACH,
            data: {
                user_info,
                job_description,
                approach_platform
            },
        })
        console.log('Resume Enhancer \n', res.payload);

        return NextResponse.json(res.payload);
    } catch (error) {
        console.error('Error in Resume Enhancer API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

