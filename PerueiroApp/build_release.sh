#!/usr/bin/env bash
set -e

echo "🚀 Build RELEASE Perueiros (CI)"

# Diretório do projeto Android
ANDROID_DIR="PerueiroApp"
APP_DIR="$ANDROID_DIR/app"
OUTPUT_DIR="$APP_DIR/build/outputs/apk/release"

# Validação básica
if [ ! -f "$ANDROID_DIR/gradlew" ]; then
  echo "❌ gradlew não encontrado"
  exit 1
fi

chmod +x "$ANDROID_DIR/gradlew"

# Build
cd "$ANDROID_DIR"
./gradlew clean assembleRelease

# Descobre versão automaticamente
APK_FILE=$(ls $OUTPUT_DIR/*release*.apk | head -n 1)

if [ -z "$APK_FILE" ]; then
  echo "❌ APK não encontrado"
  exit 1
fi

echo "✅ APK gerado: $APK_FILE"

# Exporta caminho para o workflow
echo "APK_PATH=$APK_FILE" >> $GITHUB_ENV
