#!/usr/bin/env zsh
set -euo pipefail

# ============================
# Perueiro App - Android Runner
# ============================
# Builda, instala, inicia e captura logcat do PerueiroApp.
# Logs salvos em ./logs/build-<variant>-<stamp>.log e ./logs/run-<variant>-<stamp>.log
#
# Defaults foram ajustados para este app.
# ============================

Clear

MODULE="${MODULE:-app}"
VARIANT="${VARIANT:-debug}"
APP_ID="${APP_ID:-com.idealinspecao.perueiroapp}"
MAIN_ACTIVITY="${MAIN_ACTIVITY:-}"                 # vazio => auto-resolver LAUNCHER
ADB_BIN="${ADB_BIN:-adb}"
GRADLEW="${GRADLEW:-./gradlew}"
LOG_DIR="${LOG_DIR:-./logs}"
LOG_LEVEL_FILTER="${LOG_LEVEL_FILTER:-package:mine}"  # interpreta 'package:mine' como --pid do APP_ID
WAIT_FOR_DEVICE="${WAIT_FOR_DEVICE:-1}"

ANDROID_SERIAL="${ANDROID_SERIAL:-}"

STAMP="$(date +"%Y%m%d-%H%M%S")"
mkdir -p "$LOG_DIR"
BUILD_LOG="${LOG_DIR}/build-${VARIANT}-${STAMP}.log"
RUNTIME_LOG="${LOG_DIR}/run-${VARIANT}-${STAMP}.log"

usage() {
  cat <<EOF
Uso:
  [VARIÁVEIS] $0 [--install-only|--build-only|--no-run] [--filter "<filtro>"]

Exemplos:
  $0
  VARIANT=release $0
  $0 --filter "package:mine"         # logs só do processo do app
  $0 --filter "*:S ActivityManager:I AndroidRuntime:E"

Opções:
  --install-only   Apenas instala o APK (não builda).
  --build-only     Apenas builda (não instala/roda).
  --no-run         Não abre o app após instalar.
  --filter STR     Filtro do logcat. 'package:<pkg>' ou 'package:mine' vira --pid.
EOF
}

export NEXTAUTH_URL="https://icy-water-08508ba0f.2.azurestaticapps.net/"
export NEXTAUTH_SECRET="7U1KKRvRVe1mBW4Old0Q"

INSTALL_ONLY=0
BUILD_ONLY=0
NO_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-only) INSTALL_ONLY=1 ;;
    --build-only)   BUILD_ONLY=1 ;;
    --no-run)       NO_RUN=1 ;;
    --filter)       shift; LOG_LEVEL_FILTER="${1:-$LOG_LEVEL_FILTER}" ;;
    -h|--help)      usage; exit 0 ;;
    *) echo "Opção desconhecida: $1"; usage; exit 1 ;;
  esac
  shift
done

die() { echo "[ERRO] $*" >&2; exit 1; }
log() { echo "[INFO] $*"; }

ensure_tools() {
  command -v "$ADB_BIN" >/dev/null 2>&1 || die "adb não encontrado no PATH."
  [[ -x "$GRADLEW" ]] || die "gradlew não encontrado/exec. ($GRADLEW)"
}

pick_device() {
  if [[ -n "${ANDROID_SERIAL}" ]]; then
    log "ANDROID_SERIAL definido: $ANDROID_SERIAL"
    return
  fi
  local lines count first
  lines=$($ADB_BIN devices | awk 'NR>1 && $2=="device"{print $1}')
  count=$(echo "$lines" | grep -c '.*' || true)
  [[ -n "$lines" && "$count" -gt 0 ]] || die "Nenhum dispositivo/emulador com status 'device' conectado."
  first=$(echo "$lines" | head -n1 | tr -d '\r\n')
  export ANDROID_SERIAL="$first"
  log "Selecionado automaticamente o primeiro device: $ANDROID_SERIAL"
}

wait_for_device_if_needed() {
  if [[ "$WAIT_FOR_DEVICE" -eq 1 ]]; then
    log "Aguardando dispositivo ficar pronto..."
    $ADB_BIN wait-for-device
  fi
}

variant_pascal() {
  local v="${1:-debug}"
  printf "%s%s" "${v[1,1]:u}" "${v[2,-1]}"
}

gradle_sync_and_build() {
  local VP; VP="$(variant_pascal "$VARIANT")"
  local assembleTask=":${MODULE}:assemble${VP}"
  log "Build: $assembleTask (refresh dependencies)"
  "$GRADLEW" --console=plain --refresh-dependencies "$assembleTask" |& tee -a "$BUILD_LOG"
}

install_apk() {
  local VP; VP="$(variant_pascal "$VARIANT")"
  local installTask=":${MODULE}:install${VP}"
  log "Install: $installTask"
  if ! "$GRADLEW" --console=plain "$installTask" |& tee -a "$BUILD_LOG"; then
    echo "[WARN] Falha na task install*. Fallback via adb..." | tee -a "$BUILD_LOG"
    local apk
    apk=$(find "$PWD/${MODULE}/build/outputs/apk/${VARIANT}" -type f -name "*.apk" | head -n1 || true)
    [[ -n "$apk" ]] || die "APK não encontrado para '${VARIANT}'. Rode assemble primeiro."
    $ADB_BIN install -r "$apk" |& tee -a "$BUILD_LOG"
  fi
}

resolve_launcher_component() {
  $ADB_BIN shell cmd package resolve-activity --brief "$APP_ID" 2>/dev/null | tail -n1 | tr -d '\r'
}

launch_app() {
  [[ -n "$APP_ID" ]] || die "APP_ID não definido."
  local component resolved
  if [[ -z "$MAIN_ACTIVITY" ]]; then
    log "Resolvendo atividade LAUNCHER para ${APP_ID}..."
    resolved="$(resolve_launcher_component || true)"
    if [[ -n "$resolved" && "$resolved" != "no activity found" ]]; then
      component="$resolved"
      log "Atividade: $component"
    else
      echo "[WARN] Não foi possível resolver via cmd package. Tentando via monkey..." | tee -a "$BUILD_LOG"
      if $ADB_BIN shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; then
        log "App iniciado via monkey."
        return
      else
        die "Falha ao iniciar o app com monkey."
      fi
    fi
  else
    if [[ "$MAIN_ACTIVITY" == .* ]]; then
      component="${APP_ID}/${MAIN_ACTIVITY}"
    else
      component="${APP_ID}/${MAIN_ACTIVITY}"
    fi
  fi

  log "Abrindo atividade: $component"
  if ! $ADB_BIN shell am start -n "$component" >/dev/null 2>&1; then
    echo "[WARN] Falha no 'am start -n'. Tentando via monkey..." | tee -a "$BUILD_LOG"
    $ADB_BIN shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || \
      die "Falha ao iniciar o app (am/monkey)."
  fi
}

resolve_pid_for_package() {
  local pkg="$1"
  local tries="${2:-30}"
  local pid=""
  for ((i=1; i<=tries; i++)); do
    pid="$($ADB_BIN shell pidof -s "$pkg" 2>/dev/null | tr -d '\r')"
    if [[ -z "$pid" ]]; then
      pid="$($ADB_BIN shell 'ps -A | grep -w '"$pkg"' | awk "{print \$2}"' 2>/dev/null | tr -d '\r')"
    fi
    if [[ -n "$pid" ]]; then
      echo "$pid"
      return 0
    fi
    sleep 0.3
  done
  return 1
}

preface_runtime_snapshot() {
  # Captura um snapshot de contexto do launch/crash (buffers all) e anexa ao runtime log
  echo "===== SNAPSHOT (pre-run) $(date) =====" >> "$RUNTIME_LOG"
  $ADB_BIN logcat -d -b all -v time | egrep "ActivityManager|ActivityTaskManager|AndroidRuntime|$APP_ID" >> "$RUNTIME_LOG" || true
  echo "===== END SNAPSHOT =====" >> "$RUNTIME_LOG"
}

start_logcat() {
  echo "[INFO] Limpando logcat..." | tee -a "$BUILD_LOG"
  $ADB_BIN logcat -c || true

  preface_runtime_snapshot

  local filter="$LOG_LEVEL_FILTER"
  local mode="raw"
  local pid=""

  if [[ "$filter" == package:* ]]; then
    local pkg="${filter#package:}"
    [[ "$pkg" == "mine" ]] && pkg="$APP_ID"
    if [[ -n "$pkg" ]]; then
      echo "[INFO] Resolvendo PID para '${pkg}'..." | tee -a "$BUILD_LOG"
      if pid="$(resolve_pid_for_package "$pkg" 40)"; then
        mode="pid"
        echo "[INFO] PID: $pid" | tee -a "$BUILD_LOG"
      else
        echo "[WARN] Não foi possível resolver PID. Caindo para filtro literal." | tee -a "$BUILD_LOG"
      fi
    fi
  fi

  echo "[INFO] Gravando logcat em: $RUNTIME_LOG" | tee -a "$BUILD_LOG"
  if [[ "$mode" == "pid" && -n "$pid" ]]; then
    echo "[INFO] Filtro: --pid ${pid}" | tee -a "$BUILD_LOG"
    ($ADB_BIN logcat -v time -b all --pid "$pid") | tee -a "$RUNTIME_LOG" &
  else
    echo "[INFO] Filtro: ${filter}" | tee -a "$BUILD_LOG"
    ($ADB_BIN logcat -v time -b all ${=filter}) | tee -a "$RUNTIME_LOG" &
  fi
  LOGCAT_PID=$!
  trap '[[ -n "${LOGCAT_PID:-}" ]] && kill $LOGCAT_PID >/dev/null 2>&1 || true' EXIT
  echo "[INFO] Logcat PID: $LOGCAT_PID" | tee -a "$BUILD_LOG"
}

# ===== Execução =====
ensure_tools
pick_device
wait_for_device_if_needed

local VP; VP="$(variant_pascal "$VARIANT")" || true
echo "[INFO] Iniciando build (variant=${VARIANT}, task=:${MODULE}:assemble${VP})" | tee -a "$BUILD_LOG"
gradle_sync_and_build

if [[ "$INSTALL_ONLY" -eq 1 && "$BUILD_ONLY" -eq 1 ]]; then
  : # nada
elif [[ "$INSTALL_ONLY" -eq 1 ]]; then
  install_apk
elif [[ "$BUILD_ONLY" -eq 1 ]]; then
  : # já buildou
else
  install_apk
fi

if [[ "$NO_RUN" -eq 0 ]]; then
  launch_app
fi

start_logcat

echo "[OK] Tudo pronto. Logs:"
echo "  - Build log : $BUILD_LOG"
echo "  - Runtime   : $RUNTIME_LOG"
echo "Pressione Ctrl+C para parar o logcat quando quiser."
wait
