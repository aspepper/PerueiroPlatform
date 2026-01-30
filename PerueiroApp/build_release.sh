#!/usr/bin/env bash
set -e

echo "🚀 Build RELEASE Perueiros (CI)"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$ROOT_DIR/PerueiroApp"
GRADLEW="$ANDROID_DIR/gradlew"

if [ ! -f "$GRADLEW" ]; then
  echo "❌ gradlew não encontrado em $GRADLEW"
  exit 1
fi

chmod +x "$GRADLEW"

cd "$ANDROID_DIR"
./gradlew clean assembleRelease

APK_PATH=$(ls app/build/outputs/apk/release/*.apk | head -n 1)

if [ -z "$APK_PATH" ]; then
  echo "❌ APK não encontrado"
  exit 1
fi

echo "APK_PATH=$ANDROID_DIR/$APK_PATH" >> "$GITHUB_ENV"
echo "✅ APK gerado em $APK_PATH"
