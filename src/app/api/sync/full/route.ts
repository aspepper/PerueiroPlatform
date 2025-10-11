import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/api/sync/pull?apiKey=" + process.env.NEXTAUTH_SECRET, process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
