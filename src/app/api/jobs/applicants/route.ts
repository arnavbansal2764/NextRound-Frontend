// Import necessary modules
import { db } from "@/lib/db";
import { currentUserData } from "@/lib/profile/currentUserData";
import { NextResponse } from "next/server";


export async function POST(req:Request) {
    const {jobId} = await req.json();
    const users = await db.userApplications.findMany({
        where: {
          joblistingId: jobId,
        },
        include: {
          userData: true,
        },
      });

      return NextResponse.json({users})
}

export async function GET() {
  const userData = await currentUserData();
  const jobListings = await db.joblisting.findMany({
    where: {
      recruiterId: userData?.[0]?.userId,
    },
  });
  console.log(jobListings)
  return NextResponse.json({ jobListings });
}