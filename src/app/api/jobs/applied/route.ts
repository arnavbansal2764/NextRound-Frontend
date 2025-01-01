// Import necessary modules
import { db } from "@/lib/db";
import { currentUserData } from "@/lib/profile/currentUserData";
import { NextResponse } from "next/server";


export async function GET() {
    const userData = await currentUserData();
    const jobs = await db.userApplications.findMany({
        where: {
          userDataId: userData?.[0]?.id,
        },
        include: {
          joblisting: true,
        },
      });

      return NextResponse.json({jobs})
}