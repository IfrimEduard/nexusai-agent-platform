#!/usr/bin/env bash
# ============================================================
#  NexusAI - Desktop Launch Script
#  Starts the dev server and opens the app in your browser
#  Windows: double-click launch.bat instead
# ============================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

is_windows() {
  [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* || "$(uname -s)" == CYGWIN* ]]
}

echo -e "${CYAN}${BOLD}NexusAI Agent Platform${NC}"
echo ""

# Check .env exists
if [ ! -f .env ]; then
  echo -e "  ${YELLOW}No .env file found. Run setup.sh (or setup.bat on Windows) first.${NC}"
  read -p "Press Enter to exit..."
  exit 1
fi

# Check dependencies
if [ ! -d node_modules ]; then
  echo -e "  Installing dependencies..."
  npm install --loglevel=error
fi

# Check Ollama status
if command -v ollama &>/dev/null; then
  if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | python -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    echo -e "  ${GREEN}Ollama:${NC} running with ${MODEL_COUNT} model(s) available"
  else
    if is_windows; then
      echo -e "  ${YELLOW}Ollama:${NC} installed but not running (start from Start Menu or run: ollama serve)"
    else
      echo -e "  ${YELLOW}Ollama:${NC} installed but not running (start with: ollama serve)"
    fi
  fi
else
  if is_windows; then
    echo -e "  ${YELLOW}Ollama:${NC} not installed (optional - https://ollama.com/download/windows)"
  else
    echo -e "  ${YELLOW}Ollama:${NC} not installed (optional - for local models: https://ollama.com)"
  fi
fi

echo ""
echo -e "  Starting dev server..."
echo -e "  App will open at ${GREEN}http://localhost:5173${NC}"
echo -e "  Local models: ${CYAN}Models > Local Models${NC} to scan, import, or install"
echo ""

# Open browser after a short delay
(
  sleep 3
  if is_windows; then
    start http://localhost:5173 2>/dev/null
  elif command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:5173 2>/dev/null
  elif command -v open &>/dev/null; then
    open http://localhost:5173 2>/dev/null
  elif command -v sensible-browser &>/dev/null; then
    sensible-browser http://localhost:5173 2>/dev/null
  fi
) &

npm run dev
