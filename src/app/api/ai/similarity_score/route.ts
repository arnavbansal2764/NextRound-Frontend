import { NextResponse } from "next/server";

import { currentUserData } from "@/lib/profile/currentUserData";
import { RedisManager } from "@/lib/redis/RedisManagerSimilarity";
import { GET_SIMILARITY_SCORE } from "@/lib/redis/types";

export async function POST(request: Request) {
  
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
      type: GET_SIMILARITY_SCORE,
      data: {
        job_description: job_description,
        resume: userData[0].resume,
      },
    })
    console.log("Ai/similarity_score \n",res.payload);
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
