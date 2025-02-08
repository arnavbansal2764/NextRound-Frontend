import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
    console.log("POST /api/guidance");
    const { currentStatus, endGoal } = await request.json();
    if (!currentStatus || !endGoal) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        const res = await axios.post('https://api.nextround.tech/career-guidance',
            {
                current: currentStatus,
                end_goal: endGoal
            }
        )
        console.log("Career Guidance \n", res.data.payload);
        return NextResponse.json(res.data.payload);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
