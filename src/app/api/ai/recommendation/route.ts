import { NextResponse } from "next/server";
import { RedisManager } from "@/lib/redis/RedisManagerOther";
import { GET_RECOMMENDATION } from "@/lib/redis/types";
import { db } from "@/lib/db";
import { currentUserData } from "@/lib/profile/currentUserData";

export async function POST(request: Request) {
  const job = await request.json();

  if (!job) {
    return NextResponse.json({ error: "Job Id is required" }, { status: 400 });
  }

  try {
    const userData = await currentUserData();
    if (userData && userData[0] && userData[0].resume) {
      console.log("huehue")
      const res = await RedisManager.getInstance().sendAndAwait({
        type: GET_RECOMMENDATION,
        data: {
          description: job.description,
          responsibilities: job.responsibilities,
          resume: userData[0].resume,
          requirements: job.requirements,
          experience: job.experience,
          location: job.location,
          jobType: job.jobType,
          mode: job.mode,
          organization: job.organization,
          title: job.title,
          salary: job.salary,
        }
      });
      console.log("Ai/recommendation \n", res.payload);
      return NextResponse.json({"res":res.payload});
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
