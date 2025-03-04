import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // console.log('POST /api/enhancer');
        const { resumeUrl, jobDescription } = await req.json();
        if (!resumeUrl || !jobDescription) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }

        const res = await axios.post('https://api.nextround.tech/resume-enhancer',
            {
                resumeUrl,
                jobDescription
            }
        )
        // console.log('Resume Enhancer \n', res.data.payload);

        return NextResponse.json(res.data.payload);
    } catch (error) {
        console.error('Error in Resume Enhancer API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

