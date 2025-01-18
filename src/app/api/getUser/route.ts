import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET (){
    const session = await getServerSession(authOptions);

    if(!session){
        return NextResponse.json({error: "Not authorized"}, {status: 401});
    }

    return NextResponse.json({success : session}, {status: 200});
}