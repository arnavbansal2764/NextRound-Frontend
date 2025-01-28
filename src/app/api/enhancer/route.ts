import { RedisManager } from '@/lib/redis/RedisManagerEnhancer';
import { GET_ENHANCER } from '@/lib/redis/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('POST /api/enhancer');
        const { resumeUrl, jobDescription } = await req.json();
        if(!resumeUrl || !jobDescription) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }
        const res = await RedisManager.getInstance().sendAndAwait({
            type: GET_ENHANCER,
            data: {
                resumeUrl: resumeUrl,
                jobDescription: jobDescription,
            },
        })
        console.log('Resume Enhancer \n', res.payload);

        return NextResponse.json(res.payload);
    } catch (error) {
        console.error('Error in Resume Enhancer API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

