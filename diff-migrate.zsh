# exit code: 0 = sem diffs | 2 = há diffs | 1 = erro
npx prisma migrate diff \
  --from-url "postgresql://neondb_owner:npg_4c2uxJbNfnUE@ep-lingering-smoke-a8btkicc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" \
  --to-schema-datamodel ./prisma/schema.prisma \
  --exit-code

if [ $? -eq 2 ]; then
  echo "Diferenças detectadas: gere um novo migrate."
else
  echo "Sem diferenças: não precisa de novo migrate."
fi
