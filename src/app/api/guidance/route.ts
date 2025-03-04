import { NextResponse } from "next/server";
import axios from "axios";
import { redis } from "@/lib/redisClient";

export async function POST(request: Request) {
    // console.log("POST /api/guidance");
    const { currentStatus, endGoal } = await request.json();
    if (!currentStatus || !endGoal) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        const cacheKey = `career-guidance:${currentStatus}:${endGoal}`;
        
        // Check if we have a cached response
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // If not in cache, make the actual API call
        const res = await axios.post('https://api.nextround.tech/career-guidance',
            {
                current: currentStatus,
                end_goal: endGoal
            }
        );
        await redis.set(cacheKey, res.data.payload, { ex: 86400 });
        
        return NextResponse.json(res.data.payload);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
