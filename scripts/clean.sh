#!/usr/bin/env bash
set -e

echo "Cleaning build artifacts..."
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf backend/node_modules
rm -rf apps/*/dist
rm -rf backend/dist
rm -rf apps/*/.next
echo "Clean complete!"

