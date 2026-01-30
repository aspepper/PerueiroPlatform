#!/usr/bin/env zsh
set -e

echo "🚀 Iniciando build RELEASE do PerueirosApp"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/app"
KEYSTORE_PROPS="$ROOT_DIR/keystore.properties"

# -----------------------------
# 1. Validar keystore.properties
# -----------------------------
if [[ ! -f "$KEYSTORE_PROPS" ]]; then
  echo "❌ keystore.properties não encontrado em $KEYSTORE_PROPS"
  exit 1
fi

echo "🔐 Carregando keystore.properties"
set -a
source "$KEYSTORE_PROPS"
set +a

# Mapeia nomes do keystore.properties para o padrão esperado
export MYAPP_STORE_FILE="$storeFile"
export MYAPP_STORE_PASSWORD="$storePassword"
export MYAPP_KEY_ALIAS="$keyAlias"
export MYAPP_KEY_PASSWORD="$keyPassword"

REQUIRED_VARS=(
  MYAPP_STORE_FILE
  MYAPP_STORE_PASSWORD
  MYAPP_KEY_ALIAS
  MYAPP_KEY_PASSWORD
)

for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${(P)VAR}" ]]; then
    echo "❌ Variável $VAR não definida"
    exit 1
  fi
done

if [[ ! -f "$MYAPP_STORE_FILE" ]]; then
  echo "❌ Keystore não encontrado: $MYAPP_STORE_FILE"
  exit 1
fi

# -----------------------------
# 2. Limpar e buildar
# -----------------------------
cd "$ROOT_DIR"

echo "🧹 Limpando build anterior"
./gradlew clean

echo "🏗️ Gerando APK RELEASE"
./gradlew assembleRelease

# -----------------------------
# 3. Renomear APK
# -----------------------------
APK_DIR="$APP_DIR/build/outputs/apk/release"
APK_ORIGINAL="$APK_DIR/app-release.apk"

if [[ ! -f "$APK_ORIGINAL" ]]; then
  echo "❌ APK não encontrado em $APK_ORIGINAL"
  exit 1
fi

VERSION_NAME=$(grep versionName "$APP_DIR/build.gradle.kts" | sed 's/.*"\(.*\)".*/\1/')
APK_FINAL="$APK_DIR/perueiros-release-$VERSION_NAME.apk"

mv "$APK_ORIGINAL" "$APK_FINAL"

echo "✅ APK GERADO COM SUCESSO!"
echo "📦 $APK_FINAL"
