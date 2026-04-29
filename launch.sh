#!/usr/bin/env bash
# ============================================================
#  NexusAI - Desktop Launch Script
#  Opens the app in your default browser after starting dev server
# ============================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}NexusAI Agent Platform${NC}"
echo ""

# Check .env exists
if [ ! -f .env ]; then
  echo "No .env file found. Run ./setup.sh first."
  exit 1
fi

# Check dependencies
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install --loglevel=error
fi

# Start dev server in background and open browser
echo -e "Starting dev server..."
echo -e "App will open at ${GREEN}http://localhost:5173${NC}"
echo ""

# Open browser after a short delay
(
  sleep 3
  if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:5173 2>/dev/null
  elif command -v open &>/dev/null; then
    open http://localhost:5173 2>/dev/null
  elif command -v sensible-browser &>/dev/null; then
    sensible-browser http://localhost:5173 2>/dev/null
  fi
) &

npm run dev
