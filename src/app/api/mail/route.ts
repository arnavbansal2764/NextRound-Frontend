import { NextResponse } from "next/server";
import {sendMail} from "@/lib/mailer/mailer"
export async function GET() {
  await sendMail("kabir07arora@gmail.com","hi babygirl","hi hello bye","");
  return NextResponse.json({"response":"messages sent"})
}