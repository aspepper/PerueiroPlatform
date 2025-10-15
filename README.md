# Perueiros Admin (Next.js 14 + Prisma 6 + Neon)

## Guia passo a passo (Next.js 14 + Prisma 6 + Neon)

1. **Criar o projeto base**
   ```bash
   npx create-next-app@latest perueiros-admin \
     --typescript --tailwind --eslint --app --src-dir
   cd perueiros-admin
   ```

2. **Adicionar dependências de backend**
   ```bash
   npm install prisma @prisma/client next-auth bcryptjs zod date-fns
   npm install -D tsx
   ```

3. **Inicializar o Prisma**
   ```bash
   npx prisma init --datasource-provider postgresql
   ```
   - Substitua a variável `DATABASE_URL` gerada no `.env` pelo endpoint Neon fornecido:
     ```env
     DATABASE_URL="postgresql://neondb_owner:npg_4c2uxJbNfnUE@ep-lingering-smoke-a8btkicc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
     ```
   - Acrescente também as variáveis utilizadas pelo app:
     ```env
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="troque-por-um-valor-seguro"
     ADMIN_EMAIL="admin@perueiros.local"
     ADMIN_PASSWORD="admin123"
     PERUEIRO_APP_URL="http://localhost:3000"
     NEXT_PUBLIC_PERUEIROS_LANDING_URL="https://perueiros.com.br"

     # Configurações opcionais de SMTP para envio de e-mails de redefinição de senha
     SMTP_HOST="smtp.mailtrap.io"
     SMTP_PORT="2525"
     SMTP_USER="seu-usuario"
     SMTP_PASSWORD="sua-senha"
     SMTP_FROM="no-reply@perueiros.com"
     ```
     > Gere o `NEXTAUTH_SECRET` com `openssl rand -base64 32` ou outra ferramenta segura e reutilize-o como `x-api-key` ao sincronizar com o app Kotlin.

4. **Modelagem do banco** – substitua o conteúdo de `prisma/schema.prisma` pelo modelo abaixo (o mesmo utilizado pelo app Kotlin):
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     password  String
     name      String?
     role      Role     @default(ADMIN)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   enum Role {
     ADMIN
   }

   model Guardian {
     cpf          String   @id
     name         String
     kinship      String
     birthDate    DateTime?
     spouseName   String?
     address      String
     mobile       String
     landline     String?
     workAddress  String?
     workPhone    String?
     students     Student[]
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
   }

   model School {
     id        BigInt   @id @default(autoincrement())
     name      String
     address   String
     phone     String?
     contact   String?
     principal String?
     doorman   String?
     students  Student[]
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   model Driver {
     cpf        String   @id
     name       String
     cnh        String?
     phone      String?
     email      String?
     address    String?
     vans       Van[]
     students   Student[] @relation("DriverStudents")
     createdAt  DateTime  @default(now())
     updatedAt  DateTime  @updatedAt
   }

   model Van {
     id        BigInt  @id @default(autoincrement())
     model     String
     color     String?
     year      String?
     plate     String   @unique
     driverCpf String?
     driver    Driver?  @relation(fields: [driverCpf], references: [cpf])
     students  Student[]
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   model Student {
     id          BigInt   @id @default(autoincrement())
     name        String
     birthDate   DateTime?
     grade       String?
     guardianCpf String?
     guardian    Guardian? @relation(fields: [guardianCpf], references: [cpf])
     schoolId    BigInt?
     school      School?   @relation(fields: [schoolId], references: [id])
     vanId       BigInt?
     van         Van?      @relation(fields: [vanId], references: [id])
     driverCpf   String?
     driver      Driver?   @relation("DriverStudents", fields: [driverCpf], references: [cpf])
     mobile      String?
     blacklist   Boolean   @default(false)
     payments    Payment[]
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
   }

   model Payment {
     id          BigInt   @id @default(autoincrement())
     studentId   BigInt
     student     Student  @relation(fields: [studentId], references: [id])
     dueDate     DateTime
     paidAt      DateTime?
     amount      Decimal  @db.Decimal(12, 2)
     discount    Decimal  @db.Decimal(12, 2) @default(0)
     status      PaymentStatus @default(PENDING)
     boletoId    String?
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@index([studentId, dueDate])
   }

   enum PaymentStatus {
     PENDING
     PAID
     OVERDUE
     CANCELED
   }
   ```

### Integração futura com boletos

- O módulo `src/lib/payments/boleto-gateway.ts` concentra os contratos para
  emissão e verificação de boletos.
- Quando a integração com a instituição financeira estiver pronta, registre a
  implementação concreta com `registerBoletoGateway`.
- Utilize `generatePaymentBoleto` para solicitar um boleto vinculado a um
  pagamento existente e `verifyPaymentBoleto` para consultar a situação de
  boletos previamente emitidos (pago, pendente, cancelado etc.).
- Enquanto nenhum gateway estiver registrado, essas funções lançarão
  `MissingBoletoGatewayError`, evitando chamadas silenciosas.

5. **Executar as migrações**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. **Executar as migrações**
   ```
   npx prisma migrate dev --name implement-monthly-payment --create-only
   npx prisma migrate deploy
   ```

7. **Popular um usuário administrador** – crie `prisma/seed.ts` e rode:
   ```bash
   npx prisma db seed
   ```
   O script já lê `ADMIN_EMAIL`/`ADMIN_PASSWORD` para definir o login inicial.

8. **Configurar autenticação (NextAuth)**
   - Utilize o provider de credenciais (`src/lib/auth.ts`) para validar o usuário administrador via Prisma.
   - Restrinja o acesso com `middleware.ts`, garantindo que apenas sessões com `role === "ADMIN"` alcancem o dashboard.

9. **Executar a aplicação**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000/login`, informe as credenciais seed e navegue até o dashboard administrativo.

10. **Integração com o aplicativo Kotlin**
   - Utilize o mesmo `NEXTAUTH_SECRET` como `x-api-key` em todas as requisições do app móvel.
   - Endpoints:
     - `POST /api/sync/push` – recebe os registros (`guardians`, `schools`, `drivers`, `vans`, `students`, `payments`).
     - `GET /api/sync/pull?apiKey=...&updatedSince=...` – devolve as alterações desde a última sincronização.

> **Dica:** o dashboard inicial já exibe métricas resumidas, permitindo decidir se deseja manter ou personalizar a experiência visual.

## Setup rápido para desenvolvimento local

```bash
pnpm i   # ou npm i / yarn
pnpm prisma:migrate
pnpm run seed
pnpm dev
```

Acesse http://localhost:3000/login e entre com o admin definido nas variáveis de ambiente.


# Prisma

## Checagem objetiva via diff

# 1) (opcional) garantir que o schema está válido
npx prisma validate

# 2) ver o diff (legível) — não aplica nada
npx prisma migrate diff --from-url "postgresql://neondb_owner:npg_4c2uxJbNfnUE@ep-lingering-smoke-a8btkicc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --to-schema-datamodel ./prisma/schema.prisma

# 3) checar por script SQL (útil para revisar plano de mudança)
npx prisma migrate diff --from-url "postgresql://neondb_owner:npg_4c2uxJbNfnUE@ep-lingering-smoke-a8btkicc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --to-schema-datamodel ./prisma/schema.prisma --script
