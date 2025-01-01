import { NextResponse } from "next/server";
import axios from "axios";
import { RedisManager } from "@/lib/redis/RedisManagerOther";
import { GET_RESUME_BUILD } from "@/lib/redis/types";
import { currentUserData } from "@/lib/profile/currentUserData";

export async function POST(request: Request) {
  console.log("POST /api/ai/resume_build");
  const { job_description } = await request.json();

  if (!job_description) {
    return NextResponse.json(
      { error: "Job description is required" },
      { status: 400 }
    );
  }

  try {
   
    const userData = await currentUserData();
    if (userData && userData[0] && userData[0].resume) {
      const res = await RedisManager.getInstance().sendAndAwait({
        type: GET_RESUME_BUILD,
        data: {
          job_description: job_description,
          resume: userData[0].resume,
        },
      })
      console.log("Ai/resume_build \n",res.payload);
      return NextResponse.json(res.payload);
    } else {
      return NextResponse.json(
        { error: "Error Verifying You" },
        { status: 420 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
