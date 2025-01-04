import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { initialProfile } from "@/lib/profile/initialProfile";

interface CreateUserRequest {
  name: string;
  resume: string;
}

export async function POST(req: Request) {
  try {
    const profile = await initialProfile();
    console.log("first");
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });
    console.log("second");
    const reqData = await req.json();
    const { name, resume}: CreateUserRequest =
      await reqData.data;
    console.log("name: ", name);
    if (!name  || !resume ) {
      return new NextResponse("missing fields", { status: 404 });
    }
    console.log("third");
    const updatedUser = await db.user.update({
      where: { id: profile.id },
      data: {
        name,
        resume
      },
    });      
    

    return NextResponse.json({user: updatedUser}, {status: 200});
  } catch (error) {
    console.log("USER_PROFILE \n", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

