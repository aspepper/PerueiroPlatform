import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    const KEYS = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'AUTH_TRUST_HOST',
    ]

    return NextResponse.json({
      node: process.versions.node,
      seen: KEYS.map((k) => ({
        key: k,
        present: Boolean(process.env[k as keyof NodeJS.ProcessEnv]),
      })),
      // alguns indicadores do ambiente SWA
      swa: {
        site: process.env.WEBSITE_SITE_NAME ?? null,
        region: process.env.REGION_NAME ?? null,
        functionsWorker: process.env.FUNCTIONS_WORKER_RUNTIME ?? null,
      },
    })
  } catch (error) {
    return errorResponse(req, error, 'AO LER VARIÁVEIS DE AMBIENTE')
  }
}
