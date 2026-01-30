#!/usr/bin/env bash
set -e

echo "🚀 Build RELEASE Perueiros (CI)"

if [ ! -f "./gradlew" ]; then
  echo "❌ gradlew não encontrado em $(pwd)/gradlew"
  exit 1
fi

chmod +x ./gradlew

echo "🧹 Limpando build anterior"
./gradlew clean

echo "🏗️ Gerando APK RELEASE"
./gradlew assembleRelease

APK_PATH=$(ls app/build/outputs/apk/release/*.apk | head -n 1)

if [ -z "$APK_PATH" ]; then
  echo "❌ APK não encontrado"
  exit 1
fi

echo "✅ APK gerado com sucesso: $APK_PATH"

echo "APK_PATH=$APK_PATH" >> "$GITHUB_ENV"
