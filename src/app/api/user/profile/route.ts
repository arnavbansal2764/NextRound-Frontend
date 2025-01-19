import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: {
                interviews: {
                    orderBy: { createdAt: 'desc' }
                },
                culturals: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}


export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        const { name, email } = await req.json()

        if (typeof name !== 'string' || name.length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }
        if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating user profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}