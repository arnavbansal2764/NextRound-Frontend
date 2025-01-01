import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const joblisting = await db.joblisting.findMany({
            where: {
                organization: "Government",
            },
            select: {
                id: true,
                title: true,
                location: true,
                organization: true,
                jobType: true,
                salary: true,
                createdAt: true,
                description: true,
            },
        });
        return NextResponse.json(joblisting);
    } catch (error) {
        console.error("Error fetching jobs:", error);

        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}
