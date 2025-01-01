import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { initialProfileRecruiter } from "@/lib/profile/initialProfileRecruiter";
import { currentUser } from "@clerk/nextjs/server";
import {sendMail} from "@/lib/mailer/mailer"
import { RedisManager } from "@/lib/redis/RedisManagerSimilarity";
import { GET_SIMILARITY_SCORE } from "@/lib/redis/types";
interface CreateJobRequest {

title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  experience: string;
  location: string;
  jobType: string;
  mode: string;
  jobPath: string; 
  salary: string;
  organization:string;
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const recruiterId = user?.id;

    if (!recruiterId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const body: CreateJobRequest = await req.json();
    const {
      title, // Extract the title
      description,
      responsibilities,
      requirements,
      experience,
      location,
      jobType,
      mode,
      jobPath,
      salary,
      organization,
    } = body;
 
    if (!description || !responsibilities || !requirements || !experience || !location || !jobType || !mode) {
      return new NextResponse("Missing fields", { status: 400 });
    }


    // Create the job listing in the database
    const jobListing = await db.joblisting.create({
      data: {
        recruiterId: recruiterId,
        title, // Include the title
        description,
        responsibilities,
        requirements,
        experience,
        location,
        jobType,
        mode,
        jobPath,
        organization, // Adjust as needed
        salary,
      },
    });
    console.log("JobListing: ",jobListing)
    await db.recruiter.update({
      where: {
        id: user.id,
      },
      data: {
        jobListings: {
          connect: { id: jobListing.id },
        },
      },
    });
    const usersData = await db.userData.findMany({where:{
      role:jobPath
    }})
    const message = "There is a new job posting for the role of "+jobPath;
    const htmlContent = "";
    for (const user of usersData) {
      sendMail(user.email,"New Job Posting Update",message,htmlContent)
    }

    for (const user of usersData){
      const res = await RedisManager.getInstance().sendAndAwait({
        type: GET_SIMILARITY_SCORE,
        data: {
          job_description: description,
          resume: user.resume,
        },
    })

    if(res.type=="SIMILARITY_SCORE"&& (res.payload.score.semantic_similarity>0.4)){
      
      await db.userData.update({where:{
        id:user.id
      }, data: {
        jobListings: {
          connect: {
            id: jobListing.id
          }
        }
      }})
    }

  }
    return NextResponse.json({
      message: 'Job listing created successfully',
      jobListing,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job listing:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
