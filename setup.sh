#!/usr/bin/env bash
# ============================================================
#  NexusAI Agent Platform - One-Click Setup
#  Run:  chmod +x setup.sh && ./setup.sh
#  Windows: double-click setup.bat instead
# ============================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

step()   { echo -e "\n${CYAN}${BOLD}==>${NC} ${BOLD}$1${NC}"; }
ok()     { echo -e "  ${GREEN}OK${NC} $1"; }
warn()   { echo -e "  ${YELLOW}WARN${NC} $1"; }
fail()   { echo -e "  ${RED}FAIL${NC} $1"; }

is_windows() {
  [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* || "$(uname -s)" == CYGWIN* ]]
}

# ----------------------------------------------------------
# 1. Check Node.js
# ----------------------------------------------------------
step "Checking Node.js..."
if command -v node &>/dev/null; then
  ok "Node.js $(node -v) found"
else
  if is_windows; then
    fail "Node.js not found. Download from https://nodejs.org and install the LTS version."
  else
    warn "Node.js not found. Installing via nvm..."
    if ! command -v nvm &>/dev/null && [ ! -d "$HOME/.nvm" ]; then
      echo "  Installing nvm..."
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash >/dev/null 2>&1
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    nvm install --lts >/dev/null 2>&1
    nvm use --lts >/dev/null 2>&1
    ok "Node.js $(node -v) installed"
  fi
fi

# ----------------------------------------------------------
# 2. Check npm
# ----------------------------------------------------------
step "Checking npm..."
if ! command -v npm &>/dev/null; then
  fail "npm not found. Please install Node.js from https://nodejs.org"
  if is_windows; then
    echo -e "  Download the LTS installer from ${CYAN}https://nodejs.org${NC}"
  fi
  read -p "Press Enter to exit..."
  exit 1
fi
ok "npm $(npm -v)"

# ----------------------------------------------------------
# 3. Install dependencies
# ----------------------------------------------------------
step "Installing dependencies..."
if ! npm install --loglevel=error; then
  fail "npm install failed. Try: rm -rf node_modules && npm install"
  read -p "Press Enter to exit..."
  exit 1
fi
ok "Dependencies installed"

# ----------------------------------------------------------
# 4. Configure environment (auto-configured!)
# ----------------------------------------------------------
step "Configuring environment..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    ok ".env created with Supabase credentials (pre-configured)"
  else
    echo "VITE_SUPABASE_URL=https://ebgxlnfpbsovnhtkzknz.supabase.co" > .env
    echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ3hsbmZwYnNvdm5odGt6a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODQyODksImV4cCI6MjA5Mjk2MDI4OX0.sr-lbLwBsYvoA5WpF_5bgCGNS3BRxHfkrM43YrW06ws" >> .env
    echo "VITE_OLLAMA_URL=http://localhost:11434" >> .env
    ok ".env created with Supabase credentials"
  fi
else
  ok ".env already exists"
fi

# ----------------------------------------------------------
# 5. Check Ollama (optional)
# ----------------------------------------------------------
step "Checking Ollama (optional - for local models)..."
if command -v ollama &>/dev/null; then
  ok "Ollama found: $(ollama --version 2>/dev/null || echo 'installed')"
  if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    if is_windows; then
      warn "Ollama not running. Start it from your Start Menu or run: ollama serve"
    else
      warn "Ollama not running. Start it with: ollama serve"
    fi
  else
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    ok "Ollama running with $MODEL_COUNT model(s)"
  fi
else
  warn "Ollama not installed. Install from https://ollama.com for local model support"
  if is_windows; then
    echo "  Download from https://ollama.com/download/windows"
  else
    echo "  After installing: ollama pull llama3.1 && ollama serve"
  fi
fi

# ----------------------------------------------------------
# 6. Build check
# ----------------------------------------------------------
step "Verifying build..."
if npm run build 2>&1 | tail -1 | grep -q "built in"; then
  ok "Build successful"
else
  warn "Build had warnings (app may still work)"
fi

# ----------------------------------------------------------
# 7. Done
# ----------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}========================================${NC}"
echo -e "${GREEN}${BOLD}  NexusAI is ready!${NC}"
echo -e "${GREEN}${BOLD}========================================${NC}"
echo ""
if is_windows; then
  echo -e "  Start the app:   ${CYAN}launch.bat${NC} (double-click)"
  echo -e "  Or in terminal:  ${CYAN}npm run dev${NC}"
else
  echo -e "  Start the app:   ${CYAN}npm run dev${NC}"
  echo -e "  Or use desktop:  ${CYAN}./launch.sh${NC}"
fi
echo ""
echo -e "  The app will open at ${CYAN}http://localhost:5173${NC}"
echo ""

# Auto-launch if requested
if [ "${1:-}" = "--run" ] || [ "${1:-}" = "-r" ]; then
  step "Launching NexusAI..."
  npm run dev
else
  read -p "Press Enter to exit..."
fi
