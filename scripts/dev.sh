#!/usr/bin/env bash
set -e

echo "Starting backend..."
pnpm --filter backend dev &

echo "Starting dashboard..."
pnpm --filter dashboard dev

