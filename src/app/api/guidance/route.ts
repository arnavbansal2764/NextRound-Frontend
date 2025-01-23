import { NextResponse } from "next/server";
import { RedisManager } from "@/lib/redis/RedisManagerOther";
import { GET_CHECKPOINTS } from "@/lib/redis/types";

export async function POST(request: Request) {
    console.log("POST /api/guidance");
    const { currentStatus, endGoal } = await request.json();

    if (!currentStatus) {
        return NextResponse.json(
            { error: "Current Status is required" },
            { status: 400 }
        );
    }
    if (!endGoal) {
        return NextResponse.json(
            { error: "End Goal is required" },
            { status: 400 }
        );
    }

    try {

        const res = await RedisManager.getInstance().sendAndAwait({
            type: GET_CHECKPOINTS,
            data: {
                currentStatus: currentStatus,
                endGoal: endGoal,
            },
        })
        console.log("Ai/resume_build \n", res.payload);
        return NextResponse.json(res.payload);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
