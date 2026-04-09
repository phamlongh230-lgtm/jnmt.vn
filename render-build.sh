#!/usr/bin/env bash
set -e

echo ""
echo "======================================"
echo "   JNMT Student Hub — Render Build"
echo "======================================"
echo ""

echo "[1/5] Installing pnpm..."
npm install -g pnpm@9 --silent
echo "      pnpm $(pnpm --version) ready"

echo ""
echo "[2/5] Installing dependencies..."
pnpm install --no-frozen-lockfile --ignore-scripts=false

echo ""
echo "[3/5] Building frontend (React/Vite)..."
NODE_ENV=production BASE_PATH=/ PORT=3000 pnpm --filter @workspace/jnmt-hub run build
echo "      Frontend built -> artifacts/jnmt-hub/dist/public/"

echo ""
echo "[4/5] Building API server..."
pnpm --filter @workspace/api-server run build
echo "      API server built -> artifacts/api-server/dist/index.mjs"

echo ""
echo "[5/5] Pushing database schema..."
pnpm --filter @workspace/db run push-force
echo "      Database schema up to date"

echo ""
echo "======================================"
echo "   Build complete!"
echo "======================================"
echo ""

ls -lh artifacts/api-server/dist/index.mjs
ls -lh artifacts/jnmt-hub/dist/public/index.html
