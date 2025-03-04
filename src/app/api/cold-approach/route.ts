
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // console.log('POST /api/cold-approach');
        const { user_info, job_description, approach_platform } = await req.json();
        if (!user_info || !job_description || !approach_platform) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
        const res = await axios.post('https://api.nextround.tech/cold-approach',
            {
                user_info,
                job_description,
                approach_platform
            }
        )
        // console.log('Cold Approach \n', res.data);

        return NextResponse.json(res.data.payload);
    } catch (error) {
        console.error('Error in Resume Enhancer API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

