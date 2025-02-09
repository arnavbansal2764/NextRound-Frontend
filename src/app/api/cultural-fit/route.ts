import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('POST /api/cultural-fit');
        const { audio_url, question } = await req.json();

        if (!audio_url || !question) {
            return NextResponse.json({ type: 'ERROR', payload: 'Next error' }, { status: 400 });
        }

        const res = await axios.post('https://api.nextround.tech/culture-analysis', {
            audio_url,
            question
        });

        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        console.log('Cultural-fit \n', data.payload);

        return NextResponse.json(data.payload);
    } catch (error) {
        console.error('Error in cultural-fit API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}