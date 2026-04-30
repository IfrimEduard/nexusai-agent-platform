# NexusAI - Autonomous Agent Platform

A fully autonomous AI agent platform with skills, governance, limitations awareness, and self-evolution capabilities.

---

## Step-by-Step Setup (Windows 11)

### Step 1: Install Prerequisites

1. **Install Node.js** (if you don't have it)
   - Download from [https://nodejs.org](https://nodejs.org)
   - Choose the **LTS** version (v18 or newer)
   - Run the installer, keep all defaults
   - Verify: open Command Prompt, type `node -v` -- you should see a version number

2. **Create a Supabase account** (free)
   - Go to [https://supabase.com](https://supabase.com) and sign up
   - Create a new project (pick any name, set a strong password)
   - Wait for the project to finish provisioning (~2 minutes)

3. **Install Ollama** (optional, for local AI models)
   - Download from [https://ollama.com/download/windows](https://ollama.com/download/windows)
   - Run the installer
   - After install, open a terminal and pull a model: `ollama pull llama3.1`
   - Ollama runs in the background automatically on Windows

### Step 2: Clone the Repository

Open Command Prompt or PowerShell:

```bash
git clone https://github.com/IfrimEduard/nexusai-agent-platform.git
cd nexusai-agent-platform
```

### Step 3: Run Setup

**Double-click `setup.bat`** in File Explorer.

The script will:
1. Check Node.js and npm are installed
2. Install all npm dependencies
3. Create your `.env` config file
4. Open `.env` in Notepad for you to edit

### Step 4: Configure Supabase Credentials

When Notepad opens `.env`, fill in your real values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OLLAMA_URL=http://localhost:11434
```

**Where to find them:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click your project
3. Click **Settings** (gear icon) > **API**
4. Copy **Project URL** into `VITE_SUPABASE_URL`
5. Copy **anon/public** key into `VITE_SUPABASE_ANON_KEY`

Save the file and close Notepad. Then **run `setup.bat` again** to continue.

### Step 5: Run Database Migrations

In the Supabase Dashboard:
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/migrations/20260429055953_fix_rls_policies_remove_true_bypasses.sql` from this repo
4. Copy its contents, paste into the SQL Editor, click **Run**
5. Repeat for `supabase/migrations/20260429063803_seed_universal_agent_ecosystem_skills.sql`

### Step 6: Launch the App

**Double-click `launch.bat`** in File Explorer.

The app will open at [http://localhost:5173](http://localhost:5173) automatically.

### Step 7: Add Local Models (Optional)

1. Make sure Ollama is running (check system tray)
2. In the app, go to **Models** > **Local Models**
3. Three tabs are available:
   - **Detected** -- Scan and import models already running in Ollama
   - **Manual Import** -- Select model files (GGUF, safetensors, etc.) from your computer, or add custom Ollama model names
   - **Install New** -- Browse and pull popular models directly (llama3.1, mistral, gemma2, etc.)

---

## Quick Start (Linux / macOS)

```bash
chmod +x setup.sh && ./setup.sh
```

Then launch:

```bash
./launch.sh
```

---

## Prerequisites

| Requirement | Version | Required? | Install |
|-------------|---------|-----------|--------|
| Node.js | 18+ | Yes | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Yes (comes with Node) | Included |
| Supabase | Free tier | Yes | [supabase.com](https://supabase.com) |
| Ollama | Latest | Optional | [ollama.com](https://ollama.com) |
| Git | Latest | Yes | [git-scm.com](https://git-scm.com) |

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB (24 GB for local models) |
| Storage | 2 GB free | 50+ GB free (for local models) |
| GPU | Not required | NVIDIA with 8+ GB VRAM for local models |

---

## Local Models with Ollama

### Windows
1. Install from [ollama.com/download/windows](https://ollama.com/download/windows)
2. Open Command Prompt: `ollama pull llama3.1`
3. Ollama runs in the background automatically
4. In the app: **Models** > **Local Models** > **Scan**

### Linux / macOS
1. Install: `curl -fsSL https://ollama.com/install.sh | sh`
2. Pull a model: `ollama pull llama3.1`
3. Start: `ollama serve`
4. In the app: **Models** > **Local Models** > **Scan**

### Manual Import
- Go to **Models** > **Local Models** > **Manual Import**
- Select a GGUF/safetensors file from your computer
- Fill in model details (name, family, parameter size, quantization)
- Click **Import Model**

### Install New Models
- Go to **Models** > **Local Models** > **Install New**
- Browse popular models or search for one
- Click **Pull** to download via Ollama
- Or enter any model name from [ollama.com/library](https://ollama.com/library)

---

## Features

### Core System
- **Agent Chat** - Interactive conversation with the AI agent
- **Models** - Multi-model management with Ollama local model detection, manual import, and one-click install
- **Skills** - 68 skills across 17 layers
- **Plugins** - Extensible plugin system
- **Brain** - Agent reasoning and decision configuration

### Automation
- **Auto-Heal** - Self-healing rules for error recovery
- **Auto-Grow** - Growth and scaling rules
- **Auto-Learn** - Learning sessions and knowledge acquisition

### Evolution
- **Patterns** - Discovered behavioral patterns
- **Frameworks** - Agent methodologies and frameworks
- **Self-Evolve** - Agent evolution and self-improvement tracking

### Governance
- **Limitations Awareness** - 13 known AI limitations with severity, impact, and mitigation strategies
- **Approval Workflows** - Human-in-the-loop governance for sensitive actions
- **Governance Rules** - 15 default rules defining auto-approve vs human-approval actions
- **Spending Limits** - Budget controls with daily/monthly caps and alert thresholds
- **API Registry** - Discovered and registered external services
- **Action Log** - Comprehensive audit trail of all agent actions
- **Secrets Vault** - Secure credential storage

### Security
- Row Level Security (RLS) on all database tables
- Ownership-based access control using `auth.uid()`
- Private data isolation (chat messages, screen data, secrets)
- Shared-read with owner-write for governance data

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Icons**: Lucide React
- **AI Agent**: Custom agent framework with tool orchestration
- **Local Models**: Ollama integration

## Build for Production

```bash
npm run build
```

## License

MIT
