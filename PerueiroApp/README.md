# PerueiroApp (Android)

## Como configurar o `REMOTE_API_KEY`

O backend Next.js exige que todo acesso mobile ao endpoint `/api/mobile/login` traga o header `x-api-key` com o mesmo segredo utilizado no `NEXTAUTH_SECRET`. O app injeta esse header automaticamente, **desde que** o valor esteja disponível no momento do build do Gradle. Caso contrário, o login falha imediatamente com `401 Unauthorized`.

### Opções para disponibilizar a chave

1. **Variável de ambiente no build**
   ```bash
   export PERUEIRO_API_KEY="coloque-o-mesmo-valor-do-NEXTAUTH_SECRET"
   ./gradlew assembleDebug
   ```
   > `PERUEIRO_API_KEY`, `NEXTAUTH_SECRET` e a propriedade Gradle `-PperueiroApiKey=...` são equivalentes. Use a que for mais conveniente no seu pipeline.

2. **Arquivo `.env` na raiz do monorepo**
   - Garanta que exista um arquivo `.env` (ou `.env.example`) na raiz do repositório (mesmo nível do `README.md` principal).
   - Inclua nele a variável:
     ```env
     NEXTAUTH_SECRET="coloque-o-mesmo-valor-utilizado-no-backend"
     ```
   - O script de build procura esse arquivo automaticamente ao gerar o `BuildConfig`.

### Como validar se está funcionando

Execute um build. Se a chave não for encontrada, o Gradle abortará com a mensagem:
```
REMOTE_API_KEY não encontrado. Defina perueiroApiKey, PERUEIRO_API_KEY ou NEXTAUTH_SECRET antes do build, ou mantenha um arquivo .env/.env.example na raiz do monorepo com NEXTAUTH_SECRET=
```

Quando o build terminar sem erros, você pode confirmar que o header está ativo abrindo o arquivo gerado em `app/build/generated/source/buildConfig/<variant>/com/idealinspecao/perueiroapp/BuildConfig.java` e verificando que `REMOTE_API_KEY` contém o valor esperado.

### Resumo rápido

| Onde definir | Como fazer | Quando usar |
|--------------|-----------|-------------|
| Variável de ambiente | `PERUEIRO_API_KEY="..." ./gradlew assembleRelease` | Builds locais ou pipelines CI/CD |
| Propriedade Gradle | `./gradlew assembleRelease -PperueiroApiKey="..."` | Quando não é possível exportar variáveis |
| Arquivo `.env` | Crie/atualize `../.env` com `NEXTAUTH_SECRET="..."` | Máquinas de desenvolvimento com `.env` compartilhado |

> **Importante:** use sempre o mesmo segredo configurado no backend (Azure Static Web Apps). O valor do `NEXTAUTH_SECRET` é quem autoriza o login mobile.
