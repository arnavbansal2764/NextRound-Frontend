// Import necessary modules
import { db } from "@/lib/db";
import { currentUserData } from "@/lib/profile/currentUserData";
import { NextResponse } from "next/server";

// Define TypeScript interfaces for the request body and response
interface UpdateJobApplicationRequest {
  id: string;
  experience: string;
  resume: string;
  location: string;
  apply: boolean;
}

interface JobApplication {
  id: string;
  experience: string;
  resume: string;
  location: string;
  apply: boolean;
}

// PUT request handler
export async function PUT(request: Request) {
  try {
    const user = await currentUserData();
    if (!user || !user[0]) { // Fixed logic - check if user data doesn't exist
      return NextResponse.json(
        { error: "Failed to authenticate" },
        { status: 400 }
      );
    }

    const { jobId } = await request.json();
    const applicationData = await db.joblisting.findUnique({
      where: {
        id: jobId
      }
    });

    if (!applicationData) {
      return NextResponse.json(
        { error: "Job listing not found" },
        { status: 404 }
      );
    }

    // Create a new UserApplications record
    const newApplication = await db.userApplications.create({
      data: {
        userDataId: user[0].id,
        joblistingId: jobId
      }
    });

    return NextResponse.json(newApplication, { status: 200 });
    
  } catch (error) {
    console.error("Error updating job application:", error);
    return NextResponse.json(
      { error: "Failed to update job application. Please try again later." },
      { status: 500 }
    );
  }
}