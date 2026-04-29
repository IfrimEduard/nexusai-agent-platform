#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  NexusAI Agent Platform - One-Click Setup
#  Run:  chmod +x setup.sh && ./setup.sh
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
fail()   { echo -e "  ${RED}FAIL${NC} $1"; exit 1; }

# ----------------------------------------------------------
# 1. Check Node.js
# ----------------------------------------------------------
step "Checking Node.js..."
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v)
  ok "Node.js $NODE_VERSION found"
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

# ----------------------------------------------------------
# 2. Check npm
# ----------------------------------------------------------
step "Checking npm..."
if ! command -v npm &>/dev/null; then
  fail "npm not found. Please install Node.js from https://nodejs.org"
fi
ok "npm $(npm -v)"

# ----------------------------------------------------------
# 3. Install dependencies
# ----------------------------------------------------------
step "Installing dependencies..."
npm install --loglevel=error
ok "Dependencies installed"

# ----------------------------------------------------------
# 4. Configure environment
# ----------------------------------------------------------
step "Configuring environment..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    warn ".env created from .env.example"
    echo ""
    echo -e "  ${YELLOW}${BOLD}ACTION REQUIRED:${NC}"
    echo -e "  Open ${BOLD}.env${NC} and fill in your Supabase credentials:"
    echo -e "  ${CYAN}VITE_SUPABASE_URL${NC}     = your project URL"
    echo -e "  ${CYAN}VITE_SUPABASE_ANON_KEY${NC} = your anon key"
    echo ""
    echo -e "  Get them from: ${CYAN}https://supabase.com/dashboard${NC} > Project Settings > API"
    echo ""

    # Check if we can open the file
    if command -v code &>/dev/null; then
      echo -e "  Opening .env in VS Code..."
      code .env 2>/dev/null || true
    elif command -v nano &>/dev/null; then
      echo -e "  Opening .env in nano..."
      nano .env
    else
      echo -e "  Edit .env manually, then re-run this script."
      exit 0
    fi
  else
    echo -e "  VITE_SUPABASE_URL=https://your-project-id.supabase.co" > .env
    echo -e "  VITE_SUPABASE_ANON_KEY=your-anon-key-here" >> .env
    echo -e "  VITE_OLLAMA_URL=http://localhost:11434" >> .env
    warn ".env created with placeholders - edit before continuing"
    exit 0
  fi
else
  ok ".env already exists"
fi

# Validate .env has real values (not placeholders)
if grep -q "your-project-id" .env 2>/dev/null || grep -q "your-anon-key-here" .env 2>/dev/null; then
  warn ".env still has placeholder values"
  echo -e "  Edit ${BOLD}.env${NC} with your real Supabase credentials, then re-run this script."
  exit 0
fi

# ----------------------------------------------------------
# 5. Check Ollama (optional)
# ----------------------------------------------------------
step "Checking Ollama (optional - for local models)..."
if command -v ollama &>/dev/null; then
  ok "Ollama found: $(ollama --version 2>/dev/null || echo 'installed')"
  if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    warn "Ollama not running. Start it with: ollama serve"
  else
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    ok "Ollama running with $MODEL_COUNT model(s)"
  fi
else
  warn "Ollama not installed. Install from https://ollama.com for local model support"
  echo "  After installing: ollama pull llama3.1 && ollama serve"
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
echo -e "${GREEN}${BOLD}  NexusAI Agent Platform is ready!${NC}"
echo -e "${GREEN}${BOLD}========================================${NC}"
echo ""
echo -e "  Start the app:   ${CYAN}npm run dev${NC}"
echo -e "  Or use desktop:  ${CYAN}./launch.sh${NC}"
echo ""
echo -e "  The app will open at ${CYAN}http://localhost:5173${NC}"
echo ""

# Auto-launch if requested
if [ "${1:-}" = "--run" ] || [ "${1:-}" = "-r" ]; then
  step "Launching NexusAI..."
  npm run dev
fi
