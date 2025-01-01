// app/api/jobs/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Define the GET function to handle GET requests
export async function GET() {
  try {
    // Fetch all job listings from the database
    const jobs = await db.joblisting.findMany();
    // Return the jobs as a JSON response
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
