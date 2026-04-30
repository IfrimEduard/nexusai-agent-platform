# NexusAI - Autonomous Agent Platform

A fully autonomous AI agent platform with skills, governance, limitations awareness, and self-evolution capabilities.

---

## One-Click Setup (Windows)

### Step 1: Install Node.js

Download and install from [https://nodejs.org](https://nodejs.org) -- choose the **LTS** version. Keep all defaults.

### Step 2: Clone and Run

Open Command Prompt:

```bash
git clone https://github.com/IfrimEduard/nexusai-agent-platform.git
cd nexusai-agent-platform
```

Then **double-click `setup.bat`** in File Explorer. That's it.

The script automatically:
- Checks Node.js and npm
- Installs all dependencies
- Creates `.env` with pre-configured Supabase credentials
- Verifies the build

### Step 3: Run Database Migrations

In the [Supabase Dashboard](https://supabase.com/dashboard):
1. Click your project > **SQL Editor** > **New Query**
2. Copy the contents of `supabase/migrations/20260429055953_fix_rls_policies_remove_true_bypasses.sql` and click **Run**
3. Repeat for `supabase/migrations/20260429063803_seed_universal_agent_ecosystem_skills.sql`

### Step 4: Launch

**Double-click `launch.bat`** -- the app opens at [http://localhost:5173](http://localhost:5173).

---

## One-Click Setup (Linux / macOS)

```bash
git clone https://github.com/IfrimEduard/nexusai-agent-platform.git
cd nexusai-agent-platform
chmod +x setup.sh launch.sh
./setup.sh
```

Then launch:

```bash
./launch.sh
```

---

## Optional: Local AI Models with Ollama

1. Install from [ollama.com](https://ollama.com)
2. Pull a model: `ollama pull llama3.1`
3. In the app: **Models** > **Local Models** > **Scan**

You can also manually import GGUF/safetensors files or install models directly from [ollama.com/library](https://ollama.com/library) within the app.

---

## Prerequisites

| Requirement | Version | Required? | Install |
|-------------|---------|-----------|--------|
| Node.js | 18+ | Yes | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Yes (comes with Node) | Included |
| Git | Latest | Yes | [git-scm.com](https://git-scm.com) |
| Ollama | Latest | Optional | [ollama.com](https://ollama.com) |

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB (24 GB for local models) |
| Storage | 2 GB free | 50+ GB free (for local models) |
| GPU | Not required | NVIDIA with 8+ GB VRAM for local models |

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
