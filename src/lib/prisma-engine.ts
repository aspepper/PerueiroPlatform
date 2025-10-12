import { existsSync } from 'node:fs'
import { join } from 'node:path'

const engineFileNames = (() => {
  if (process.platform === 'darwin') {
    const darwinEngines = [
      'libquery_engine-darwin-arm64.dylib.node',
      'libquery_engine-darwin.dylib.node',
    ]

    return process.arch === 'arm64'
      ? darwinEngines
      : [...darwinEngines].reverse()
  }

  return [
    'libquery_engine-debian-openssl-1.1.x.so.node',
    'libquery_engine-debian-openssl-3.0.x.so.node',
  ]
})()

const engineSearchPaths = [
  ['node_modules', '.prisma', 'client'],
  ['.next', 'standalone', 'node_modules', '.prisma', 'client'],
  ['.next', 'server', 'chunks', '.prisma', 'client'],
]

export function ensurePrismaEnginePath() {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
    return
  }

  const cwd = process.cwd()

  for (const segments of engineSearchPaths) {
    for (const file of engineFileNames) {
      const candidate = join(cwd, ...segments, file)

      if (existsSync(candidate)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate
        return
      }
    }
  }
}
