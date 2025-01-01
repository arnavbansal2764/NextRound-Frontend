import { db } from "@/lib/db";
import { currentUserData } from "@/lib/profile/currentUserData";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        
        const user = await currentUserData();
        if(user&&user[0]){
          const mentor = await db.mentor.findUnique({
            where: { userId: user[0].userId },
            include: {
              schedule: true,
            },
          });
          if (!mentor) {
            return new NextResponse("Mentor not found", { status: 404 });
          }
          return NextResponse.json(mentor);
        }
          else{
            return new NextResponse("User not found", { status: 404 });
          }
      
          
       
    } catch (error) {
        console.log("FETCH_MENTOR \n", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}