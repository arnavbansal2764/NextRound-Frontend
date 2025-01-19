import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        })
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { nextAuthId: user.id },
                });

                // If user does not exist, create a new user
                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            nextAuthId: user.id, // Store NextAuth user ID
                            name: user.name,
                            email: user.email ?? '',
                            image: user.image,
                        },
                    });
                }
                return true;
            } catch (error) {
                console.error('Error creating user:', error);
                return false;
            }
        },
        async session({ session, token }) {
            if (token?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                });
                if (dbUser) {
                    session.user.id = dbUser.id;
                    session.user.email = dbUser.email;
                    session.user.name = dbUser.name;
                    session.user.image = dbUser.image;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
    },
};