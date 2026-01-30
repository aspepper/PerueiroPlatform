#!/usr/bin/env bash
set -e

echo "🚀 Build RELEASE Perueiros (CI)"

ROOT_DIR="$(pwd)"
APP_DIR="$ROOT_DIR/PerueiroApp"
GRADLEW="$APP_DIR/gradlew"

if [ ! -f "$GRADLEW" ]; then
  echo "❌ gradlew não encontrado em $GRADLEW"
  exit 1
fi

chmod +x "$GRADLEW"

cd "$APP_DIR"

echo "🧹 Limpando build"
./gradlew clean

echo "🏗️ Gerando APK RELEASE"
./gradlew assembleRelease

APK_PATH=$(ls app/build/outputs/apk/release/*.apk | head -n 1)

if [ -z "$APK_PATH" ]; then
  echo "❌ APK não encontrado"
  exit 1
fi

echo "✅ APK gerado:"
echo "$APK_PATH"
