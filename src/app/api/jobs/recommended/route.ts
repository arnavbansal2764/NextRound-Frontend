import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { currentUserData } from "@/lib/profile/currentUserData";

interface JobListing {
  id: string;
  recruiterId: string;
  description: string;
  responsibilities: string;
  requirements: string;
  experience: string;
  location: string;
  jobType: string;
  mode: string;
  organization: string;
  title: string;
  salary: string;
  createdAt: Date;
  jobPath: string;
  userDataId?: string; // Optional since it's nullable in schema
}

interface UserData {
  id: string;
  userId: string;
  jobListings: JobListing[];
}

export async function GET(req: Request) {
  const userData = await currentUserData() as UserData[] | null;
  
  return NextResponse.json({ 
    joblisting: userData?.[0]?.jobListings ?? [] 
  });
}