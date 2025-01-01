import { NextResponse } from "next/server";
import { RedisManager } from "@/lib/redis/RedisManagerOther";
import { GET_CHECKPOINTS, GET_JOBS_SCRAPED } from "@/lib/redis/types";
import { currentUserData } from "@/lib/profile/currentUserData";

export async function POST(request: Request) {
  console.log("POST /api/ai/scrapejob");
  const {jobType,role,location,years}:{ jobType:"internship"|"private"|"government",
    role:string,
    location:string,
    years:string, } = await request.json();

  if (!jobType||!role||!location||!years) {
    return NextResponse.json(
      { error: "Complete data is required" },
      { status: 400 }
    );
  }
  

  try {
   
    const res = await RedisManager.getInstance().sendAndAwait({
        type: GET_JOBS_SCRAPED,
        data: {
            jobType,role,location,years
        },
      })
      console.log("Ai/scrapejob \n",res.payload);
      return NextResponse.json(res.payload);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
