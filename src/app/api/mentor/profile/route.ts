import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { initialProfile } from "@/lib/profile/initialProfile";
import { initialProfileRecruiter } from "@/lib/profile/initialProfileRecruiter";
import { auth, currentUser } from "@clerk/nextjs/server";

interface CreateMentorRequest {
    name: string;
    designation: string;
    about: string;
    qualifications: string;
    experience: string;
    email: string;
    skills: string;
}

export async function POST(req: Request, res: NextResponse) {
    try {
        
        const reqData = await req.json();      
        const { name, designation, about, qualifications, experience, email, skills }: CreateMentorRequest =
            await reqData.data;
        console.log("name: ", name);
        if (!name || !designation || !about || !qualifications || !experience || !email || !skills) {
            return new NextResponse("missing fields", { status: 404 });
        }
        console.log("third");
        const cUser = await currentUser();
        let user = await db.mentor.create({
            data: {
                userId: cUser!.id,
                name,
                designation,
                aboutMentor: about,
                qualifications,
                experience,
                email,
                skills,
            },
        });
        return NextResponse.json(user);
    } catch (error) {
        console.log("USER_PROFILE \n", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request, res: NextResponse) {
    try {
        const user = await db.mentor.findMany();
        return NextResponse.json(user);
    } catch (error) {
        console.log("USER_PROFILE \n", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}