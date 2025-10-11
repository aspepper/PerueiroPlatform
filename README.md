# Perueiros Admin (Next.js 14 + Prisma 6 + Neon)

## Setup rápido

```bash
pnpm i   # ou npm i / yarn
pnpm prisma:migrate
pnpm run seed
pnpm dev
```

Acesse http://localhost:3000/login e entre com o admin da `.env`.

### Rotas de sync (para o app Kotlin)
- `POST /api/sync/push` (header `x-api-key: NEXTAUTH_SECRET`) com JSON contendo arrays: `guardians, schools, drivers, vans, students, payments`
- `GET /api/sync/pull?apiKey=NEXTAUTH_SECRET&updatedSince=2025-01-01T00:00:00Z`
