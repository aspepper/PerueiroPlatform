// app/api/db-check/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { logApiError } from '@/lib/error'
import { ensurePrismaEnginePath } from '@/lib/prisma-engine'

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({
        ok: false,
        message: 'Variável de ambiente DATABASE_URL não configurada.',
      })
    }

    const { PrismaClient } = await import('@prisma/client')
    ensurePrismaEnginePath()
    const prisma = new PrismaClient()
    const r = await prisma.$queryRaw`SELECT 1 AS ok`
    await prisma.$disconnect()
    return Response.json({ ok: true, r })
  } catch (error) {
    const { errorId } = await logApiError(req, error, 'AO VERIFICAR DB')
    const err = error as { [key: string]: unknown }

    const responseBody: Record<string, unknown> = {
      ok: false,
      errorId,
      name: typeof err?.name === 'string' ? err.name : null,
      message: typeof err?.message === 'string' ? err.message : String(error),
      code: typeof err?.code === 'string' ? err.code : null,
      platform: process.platform,
      arch: process.arch,
      openssl: process.versions?.openssl,
    }

    if (process.env.NODE_ENV !== 'production' && typeof err?.stack === 'string') {
      responseBody.stack = err.stack
    }

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
