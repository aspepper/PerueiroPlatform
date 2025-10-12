#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR=${1:-}

if [[ -z "$DEPLOY_DIR" ]]; then
  echo "Usage: $0 <deploy-directory>" >&2
  exit 1
fi

if [[ ! -d "$DEPLOY_DIR" ]]; then
  echo "Deploy directory '$DEPLOY_DIR' does not exist." >&2
  exit 1
fi

PRISMA_CLIENT_DIR="$DEPLOY_DIR/node_modules/.prisma/client"
if [[ -d "$PRISMA_CLIENT_DIR" ]]; then
  # Preserve the Linux query engine. Prisma 6 renamed the binary to
  # "libquery_engine-debian-openssl-*.so.node", so instead of deleting
  # everything that does not contain "linux" we explicitly prune only the
  # binaries that target other platforms.
  find "$PRISMA_CLIENT_DIR" -maxdepth 1 -type f -name 'libquery_engine-*' \
    \( -name '*-darwin-*' -o -name '*-windows-*' \) -delete || true
  find "$PRISMA_CLIENT_DIR" -maxdepth 1 -type f -name 'libquery_engine-*' -name '*linux-musl*' -delete || true
  find "$PRISMA_CLIENT_DIR" -maxdepth 1 -type f -name 'migration-engine*' -delete || true
  find "$PRISMA_CLIENT_DIR" -maxdepth 1 -type f -name 'introspection-engine*' -delete || true
  find "$PRISMA_CLIENT_DIR" -maxdepth 1 -type f -name 'prisma-fmt*' -delete || true
fi

PRISMA_ENGINES_DIR="$DEPLOY_DIR/node_modules/@prisma/engines"
if [[ -d "$PRISMA_ENGINES_DIR" ]]; then
  find "$PRISMA_ENGINES_DIR" -maxdepth 1 -type f \
    \( -name 'libquery_engine-*' -o -name 'migration-engine*' -o -name 'introspection-engine*' -o -name 'prisma-fmt*' \) \
    \( -name '*-darwin-*' -o -name '*-windows-*' \) -delete || true
fi

# Remove Next.js build cache artifacts that are not required at runtime
if [[ -d "$DEPLOY_DIR/.next" ]]; then
  rm -rf "$DEPLOY_DIR/.next/cache"
fi

# Remove TypeScript source maps that are not needed at runtime
find "$DEPLOY_DIR" -type f -name '*.map' -delete || true

exit 0
