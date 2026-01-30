// lib/getLatestApk.ts
export async function getLatestApk() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_R2_BASE}/perueiros/app-android/latest.json`,
    { cache: "no-store" }
  )
  return res.json()
}
