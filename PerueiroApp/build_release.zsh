#!/usr/bin/env zsh
set -euo pipefail

# ============================
# Build Release APK (signed) — PerueiroApp
# Só compila. Não instala. Não executa.
# ============================

# --------- Configuráveis por ENV ---------
# Caminho do módulo Android (onde está o gradlew e o módulo "app")
: "${ANDROID_DIR:="."}"          # exemplo: "apps/perueiro-android"
: "${MODULE:="app"}"             # nome do módulo do app
: "${GRADLEW:="${ANDROID_DIR}/gradlew"}"

# Java/Android SDK (opcionais; use se precisar forçar)
: "${JAVA_HOME:=${JAVA_HOME:-""}}"
: "${ANDROID_HOME:=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-""}}}"

# Assinatura (OBRIGATÓRIO)
: "${MYAPP_STORE_FILE:?Defina MYAPP_STORE_FILE com o caminho ABSOLUTO do keystore (JKS/PKCS12).}"
: "${MYAPP_STORE_PASSWORD:?Defina MYAPP_STORE_PASSWORD}"
: "${MYAPP_KEY_ALIAS:?Defina MYAPP_KEY_ALIAS}"
: "${MYAPP_KEY_PASSWORD:?Defina MYAPP_KEY_PASSWORD}"

# Otimizações/caching
: "${GRADLE_USER_HOME:="${HOME}/.gradle"}"
: "${CI:=0}"                     # se estiver no CI, export CI=1

# Nome/versão do artefato final (opcionais)
: "${APP_NAME:="perueiros"}"     # prefixo do arquivo gerado
: "${STAMP:="$(date +%Y%m%d-%H%M%S)"}"

export NEXTAUTH_URL="https://icy-water-08508ba0f.2.azurestaticapps.net/api"
export NEXTAUTH_SECRET="7U1KKRvRVe1mBW4Old0Q"
export PERUEIRO_API_BASE_URL="https://icy-water-08508ba0f.2.azurestaticapps.net/api"
export PERUEIRO_API_KEY="7U1KKRvRVe1mBW4Old0Q"

# --------- Funções utilitárias ---------
die() { echo "[ERROR] $*" >&2; exit 1; }
log() { echo "[INFO] $*"; }

require_file() { [[ -f "$1" ]] || die "Arquivo não encontrado: $1"; }

# --------- Checagens básicas ---------
require_file "$GRADLEW"
chmod +x "$GRADLEW"

if [[ -n "${JAVA_HOME}" && ! -d "${JAVA_HOME}" ]]; then
  die "JAVA_HOME inválido: ${JAVA_HOME}"
fi
if [[ -n "${ANDROID_HOME}" && ! -d "${ANDROID_HOME}" ]]; then
  die "ANDROID_HOME/ANDROID_SDK_ROOT inválido: ${ANDROID_HOME}"
fi
require_file "$MYAPP_STORE_FILE"

# --------- Exporta variáveis para o Gradle ---------
# O Android Gradle Plugin lê essas props de project.findProperty(...)
export ORG_GRADLE_PROJECT_MYAPP_STORE_FILE="$MYAPP_STORE_FILE"
export ORG_GRADLE_PROJECT_MYAPP_STORE_PASSWORD="$MYAPP_STORE_PASSWORD"
export ORG_GRADLE_PROJECT_MYAPP_KEY_ALIAS="$MYAPP_KEY_ALIAS"
export ORG_GRADLE_PROJECT_MYAPP_KEY_PASSWORD="$MYAPP_KEY_PASSWORD"

# (Opcional) força Java/Android
[[ -n "${JAVA_HOME}" ]]    && export JAVA_HOME
[[ -n "${ANDROID_HOME}" ]] && { export ANDROID_HOME; export ANDROID_SDK_ROOT="${ANDROID_HOME}"; }

# --------- Build ---------
log "Limpando build anterior…"
( cd "$ANDROID_DIR" && "$GRADLEW" --console=plain clean )

log "Compilando APK release assinado (${MODULE})…"
( cd "$ANDROID_DIR" && "$GRADLEW" --console=plain ":${MODULE}:assembleRelease" )

# --------- Coleta APK ---------
APK_DIR="${ANDROID_DIR}/${MODULE}/build/outputs/apk/release"
[[ -d "$APK_DIR" ]] || die "Diretório de APK não encontrado: $APK_DIR"

APK_PATH="$(find "$APK_DIR" -type f -name "*-release.apk" | sort | head -n1)"
[[ -n "$APK_PATH" ]] || die "APK release não encontrado em $APK_DIR"

# Tenta extrair versionName (aapt/dump; se não houver aapt, usa STAMP)
VERSION="$STAMP"
if command -v aapt >/dev/null 2>&1; then
  v=$(aapt dump badging "$APK_PATH" 2>/dev/null | grep "versionName=" | sed -E "s/.*versionName='([^']+)'.*/\1/") || true
  [[ -n "$v" ]] && VERSION="$v"
fi

mkdir -p dist
OUT_PATH="dist/${APP_NAME}-release-${VERSION}.apk"
cp -f "$APK_PATH" "$OUT_PATH"

log "APK gerado:"
echo "  $OUT_PATH"

# --------- Dicas finais ---------
echo
echo "Pronto ✅  (somente build, sem install/run)"
echo "Variáveis usadas:"
echo "  ANDROID_DIR         = $ANDROID_DIR"
echo "  MODULE              = $MODULE"
echo "  GRADLEW             = $GRADLEW"
echo "  MYAPP_STORE_FILE    = $MYAPP_STORE_FILE"
echo "  MYAPP_KEY_ALIAS     = $MYAPP_KEY_ALIAS"
echo "  Saída               = $OUT_PATH"
