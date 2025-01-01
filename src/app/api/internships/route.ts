import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const interns = await db.joblisting.findMany({
            where: {
                jobType: 'Internship',
            },
        });
        return NextResponse.json(interns);
    } catch (error) {
        console.error('Error fetching interns:', error);

        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

}
