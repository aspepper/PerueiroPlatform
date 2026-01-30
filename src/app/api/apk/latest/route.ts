import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const res = await fetch(
    `${process.env.R2_PUBLIC_BASE_URL}/app-android/latest.json`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    return NextResponse.json({ error: "APK not found" }, { status: 404 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
